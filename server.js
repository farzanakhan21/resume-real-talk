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
} catch { /* no config.json in production - using env vars */ }

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
    // Vercel serverless: filesystem is read-only - email tracking is in-memory only
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
  console.log(`[Email] sendResultsEmail called - to: ${to}, jobTitle: ${jobTitle}, isPaid: ${isPaid}`);
  if (!resend) {
    console.log('[Email] Resend client is null - RESEND_API_KEY not set or invalid. Skipping email.');
    return;
  }

  const firstName = extractFirstName(to) || 'there';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F7F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0A0A0A;border-radius:12px 12px 0 0;padding:28px 36px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7C3AED;font-family:monospace;">not ur regular hr</p>
          <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;">roast my resume</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#FFFFFF;padding:40px 36px 36px;border-left:1px solid #E8E8E4;border-right:1px solid #E8E8E4;border-bottom:1px solid #E8E8E4;border-radius:0 0 12px 12px;">
          <p style="margin:0 0 22px;font-size:15px;color:#0A0A0A;line-height:1.75;">hey ${firstName},</p>
          <p style="margin:0 0 22px;font-size:15px;color:#0A0A0A;line-height:1.75;">I built this tool because most career advice is generic. vague. written for everyone, which means it helps no one.</p>
          <p style="margin:0 0 22px;font-size:15px;color:#0A0A0A;line-height:1.75;">this is the advice I'd give you if you were my friend.</p>
          <p style="margin:0 0 22px;font-size:15px;color:#0A0A0A;line-height:1.75;">what did the feedback bring up for you? anything you're going to change?</p>
          <p style="margin:0 0 36px;font-size:15px;color:#0A0A0A;line-height:1.75;">hit reply - I read and respond to every single one.</p>
          <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0A0A0A;letter-spacing:-0.01em;">farzana</p>
          <p style="margin:0 0 36px;font-size:10px;letter-spacing:0.13em;text-transform:uppercase;color:#7C3AED;font-family:monospace;">not ur regular hr</p>
          <p style="margin:0;font-size:11px;color:#9CA3AF;letter-spacing:0.04em;border-top:1px solid #E5E7EB;padding-top:24px;">built different. because you deserve better than a template.</p>
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
      subject: `your resume roast is ready 🔥`,
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
    const { jobTitle, roleCategory, industry, company, email, testPaid } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No resume uploaded.' });
    if (!jobTitle) return res.status(400).json({ error: 'Job title is required.' });
    if (!industry) return res.status(400).json({ error: 'Industry is required.' });
    if (!company) return res.status(400).json({ error: 'Target company is required.' });
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const isTestPaid = testPaid === 'true';
    if (isTestPaid) console.log('[Test] test=paid flag active - bypassing paywall and generating full paid report');

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

    const companyCtx = `Target Company: ${company}`;
    const roleCtx = roleCategory && roleCategory !== 'custom' ? `Role Category: ${roleCategory}` : '';
    const industryCtx = industry ? `Industry: ${industry}` : '';
    const rewriteCount = isPaid ? 5 : 3;

    const paidSections = isPaid ? `
  "linkedInRewrite": {
    "headline": "<rewritten LinkedIn headline targeting ${jobTitle}, punchy and keyword-rich>",
    "aboutSection": "<full rewritten About section - 3-4 paragraphs, first-person, strategic, specific to this person's background and target role. No cliches.>",
    "experienceFraming": "<how to reframe 2-3 key roles on their LinkedIn to land for a ${jobTitle} reader - specific to their actual experience>",
    "featuredSection": "<specific recommendation for what to pin in the LinkedIn Featured section and why>"
  },
  "thirtyDayPlan": {
    "week1": { "title": "<week 1 focus theme>", "tasks": ["<specific action>", "<specific action>", "<specific action>"] },
    "week2": { "title": "<week 2 focus theme>", "tasks": ["<specific action>", "<specific action>", "<specific action>"] },
    "week3": { "title": "<week 3 focus theme>", "tasks": ["<specific action>", "<specific action>", "<specific action>"] },
    "week4": { "title": "<week 4 focus theme>", "tasks": ["<specific action>", "<specific action>", "<specific action>"] }
  },` : '';

    const prompt = `You are the AI powering "Roast My Resume" by not ur regular hr. You think like a recruiter who has seen 10,000 resumes and has no patience for mediocrity, a hiring manager who makes decisions in 6 seconds and won't apologise for it, and a brutally honest advisor who respects the person enough to tell them the truth nobody else will.

Your feedback is uncomfortably specific. You name the exact problem, not a softened version of it. You call out weak language by quoting it directly. You explain the psychological damage — what signal it sends, what it makes a recruiter assume, why it costs them the shortlist. You do not encourage. You do not motivate. You diagnose.

The free report exists to make people uncomfortable enough to want the full fix. It should sting — not cruelly, but with the specific sting of recognising something true that you've been avoiding. Think: a friend who works in hiring who finally tells you what everyone has been thinking but not saying.

NEVER soften the truth. NEVER say "while there are strengths..." NEVER end a criticism with a compliment. If something is weak, say it is weak and explain exactly why. If the resume would get binned in 6 seconds, say that. Quote the actual language from their resume when calling it out — don't be vague.

RESUME TEXT:
---
${resumeText}
---

TARGET JOB TITLE: ${jobTitle}
${roleCtx}
${industryCtx}
${companyCtx}

Analyse this resume through the lens of a hiring decision-maker evaluating a ${jobTitle} candidate${industry ? ` in the ${industry} industry` : ''}.

Return EXACTLY this JSON structure. No markdown fences, no extra text, only valid JSON:

{
  "scores": {
    "atsCompatibility": { "score": <0-100>, "insight": "<one sentence - specific to their resume, not generic>" },
    "executivePresence": { "score": <0-100>, "insight": "<one sentence>" },
    "clarity": { "score": <0-100>, "insight": "<one sentence>" },
    "strategicPositioning": { "score": <0-100>, "insight": "<one sentence>" },
    "credibilitySignals": { "score": <0-100>, "insight": "<one sentence>" },
    "impactEvidence": { "score": <0-100>, "insight": "<one sentence>" },
    "industryTranslation": { "score": <0-100>, "insight": "<one sentence>" },
    "overall": <integer - SCORING CALIBRATION: most real-world resumes score 40-65. Truly exceptional resumes score 75-85. Above 85 is extremely rare and only for near-perfect resumes. Weight executivePresence and strategicPositioning higher for senior roles>,
    "brutalOneLiner": "<a sharp, specific one-liner naming the single most damaging truth about this resume — written to sting with recognition, not cruelty. Quote or reference something real from the resume. Make it feel personal. e.g. 'Ten years of impact buried under job descriptions nobody asked for' or 'Every bullet reads like a duty list — zero evidence you've ever moved a number' or 'Looks like a CV written for a role you already left, not the one you're chasing'. NEVER generic. NEVER encouraging.>"
  },
  "topIssues": [
    "<5-8 word headline naming the most critical issue — specific and uncomfortable, quote resume language where possible, no softening, no solution>",
    "<second most critical issue — name the exact problem, not a category of problem>",
    "<third most critical issue — must be specific to this resume, not generic advice>"
  ],
  "firstImpression": {
    "headline": "<4-7 word phrase capturing the recruiter's immediate read>",
    "sixSecondRead": "<What a hiring manager actually thinks in their first 6 seconds — written in first person as a busy, skeptical hiring manager. Be specific about what they see, what they assume, and what makes them hesitate or scroll past. Do not be kind. 2-3 sentences.>",
    "immediateSignals": ["<specific positive signal from the resume>", "<another specific positive signal>"],
    "visualGaps": ["<specific structural or formatting gap>", "<another>"],
    "hirabilityVerdict": "<one blunt sentence on first-impression hireability for this specific role — no hedging, no 'potential', no encouragement. If it's not there yet, say so directly.>"
  },
  "executivePresence": {
    "presenceRating": "<Strong | Developing | Weak>",
    "languageAnalysis": "<how their specific language choices signal - or fail to signal - seniority and strategic thinking, 2-3 sentences>",
    "presenceSignals": ["<specific thing in their resume that signals leadership>", "<another>"],
    "presenceGaps": ["<specific absence that would signal executive presence>", "<another>"],
    "repositioningAdvice": "<specific, actionable advice on elevating language and positioning for this exact role, 2-3 sentences>"
  },
  "atsRisk": {
    "riskLevel": "<Low | Medium | High | Critical>",
    "keywordGaps": ["<specific keyword missing for a ${jobTitle} role>", "<another>", "<another>"],
    "formattingIssues": ["<specific formatting problem>", "<another>"],
    "quickFixes": ["<specific fix - actionable, not vague>", "<another>", "<another>"]
  },
  "hardTruth": {
    "coreDisconnect": "<The main gap between what this resume signals and what a ${jobTitle} role demands — be direct about what's missing or misaligned. Name it, don't dance around it. 2-3 sentences, no filler, no softening.>",
    "whatRecruitersActuallySee": "<First person recruiter perspective on this specific resume — what they assume about this person, what red flags they clock, what questions it raises. Written as internal monologue, not as advice. 2-3 sentences.>",
    "unintentionalSignals": ["<something this resume unintentionally signals — quote the specific language or structure causing it>", "<another unintentional signal with the specific evidence from the resume>"],
    "whereExperienceGetsLost": "<specific explanation of where strong experience is being buried, diluted, or mistranslated — name the exact section or pattern, explain the psychological damage it does, 2-3 sentences>"
  },
  "hiddenAdvantages": {
    "overlookedStrengths": ["<specific strength being undersold - quote or reference something real from the resume>", "<another>", "<another>"],
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
    "connectionTemplate": "<ready-to-send LinkedIn connection request message - under 280 characters, sounds human not salesy, specific to a ${jobTitle} role>"
  },
  "positioningStrategy": {
    "narrativeAngle": "<the specific positioning angle this person should own for a ${jobTitle} role - what their unique story is, 2-3 sentences>",
    "linkedinHeadline": "<specific rewritten LinkedIn headline targeting this role>",
    "elevatorPitch": "<a tight 2-sentence elevator pitch for this person for this role>",
    "keywordsToOwn": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"]
  }${isPaid ? `,\n${paidSections}` : ''}
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: isPaid ? 12000 : 8000,
      system: 'You are a brutally honest career analyst powering "Roast My Resume". Return only valid JSON - no markdown, no preamble, no explanation. Be specific, uncomfortable, and direct — name exact problems, quote actual resume language, never soften. SCORING CALIBRATION: most real-world resumes score 40-65 out of 100. Truly exceptional resumes score 75-85. Scores above 85 are extremely rare.',
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

    // Decode HTML entities the AI sometimes includes in string values
    const decodeEntities = (s) => typeof s === 'string'
      ? s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
      : s;
    const decodeDeep = (v) => {
      if (typeof v === 'string') return decodeEntities(v);
      if (Array.isArray(v)) return v.map(decodeDeep);
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, decodeDeep(val)]));
      return v;
    };
    parsed = decodeDeep(parsed);

    if (!alreadyUsed) {
      emails.used.push(normalised);
      writeEmails(emails);
    }

    // Add to Resend audience - fire and forget
    addToAudience(normalised);

    // Send results email - fire and forget, never block the response
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
  "ats": "<ATS-optimised version - strong action verb + quantified outcome + relevant keywords. Clean, scannable, metric-driven.>",
  "executive": "<Executive-level version - strategic framing, outcome-focused, signals ownership and authority. Board-room language.>",
  "startup": "<Startup/founder-style version - punchy, results-obsessed, zero corporate BS. Direct and credible.>",
  "concise": "<Ultra-concise version - maximum signal in minimum words. Under 20 words. No filler.>"
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

// ── Start server (local dev / self-hosted only - Vercel uses export default) ──
if (!process.env.VERCEL) {
  app.listen(config.PORT, () => console.log(`not ur regular hr API on http://localhost:${config.PORT}`));
}

export default app;
