import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';
import { Resend } from 'resend';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config: config.json for local dev, process.env for Vercel/production ──
let fileConfig = {};
try {
  fileConfig = JSON.parse(readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch { /* no config.json in production — using env vars */ }

const config = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || fileConfig.ANTHROPIC_API_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || fileConfig.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || fileConfig.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID || fileConfig.STRIPE_PRICE_ID || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || fileConfig.RESEND_API_KEY || '',
  RESEND_FROM: process.env.RESEND_FROM || fileConfig.RESEND_FROM || 'not ur regular hr <onboarding@resend.dev>',
  RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID || fileConfig.RESEND_AUDIENCE_ID || '13acb378-9a32-45c8-b256-64a3875581d6',
  APP_URL: process.env.APP_URL || fileConfig.APP_URL || 'http://localhost:5173',
  PORT: process.env.PORT || fileConfig.PORT || 3001,
};

// ── Startup validation ────────────────────────────────────────────────────
const configSource = process.env.ANTHROPIC_API_KEY ? 'environment variables' : 'config.json';
console.log(`Config loaded from: ${configSource}`);
if (!config.ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY is not set. Add it to Vercel Environment Variables.');
}
if (!config.STRIPE_SECRET_KEY || config.STRIPE_SECRET_KEY.includes('YOUR')) {
  console.warn('WARNING: STRIPE_SECRET_KEY is not configured - payment features disabled.');
}
console.log(`RESEND_API_KEY: ${config.RESEND_API_KEY ? 'SET (' + config.RESEND_API_KEY.slice(0, 8) + '...)' : 'NOT SET - emails will be skipped'}`);
console.log(`RESEND_FROM: ${config.RESEND_FROM}`);
if (config.RESEND_FROM.includes('onboarding@resend.dev')) {
  console.warn('WARNING: RESEND_FROM is using onboarding@resend.dev - Resend only allows this to send to your own Resend account email. Set RESEND_FROM to a verified domain address to send to real users.');
}

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const client = config.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: config.ANTHROPIC_API_KEY })
  : null;
const stripe = config.STRIPE_SECRET_KEY && !config.STRIPE_SECRET_KEY.includes('YOUR')
  ? new Stripe(config.STRIPE_SECRET_KEY)
  : null;
const resend = config.RESEND_API_KEY && !config.RESEND_API_KEY.includes('YOUR')
  ? new Resend(config.RESEND_API_KEY)
  : null;

// ── Email tracking helpers ─────────────────────────────────────────────────
const EMAILS_PATH = path.join(__dirname, 'emails.json');

function readEmails() {
  try {
    return JSON.parse(readFileSync(EMAILS_PATH, 'utf8'));
  } catch {
    return { used: [], paid: [] };
  }
}

function writeEmails(data) {
  try {
    writeFileSync(EMAILS_PATH, JSON.stringify(data, null, 2));
  } catch {
    // Vercel serverless: filesystem is read-only — email tracking is in-memory only
  }
}

// ── Stripe webhook MUST be before express.json() ───────────────────────────
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !config.STRIPE_WEBHOOK_SECRET || config.STRIPE_WEBHOOK_SECRET.includes('YOUR')) {
    return res.sendStatus(200);
  }
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email || session.metadata?.email;
    if (email) {
      const emails = readEmails();
      const normalised = email.toLowerCase().trim();
      if (!emails.paid.includes(normalised)) {
        emails.paid.push(normalised);
        writeEmails(emails);
      }
    }
  }
  res.sendStatus(200);
});

app.use(express.json());

const isProd = process.env.NODE_ENV === 'production';
if (isProd && !process.env.VERCEL) {
  // Self-hosted: serve built frontend from dist/
  app.use(express.static(path.join(__dirname, 'dist')));
}

