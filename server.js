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
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || fileConfig.ADMIN_PASSWORD || '',
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

// ── Analysis tracking helpers ──────────────────────────────────────────────
const ANALYSES_PATH = path.join(__dirname, 'analyses.json');

function readAnalyses() {
  try {
    return JSON.parse(readFileSync(ANALYSES_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function writeAnalysis(entry) {
  try {
    const list = readAnalyses();
    list.push(entry);
    writeFileSync(ANALYSES_PATH, JSON.stringify(list, null, 2));
  } catch {
    // Vercel serverless: filesystem is read-only
  }
}

// ── Admin auth helpers ─────────────────────────────────────────────────────
function parseCookies(req) {
  const cookies = {};
  const header = req.headers.cookie;
  if (!header) return cookies;
  header.split(';').forEach(part => {
    const [key, ...vals] = part.trim().split('=');
    cookies[key.trim()] = decodeURIComponent(vals.join('='));
  });
  return cookies;
}

function isAdminAuthed(req) {
  const pw = config.ADMIN_PASSWORD;
  if (!pw) return false;
  const cookies = parseCookies(req);
  return cookies['nrhr_admin'] === pw;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
app.use(express.urlencoded({ extended: false }));

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
  const { email, promoCode } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });

  try {
    // Resolve promo code to a Stripe promotion code ID if provided
    let discounts;
    if (promoCode && promoCode.trim()) {
      const promoCodes = await stripe.promotionCodes.list({
        code: promoCode.trim().toUpperCase(),
        active: true,
        limit: 1,
      });
      if (promoCodes.data.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired promo code. Please check and try again.' });
      }
      discounts = [{ promotion_code: promoCodes.data[0].id }];
      console.log(`[Promo] Applied code "${promoCode.trim()}" → ${promoCodes.data[0].id}`);
    }

    const sessionParams = {
      payment_method_types: ['card'],
      customer_email: email.toLowerCase().trim(),
      line_items: [{ price: config.STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'payment',
      success_url: `${config.APP_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${config.APP_URL}?payment=cancelled`,
      metadata: { email: email.toLowerCase().trim() },
    };

    // discounts and allow_promotion_codes are mutually exclusive in Stripe
    if (discounts) {
      sessionParams.discounts = discounts;
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
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
          <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#2D1B69;font-family:monospace;">not ur regular hr</p>
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
          <p style="margin:0 0 36px;font-size:10px;letter-spacing:0.13em;text-transform:uppercase;color:#2D1B69;font-family:monospace;">not ur regular hr</p>
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
    const { jobTitle, roleCategory, industry, department, company, email, testPaid, careerSituation, timeframe, previousIndustry } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
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
    const documentText = pdfData.text
      .trim()
      .replace(/[ --]/g, ' ')
      .replace(/\r\n/g, '\n')
      .slice(0, 8000);
    if (!documentText || documentText.length < 50) {
      return res.status(400).json({ error: 'Could not extract text from this PDF. Make sure it is not a scanned image.' });
    }

    // Detect whether this is a LinkedIn profile PDF or a traditional resume
    const isLinkedIn = /linkedin\.com|linkedin profile|connections|followers|about\s*\n/i.test(documentText.slice(0, 1000));
    const documentType = isLinkedIn ? 'LinkedIn profile PDF' : 'resume';

    const companyCtx = `Target Company: ${company}`;
    const roleCtx = roleCategory && roleCategory !== 'custom' ? `Role: ${roleCategory}` : '';
    const industryCtx = industry ? `Industry: ${industry}` : '';
    const departmentCtx = department ? `Department: ${department}` : '';
    const situationCtx = careerSituation ? `Career Situation: ${careerSituation}` : '';
    const timeframeCtx = timeframe ? `Job Search Timeframe: ${timeframe}` : '';
    const isPivot = (careerSituation || '').toLowerCase().includes('pivot');
    const previousIndustryCtx = isPivot && previousIndustry ? `Previous Industry (pivoting from): ${previousIndustry}` : '';

    // Build strategic tone guidance based on situation + timeframe combination
    const buildStrategyCtx = () => {
      const s = (careerSituation || '').toLowerCase();
      const t = (timeframe || '').toLowerCase();
      const urgent = t.includes('asap') || t.includes('1-3');
      const strategic = t.includes('strategic') || t.includes('3-6');
      const planning = t.includes('planning') || t.includes('6-12');

      if (s.includes('redundant') && urgent) return 'STRATEGIC TONE: This person was recently made redundant and needs a role urgently. Lead with tactically actionable advice. Address how to handle the redundancy gap confidently on the resume. Prioritise fast networking moves, quick-win fixes, and immediate visibility tactics. Do not hedge.';
      if (s.includes('redundant')) return 'STRATEGIC TONE: This person was recently made redundant. Address the gap head-on - how to frame it, what to lead with, how to prevent it becoming a red flag. Include morale-aware but brutally honest advice.';
      if (s.includes('returning') && urgent) return 'STRATEGIC TONE: This person is returning to the workforce and needs a role quickly. Focus on how to address the gap confidently, what experience to lead with, and how to reframe the return as a strength not an apology.';
      if (s.includes('returning')) return 'STRATEGIC TONE: This person is returning to the workforce. Help them lead with confidence, address the gap directly, and position re-entry as intentional rather than defensive.';
      if (s.includes('pivot') && urgent) {
        const from = previousIndustry || 'their current industry';
        const to = industry || 'their target industry';
        return 'STRATEGIC TONE: This person is pivoting from ' + from + ' into ' + to + ' and needs to move fast. This is a translation exercise, not a disadvantage. In every section of the analysis: identify which skills from ' + from + ' transfer directly and are valued in ' + to + '; name what to reframe and exactly how; flag what to cut because it anchors them to their old sector; address genuine gaps honestly without dwelling on them. Position the pivot as intentional and confident - not apologetic. Prioritise speed: the highest-impact changes first.';
      }
      if (s.includes('pivot')) {
        const from = previousIndustry || 'their current industry';
        const to = industry || 'their target industry';
        return 'STRATEGIC TONE: This person is pivoting from ' + from + ' into ' + to + '. This is primarily a translation problem - not a deficit. In every section of the analysis, specifically address: (1) which skills from ' + from + ' transfer directly and are valued in ' + to + '; (2) which experiences need to be reframed and how to do it concretely; (3) what genuine gaps exist and how to address or explain them honestly; (4) what language, metrics, or framing anchors them to ' + from + ' and needs to change; (5) how to position this pivot with confidence rather than apology - the narrative should feel intentional. Never treat their background as a liability without also showing how it becomes an asset in ' + to + '.';
      }
      if ((s.includes('unemployed') || s.includes('actively')) && urgent) return 'STRATEGIC TONE: This person is unemployed and actively searching urgently. Prioritise high-impact, fast-to-implement changes. Every point should move them closer to an interview, not just "better positioning".';
      if (s.includes('employed') && planning) return 'STRATEGIC TONE: This person is employed and planning ahead with no urgency. Lean into strategic positioning, passive discoverability (LinkedIn, thought leadership), and long-game brand building. Urgency is not the issue - positioning and patience are.';
      if (s.includes('employed') && strategic) return 'STRATEGIC TONE: This person is employed and being strategic. Blend immediate polish with medium-term positioning moves. They have leverage - their current role - so focus on using it.';
      if (s.includes('exploring')) return 'STRATEGIC TONE: This person is exploring options and not fully committed to a specific move. Help them understand what their resume signals about them, what doors it opens and which it closes, and what they would need to change if they decided to move.';
      return '';
    };
    const strategyCtx = buildStrategyCtx();
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

Your feedback is uncomfortably specific. You name the exact problem, not a softened version of it. You call out weak language by quoting it directly. You explain the psychological damage - what signal it sends, what it makes a recruiter assume, why it costs them the shortlist. You do not encourage. You do not motivate. You diagnose.

The free report exists to make people uncomfortable enough to want the full fix. It should sting - not cruelly, but with the specific sting of recognising something true that you've been avoiding. Think: a friend who works in hiring who finally tells you what everyone has been thinking but not saying.

NEVER soften the truth. NEVER say "while there are strengths..." NEVER end a criticism with a compliment. If something is weak, say it is weak and explain exactly why. If the resume would get binned in 6 seconds, say that. Quote the actual language from the document when calling it out - don't be vague.

The document being analysed is a ${documentType}. If it is a LinkedIn profile PDF, apply all the same rigour - evaluate the structure, language, positioning, keyword density, and how well it would land for the target role. LinkedIn profiles are often weaker than resumes because people treat them as passive. Call that out if it's true.

DOCUMENT TEXT (${documentType}):
---
${documentText}
---

TARGET JOB TITLE: ${jobTitle}
${industryCtx}
${departmentCtx}
${roleCtx}
${companyCtx}
${situationCtx}
${timeframeCtx}
${previousIndustryCtx}
${strategyCtx}

Analyse this ${documentType} through the lens of a hiring decision-maker evaluating a ${jobTitle} candidate${industry ? ` in the ${industry} industry` : ''}${department ? ` (${department} department)` : ''}. Treat a LinkedIn PDF with the same rigour as a resume - weak positioning is weak positioning regardless of format.

Let the career situation and timeframe shape the TONE and FOCUS of every section - not just a mention, but the actual strategic direction of the advice. Someone who needs a role in 30 days needs different advice to someone who is planning a move in 12 months.

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
    "brutalOneLiner": "<a sharp, specific one-liner naming the single most damaging truth about this resume - written to sting with recognition, not cruelty. Quote or reference something real from the resume. Make it feel personal. e.g. 'Ten years of impact buried under job descriptions nobody asked for' or 'Every bullet reads like a duty list - zero evidence you've ever moved a number' or 'Looks like a CV written for a role you already left, not the one you're chasing'. NEVER generic. NEVER encouraging.>"
  },
  "topIssues": [
    "<5-8 word headline naming the most critical issue - specific and uncomfortable, quote resume language where possible, no softening, no solution>",
    "<second most critical issue - name the exact problem, not a category of problem>",
    "<third most critical issue - must be specific to this resume, not generic advice>"
  ],
  "firstImpression": {
    "headline": "<4-7 word phrase capturing the recruiter's immediate read>",
    "sixSecondRead": "<What a hiring manager actually thinks in their first 6 seconds - written in first person as a busy, skeptical hiring manager. Be specific about what they see, what they assume, and what makes them hesitate or scroll past. Do not be kind. 2-3 sentences.>",
    "immediateSignals": ["<specific positive signal from the resume>", "<another specific positive signal>"],
    "visualGaps": ["<specific structural or formatting gap>", "<another>"],
    "hirabilityVerdict": "<one blunt sentence on first-impression hireability for this specific role - no hedging, no 'potential', no encouragement. If it's not there yet, say so directly.>"
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
    "coreDisconnect": "<The main gap between what this resume signals and what a ${jobTitle} role demands - be direct about what's missing or misaligned. Name it, don't dance around it. 2-3 sentences, no filler, no softening.>",
    "whatRecruitersActuallySee": "<First person recruiter perspective on this specific resume - what they assume about this person, what red flags they clock, what questions it raises. Written as internal monologue, not as advice. 2-3 sentences.>",
    "unintentionalSignals": ["<something this resume unintentionally signals - quote the specific language or structure causing it>", "<another unintentional signal with the specific evidence from the resume>"],
    "whereExperienceGetsLost": "<specific explanation of where strong experience is being buried, diluted, or mistranslated - name the exact section or pattern, explain the psychological damage it does, 2-3 sentences>"
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
      system: 'You are a brutally honest career analyst powering "Roast My Resume". Return only valid JSON - no markdown, no preamble, no explanation. Be specific, uncomfortable, and direct - name exact problems, quote actual resume language, never soften. SCORING CALIBRATION: most real-world resumes score 40-65 out of 100. Truly exceptional resumes score 75-85. Scores above 85 are extremely rare.',
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

    // Record analysis for admin dashboard
    writeAnalysis({
      email: normalised,
      date: new Date().toISOString(),
      jobTitle: jobTitle || '',
      industry: industry || '',
      careerSituation: careerSituation || '',
      timeframe: timeframe || '',
      isPaid,
    });

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


// ── Admin dashboard ────────────────────────────────────────────────────────
function adminLoginPage(errorMsg) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin Login — not ur regular hr</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f4f1;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .card{background:#fff;border-radius:12px;border:1px solid #e5e3df;padding:2.5rem;width:100%;max-width:360px;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
    .brand{font-family:monospace;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#2D1B69;margin-bottom:0.75rem;font-weight:700}
    h1{font-size:1.3rem;font-weight:800;margin-bottom:1.75rem;color:#0a0a0a}
    label{display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#555;margin-bottom:0.4rem}
    input{width:100%;padding:0.75rem 1rem;border:2px solid #e5e3df;border-radius:8px;font-size:0.95rem;outline:none;font-family:inherit}
    input:focus{border-color:#2D1B69}
    button{width:100%;margin-top:1rem;padding:0.85rem;background:#2D1B69;color:#fff;border:none;border-radius:8px;font-size:0.95rem;font-weight:700;cursor:pointer;font-family:inherit}
    button:hover{background:#1E1247}
    .error{color:#dc2626;font-size:0.82rem;margin-top:0.75rem}
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">not ur regular hr</div>
    <h1>Admin</h1>
    <form method="POST" action="/admin/login">
      <label for="pw">Password</label>
      <input type="password" id="pw" name="password" autofocus required>
      ${errorMsg ? `<p class="error">${errorMsg}</p>` : ''}
      <button type="submit">Sign in &#8594;</button>
    </form>
  </div>
</body>
</html>`;
}

function adminDashboardPage(analyses) {
  const total = analyses.length;
  const paid = analyses.filter(a => a.isPaid).length;
  const free = total - paid;
  const convRate = total > 0 ? ((paid / total) * 100).toFixed(1) : '0.0';

  const roleCounts = {};
  const industryCounts = {};
  analyses.forEach(a => {
    if (a.jobTitle) roleCounts[a.jobTitle] = (roleCounts[a.jobTitle] || 0) + 1;
    if (a.industry) industryCounts[a.industry] = (industryCounts[a.industry] || 0) + 1;
  });
  const topRoles = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topIndustries = Object.entries(industryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const sorted = [...analyses].sort((a, b) => new Date(b.date) - new Date(a.date));

  const barRow = ([label, n], max) => `
    <div class="bar">
      <div class="bar__label" title="${escHtml(label)}">${escHtml(label)}</div>
      <div class="bar__track"><div class="bar__fill" style="width:${Math.round((n / max) * 100)}%"></div></div>
      <div class="bar__count">${n}</div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin Dashboard — not ur regular hr</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f4f1;color:#0a0a0a;min-height:100vh}
    .hdr{background:#2D1B69;color:#fff;padding:1.25rem 2rem;display:flex;align-items:center;justify-content:space-between}
    .hdr__brand{font-size:0.7rem;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;opacity:0.6;margin-bottom:0.2rem}
    .hdr__title{font-size:1.1rem;font-weight:800}
    .logout{font-size:0.75rem;color:rgba(255,255,255,0.65);text-decoration:none;padding:0.4rem 0.75rem;border:1px solid rgba(255,255,255,0.2);border-radius:6px}
    .logout:hover{background:rgba(255,255,255,0.1)}
    .main{max-width:1200px;margin:0 auto;padding:2rem}
    .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem}
    .stat{background:#fff;border-radius:10px;padding:1.25rem 1.5rem;border:1px solid #e5e3df}
    .stat__label{font-size:0.67rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin-bottom:0.35rem}
    .stat__value{font-size:2.1rem;font-weight:800;color:#2D1B69;line-height:1}
    .stat__sub{font-size:0.72rem;color:#aaa;margin-top:0.2rem}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem}
    @media(max-width:700px){.two-col{grid-template-columns:1fr}}
    .panel{background:#fff;border-radius:10px;border:1px solid #e5e3df;overflow:hidden}
    .panel__head{padding:0.9rem 1.5rem;border-bottom:1px solid #e5e3df;font-weight:700;font-size:0.85rem}
    .bar{display:flex;align-items:center;gap:0.75rem;padding:0.55rem 1.5rem;border-bottom:1px solid #f0ede8;font-size:0.82rem}
    .bar:last-child{border-bottom:none}
    .bar__label{width:190px;flex-shrink:0;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .bar__track{flex:1;height:6px;background:#f0ede8;border-radius:3px;overflow:hidden}
    .bar__fill{height:100%;background:#2D1B69;border-radius:3px}
    .bar__count{width:28px;text-align:right;font-size:0.75rem;color:#888;font-weight:600}
    .table-wrap{overflow-x:auto}
    table{width:100%;border-collapse:collapse;font-size:0.81rem}
    th{padding:0.6rem 1rem;text-align:left;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;background:#faf9f7;border-bottom:1px solid #e5e3df;white-space:nowrap}
    td{padding:0.65rem 1rem;border-bottom:1px solid #f0ede8;vertical-align:top}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:#faf9f7}
    .badge{display:inline-block;padding:0.15rem 0.55rem;border-radius:20px;font-size:0.67rem;font-weight:700;letter-spacing:0.04em}
    .paid{background:rgba(45,27,105,0.1);color:#2D1B69}
    .free{background:#f0ede8;color:#888}
    .empty{padding:2rem;text-align:center;color:#aaa;font-size:0.85rem}
    .ts{white-space:nowrap;color:#aaa;font-size:0.78rem}
    .dim{color:#aaa;font-size:0.78rem}
  </style>
</head>
<body>
  <div class="hdr">
    <div>
      <div class="hdr__brand">not ur regular hr</div>
      <div class="hdr__title">Admin Dashboard</div>
    </div>
    <a class="logout" href="/admin/logout">Log out</a>
  </div>
  <div class="main">
    <div class="stats">
      <div class="stat"><div class="stat__label">Total Analyses</div><div class="stat__value">${total}</div></div>
      <div class="stat"><div class="stat__label">Free Reports</div><div class="stat__value">${free}</div></div>
      <div class="stat"><div class="stat__label">Paid Conversions</div><div class="stat__value">${paid}</div></div>
      <div class="stat"><div class="stat__label">Conversion Rate</div><div class="stat__value">${convRate}%</div><div class="stat__sub">free &rarr; paid</div></div>
    </div>

    <div class="two-col">
      <div class="panel">
        <div class="panel__head">Top Target Roles</div>
        ${topRoles.length ? topRoles.map(r => barRow(r, topRoles[0][1])).join('') : '<div class="empty">No data yet</div>'}
      </div>
      <div class="panel">
        <div class="panel__head">Top Industries</div>
        ${topIndustries.length ? topIndustries.map(r => barRow(r, topIndustries[0][1])).join('') : '<div class="empty">No data yet</div>'}
      </div>
    </div>

    <div class="panel">
      <div class="panel__head">All Users (${total})</div>
      ${sorted.length ? `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Email</th>
              <th>Target Role</th>
              <th>Industry</th>
              <th>Situation</th>
              <th>Timeframe</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.map(a => `
            <tr>
              <td class="ts">${new Date(a.date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              <td>${escHtml(a.email)}</td>
              <td>${escHtml(a.jobTitle)}</td>
              <td>${escHtml(a.industry)}</td>
              <td>${escHtml(a.careerSituation)}</td>
              <td class="dim">${escHtml(a.timeframe)}</td>
              <td><span class="badge ${a.isPaid ? 'paid' : 'free'}">${a.isPaid ? 'Paid' : 'Free'}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<div class="empty">No analyses recorded yet.</div>'}
    </div>
  </div>
</body>
</html>`;
}

app.get('/admin', (req, res) => {
  if (!config.ADMIN_PASSWORD) return res.status(500).send('ADMIN_PASSWORD not configured.');
  if (!isAdminAuthed(req)) return res.send(adminLoginPage());
  res.send(adminDashboardPage(readAnalyses()));
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === config.ADMIN_PASSWORD) {
    res.setHeader('Set-Cookie', `nrhr_admin=${encodeURIComponent(password)}; Path=/; HttpOnly; SameSite=Lax`);
    return res.redirect('/admin');
  }
  res.send(adminLoginPage('Incorrect password. Try again.'));
});

app.get('/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'nrhr_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.redirect('/admin');
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