// ── Create Stripe checkout session ────────────────────────────────────────
app.post('/api/create-checkout', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payment not configured. Add Stripe keys to config.json.' });
  }
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email.toLowerCase().trim(),
      line_items: [{ price: config.STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'payment',
      success_url: `${config.APP_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${config.APP_URL}?payment=cancelled`,
      metadata: { email: email.toLowerCase().trim() },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Verify payment after Stripe redirect ──────────────────────────────────
app.get('/api/verify-payment', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payment not configured.' });
  const { session_id, email } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id.' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      const emails = readEmails();
      const normalised = (email || session.customer_email || '').toLowerCase().trim();
      if (normalised && !emails.paid.includes(normalised)) {
        emails.paid.push(normalised);
        writeEmails(emails);
      }
      return res.json({ paid: true, email: normalised });
    }
    res.json({ paid: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Audience helper ───────────────────────────────────────────────────────
function extractFirstName(email) {
  const local = email.split('@')[0];
  const first = local.split(/[._\-+]/)[0];
  if (first && first.length >= 2 && /^[a-zA-Z]+$/.test(first)) {
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return null;
}

async function addToAudience(email) {
  if (!resend || !config.RESEND_AUDIENCE_ID) return;
  const firstName = extractFirstName(email);
  try {
    const result = await resend.contacts.create({
      audienceId: config.RESEND_AUDIENCE_ID,
      email,
      ...(firstName && { firstName }),
      unsubscribed: false,
    });
    console.log(`[Audience] Added ${email} to audience:`, result?.data?.id ?? JSON.stringify(result));
  } catch (err) {
    console.error(`[Audience] Failed to add ${email}:`, err.message);
  }
}

// ── Email helper ──────────────────────────────────────────────────────────
async function sendResultsEmail(to, jobTitle, data, isPaid) {
  console.log(`[Email] sendResultsEmail called — to: ${to}, jobTitle: ${jobTitle}, isPaid: ${isPaid}`);
  if (!resend) {
    console.log('[Email] Resend client is null — RESEND_API_KEY not set or invalid. Skipping email.');
    return;
  }

  const score = data.scores?.overall ?? '—';
  const headline = data.firstImpression?.headline ?? '';
  const verdict = data.firstImpression?.hirabilityVerdict ?? '';
  const coreDisconnect = data.hardTruth?.coreDisconnect ?? '';
  const linkedinHeadline = data.positioningStrategy?.linkedinHeadline ?? '';
  const keywordsToOwn = (data.positioningStrategy?.keywordsToOwn ?? []).slice(0, 5).join(', ');
  const atsRisk = data.atsRisk?.riskLevel ?? '';
  const quickFixes = (data.atsRisk?.quickFixes ?? []).slice(0, 3);
  const appUrl = config.APP_URL || 'https://resume-real-talk.vercel.app';

  const scoreColor = score >= 80 ? '#2D5016' : score >= 65 ? '#4A7228' : score >= 50 ? '#8B6914' : '#8B3A2E';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F7F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0A0A0A;border-radius:12px 12px 0 0;padding:28px 36px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7A6020;font-family:monospace;">career positioning analysis</p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;">not ur regular hr</p>
        </td></tr>

        <!-- Score block -->
        <tr><td style="background:#FFFFFF;padding:36px 36px 28px;border-left:1px solid #E8E8E4;border-right:1px solid #E8E8E4;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#9C9C96;">your overall score</p>
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:56px;font-weight:700;color:${scoreColor};letter-spacing:-0.04em;line-height:1;">${score}</td>
            <td style="font-size:18px;color:#9C9C96;padding:28px 0 0 4px;">/100</td>
          </tr></table>
          <p style="margin:12px 0 0;font-size:15px;font-weight:600;color:#0A0A0A;">${headline}</p>
          ${verdict ? `<p style="margin:8px 0 0;font-size:14px;color:#5C5C58;line-height:1.6;">${verdict}</p>` : ''}
        </td></tr>

        <!-- Hard truth -->
        ${coreDisconnect ? `<tr><td style="background:#FFFFFF;padding:0 36px 28px;border-left:1px solid #E8E8E4;border-right:1px solid #E8E8E4;">
          <div style="background:#F7F7F5;border-left:3px solid #8B3A2E;border-radius:0 8px 8px 0;padding:16px 18px;">
            <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#8B3A2E;font-weight:600;">the hard truth</p>
            <p style="margin:0;font-size:13px;color:#0A0A0A;line-height:1.65;">${coreDisconnect}</p>
          </div>
        </td></tr>` : ''}

        <!-- ATS risk + quick fixes -->
        ${quickFixes.length ? `<tr><td style="background:#FFFFFF;padding:0 36px 28px;border-left:1px solid #E8E8E4;border-right:1px solid #E8E8E4;">
          <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#9C9C96;">ats risk: <span style="color:${atsRisk === 'Low' ? '#2D5016' : atsRisk === 'Medium' ? '#8B6914' : '#8B3A2E'};font-weight:700;">${atsRisk}</span></p>
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#5C5C58;">Quick fixes:</p>
          <ul style="margin:0;padding-left:18px;">
            ${quickFixes.map(f => `<li style="font-size:13px;color:#0A0A0A;line-height:1.6;margin-bottom:4px;">${f}</li>`).join('')}
          </ul>
        </td></tr>` : ''}

        <!-- LinkedIn headline -->
        ${linkedinHeadline ? `<tr><td style="background:#FFFFFF;padding:0 36px 28px;border-left:1px solid #E8E8E4;border-right:1px solid #E8E8E4;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#9C9C96;">rewrite your linkedin headline to:</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#7A6020;">${linkedinHeadline}</p>
        </td></tr>` : ''}

        <!-- Keywords -->
        ${keywordsToOwn ? `<tr><td style="background:#FFFFFF;padding:0 36px 28px;border-left:1px solid #E8E8E4;border-right:1px solid #E8E8E4;">
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#9C9C96;">keywords to own for ${jobTitle}</p>
          <p style="margin:0;font-size:13px;color:#0A0A0A;">${keywordsToOwn}</p>
        </td></tr>` : ''}

        <!-- CTA -->
        <tr><td style="background:#FFFFFF;padding:0 36px 36px;border-left:1px solid #E8E8E4;border-right:1px solid #E8E8E4;border-bottom:1px solid #E8E8E4;border-radius:0 0 12px 12px;">
          ${!isPaid ? `<div style="background:#F7F7F5;border:1px solid #E8E8E4;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7A6020;font-weight:600;">want the full breakdown?</p>
            <p style="margin:0 0 14px;font-size:13px;color:#5C5C58;line-height:1.6;">LinkedIn rewrite, 30-day visibility plan, 5 targeted rewrites — $39 AUD one-time.</p>
            <a href="${appUrl}" style="display:inline-block;background:#0A0A0A;color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;">Unlock full report →</a>
          </div>` : `<div style="background:#F0F4EC;border:1px solid rgba(45,80,22,0.2);border-radius:10px;padding:16px 24px;margin-bottom:20px;">
            <p style="margin:0;font-size:13px;color:#2D5016;font-weight:600;">You have the full paid report — check your results for the complete LinkedIn rewrite and 30-day plan.</p>
          </div>`}
          <a href="${appUrl}" style="font-size:12px;color:#9C9C96;">View your full analysis at noturegularhr.com</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9C9C96;">not ur regular hr &mdash; on your side, not lying to you about it.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  console.log(`[Email] Sending from: ${config.RESEND_FROM} to: ${to}`);
  try {
    const result = await resend.emails.send({
      from: config.RESEND_FROM,
      to,
      subject: `Your resume positioning report - ${jobTitle} (Score: ${score}/100)`,
      html,
    });
    console.log('[Email] Resend response:', JSON.stringify(result));
    if (result.error) {
      console.error('[Email] Resend returned an error:', JSON.stringify(result.error));
    } else {
      console.log('[Email] Sent successfully, id:', result.data?.id);
    }
  } catch (err) {
    console.error('[Email] resend.emails.send threw:', err.message, '| statusCode:', err.statusCode, '| full:', JSON.stringify(err));
    throw err;
  }
}

// ── Analysis endpoint ──────────────────────────────────────────────────────
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  if (!client) return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not configured. Add it to Vercel Environment Variables.' });
  try {
    const { jobTitle, roleCategory, company, email, testPaid } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No resume uploaded.' });
    if (!jobTitle) return res.status(400).json({ error: 'Job title is required.' });
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const isTestPaid = testPaid === 'true';
    if (isTestPaid) console.log('[Test] test=paid flag active — bypassing paywall and generating full paid report');

    const normalised = email.toLowerCase().trim();
    const emails = readEmails();
    const alreadyUsed = emails.used.includes(normalised);
    const isPaid = isTestPaid || emails.paid.includes(normalised);

    if (alreadyUsed && !isPaid) {
      return res.json({ paywalled: true });
    }

    const pdfData = await pdf(req.file.buffer);
    const resumeText = pdfData.text
      .trim()
      .replace(/[ --]/g, ' ')
      .replace(/\r\n/g, '\n')
      .slice(0, 8000);
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Could not extract text from this PDF. Make sure it is not a scanned image.' });
    }

    const companyCtx = company ? `Target Company: ${company}` : 'No specific company specified.';
    const roleCtx = roleCategory && roleCategory !== 'custom' ? `Role Category: ${roleCategory}` : '';
    const rewriteCount = isPaid ? 5 : 3;

    const paidSections = isPaid ? `
  "linkedInRewrite": {
    "headline": "<rewritten LinkedIn headline targeting ${jobTitle}, punchy and keyword-rich>",
    "aboutSection": "<full rewritten About section — 3-4 paragraphs, first-person, strategic, specific to this person's background and target role. No cliches.>",
    "experienceFraming": "<how to reframe 2-3 key roles on their LinkedIn to land for a ${jobTitle} reader — specific to their actual experience>",
    "featuredSection": "<specific recommendation for what to pin in the LinkedIn Featured section and why>"
  },
  "thirtyDayPlan": {
    "week1": { "title": "<week 1 focus theme>", "tasks": ["<specific action>", "<specific action>", "<specific action>"] },
    "week2": { "title": "<week 2 focus theme>", "tasks": ["<specific action>", "<specific action>", "<specific action>"] },
    "week3": { "title": "<week 3 focus theme>", "tasks": ["<specific action>", "<specific action>", "<specific action>"] },
    "week4": { "title": "<week 4 focus theme>", "tasks": ["<specific action>", "<specific action>", "<specific action>"] }
  },` : '';

    const prompt = `You are the AI powering "not ur regular hr" — a career positioning and hiring perception tool used by ambitious professionals, founders, operators, and senior leaders. You think like an elite recruiter who has seen 10,000 resumes, a seasoned hiring manager who makes split-second decisions, and a strategic advisor who genuinely wants this person to win.

Your feedback is high-context, specific, psychologically sharp, and honest without being cruel. You explain WHY things hurt, what signal they send, and how to fix them. You never give generic resume advice.

RESUME TEXT:
---
${resumeText}
---

TARGET JOB TITLE: ${jobTitle}
${roleCtx}
${companyCtx}

Analyse this resume through the lens of a hiring decision-maker evaluating a ${jobTitle} candidate.

Return EXACTLY this JSON structure. No markdown fences, no extra text, only valid JSON:

{
  "scores": {
    "atsCompatibility": { "score": <0-100>, "insight": "<one sentence — specific to their resume, not generic>" },
    "executivePresence": { "score": <0-100>, "insight": "<one sentence>" },
    "clarity": { "score": <0-100>, "insight": "<one sentence>" },
    "strategicPositioning": { "score": <0-100>, "insight": "<one sentence>" },
    "credibilitySignals": { "score": <0-100>, "insight": "<one sentence>" },
    "impactEvidence": { "score": <0-100>, "insight": "<one sentence>" },
    "industryTranslation": { "score": <0-100>, "insight": "<one sentence>" },
    "overall": <integer — weighted average, weight executivePresence and strategicPositioning higher for senior roles>
  },
  "firstImpression": {
    "headline": "<4-7 word phrase capturing the recruiter's immediate read>",
    "sixSecondRead": "<What a hiring manager actually thinks in their first 6 seconds — specific, written in first person as the hiring manager, 2-3 sentences>",
    "immediateSignals": ["<specific positive signal from the resume>", "<another specific positive signal>"],
    "visualGaps": ["<specific structural or formatting gap>", "<another>"],
    "hirabilityVerdict": "<one punchy, honest sentence on first-impression hireability for this specific role>"
  },
  "executivePresence": {
    "presenceRating": "<Strong | Developing | Weak>",
    "languageAnalysis": "<how their specific language choices signal — or fail to signal — seniority and strategic thinking, 2-3 sentences>",
    "presenceSignals": ["<specific thing in their resume that signals leadership>", "<another>"],
    "presenceGaps": ["<specific absence that would signal executive presence>", "<another>"],
    "repositioningAdvice": "<specific, actionable advice on elevating language and positioning for this exact role, 2-3 sentences>"
  },
  "atsRisk": {
    "riskLevel": "<Low | Medium | High | Critical>",
    "keywordGaps": ["<specific keyword missing for a ${jobTitle} role>", "<another>", "<another>"],
    "formattingIssues": ["<specific formatting problem>", "<another>"],
    "quickFixes": ["<specific fix — actionable, not vague>", "<another>", "<another>"]
  },
  "hardTruth": {
    "coreDisconnect": "<The main gap between what this resume signals and what a ${jobTitle} role demands — specific, 2-3 sentences, no filler>",
    "whatRecruitersActuallySee": "<First person recruiter perspective on this specific resume, 2-3 sentences>",
    "unintentionalSignals": ["<something this resume signals that the candidate almost certainly doesn't intend>", "<another>"],
    "whereExperienceGetsLost": "<specific explanation of where strong experience is being undersold or lost in translation — explain the psychological reason, 2-3 sentences>"
  },
  "hiddenAdvantages": {
    "overlookedStrengths": ["<specific strength being undersold — quote or reference something real from the resume>", "<another>", "<another>"],
    "uniquePositioning": "<what makes this person genuinely differentiated that isn't coming through clearly, 2-3 sentences>",
    "howToAmplify": ["<specific action to amplify overlooked strength 1>", "<specific action 2>"]
  },
  "industryTranslation": {
    "translationGaps": ["<specific place where their experience doesn't land clearly for a ${jobTitle} reader>", "<another>"],
    "languageToAdopt": ["<specific term, phrase, or framing to adopt for this role>", "<another>", "<another>"],
    "reframingSuggestions": ["<how to reframe a specific experience or achievement for this context>", "<another>"]
  },
  "rewriteSuggestions": [
    {
      "section": "<e.g. 'Professional Summary', 'Role Title at [Company]', 'Key Achievement'>",
      "originalText": "<quote the actual text from their resume>",
      "issue": "<the specific problem with this text>",
      "whyItHurts": "<the psychological or perceptual reason this damages their candidacy>",
      "direction": "<what the rewrite needs to accomplish to fix this>"
    }${rewriteCount === 5 ? `,
    { "section": "<different section>", "originalText": "<quote>", "issue": "<issue>", "whyItHurts": "<why>", "direction": "<direction>" },
    { "section": "<different section>", "originalText": "<quote>", "issue": "<issue>", "whyItHurts": "<why>", "direction": "<direction>" },
    { "section": "<different section>", "originalText": "<quote>", "issue": "<issue>", "whyItHurts": "<why>", "direction": "<direction>" },
    { "section": "<different section>", "originalText": "<quote>", "issue": "<issue>", "whyItHurts": "<why>", "direction": "<direction>" }` : `,
    { "section": "<different section>", "originalText": "<quote>", "issue": "<issue>", "whyItHurts": "<why>", "direction": "<direction>" },
    { "section": "<different section>", "originalText": "<quote>", "issue": "<issue>", "whyItHurts": "<why>", "direction": "<direction>" }`}
  ],
  "networkingStrategy": {
    "targetTitles": ["<specific job title of an ideal connector for this role>", "<another>", "<another>"],
    "approachStrategy": "<specific, non-generic warm outreach strategy for this exact role and context, 2-3 sentences>",
    "communities": ["<specific Slack/Discord/LinkedIn community for this role or industry>", "<another>"],
    "events": ["<specific type of recurring event or conference to attend>", "<another>"],
    "connectionTemplate": "<ready-to-send LinkedIn connection request message — under 280 characters, sounds human not salesy, specific to a ${jobTitle} role>"
  },
  "positioningStrategy": {
    "narrativeAngle": "<the specific positioning angle this person should own for a ${jobTitle} role — what their unique story is, 2-3 sentences>",
    "linkedinHeadline": "<specific rewritten LinkedIn headline targeting this role>",
    "elevatorPitch": "<a tight 2-sentence elevator pitch for this person for this role>",
    "keywordsToOwn": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
  }${isPaid ? `,\n${paidSections}` : ''}
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: isPaid ? 12000 : 8000,
      system: 'You are an elite career positioning analyst. Return only valid JSON — no markdown, no preamble, no explanation.',
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Failed to parse AI response.');
      parsed = JSON.parse(match[0]);
    }

    if (!alreadyUsed) {
      emails.used.push(normalised);
      writeEmails(emails);
    }

    // Add to Resend audience — fire and forget
    addToAudience(normalised);

    // Send results email — fire and forget, never block the response
    sendResultsEmail(normalised, jobTitle, parsed, isPaid).catch(err =>
      console.error('[Email] Fire-and-forget failed:', err.message, err.statusCode, JSON.stringify(err))
    );

    res.json({ success: true, data: parsed, isPaid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Something went wrong. Try again.' });
  }
});

// ── Rewrite endpoint ───────────────────────────────────────────────────────
app.post('/api/rewrite', async (req, res) => {
  try {
    const { section, originalText, whyItHurts, direction, jobTitle } = req.body;
    if (!originalText || !jobTitle) return res.status(400).json({ error: 'Missing required fields.' });

    const prompt = `You are an elite resume writer for "not ur regular hr." Rewrite the following resume section in 4 distinct styles for a ${jobTitle} role.

SECTION: ${section}
ORIGINAL TEXT: "${originalText}"
PROBLEM: ${whyItHurts}
GOAL: ${direction}

Return exactly this JSON (no markdown, no extra text):
{
  "ats": "<ATS-optimized version — strong action verb + quantified outcome + relevant keywords. Clean, scannable, metric-driven.>",
  "executive": "<Executive-level version — strategic framing, outcome-focused, signals ownership and authority. Board-room language.>",
  "startup": "<Startup/founder-style version — punchy, results-obsessed, zero corporate fluff. Direct and credible.>",
  "concise": "<Ultra-concise version — maximum signal in minimum words. Under 20 words. No filler.>"
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: 'Return only valid JSON. No markdown fences.',
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Failed to parse rewrite response.');
      parsed = JSON.parse(match[0]);
    }
    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Rewrite failed.' });
  }
});

// ── SPA fallback (self-hosted production only) ────────────────────────────
if (isProd && !process.env.VERCEL) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// ── Start server (local dev / self-hosted only — Vercel uses export default) ──
if (!process.env.VERCEL) {
  app.listen(config.PORT, () => console.log(`not ur regular hr API on http://localhost:${config.PORT}`));
}

export default app;
