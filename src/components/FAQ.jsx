import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const GENERAL = [
  {
    q: 'Is the first analysis really free?',
    a: 'Yes. No credit card needed. Upload your resume, fill in the role details, and get your roast instantly.',
  },
  {
    q: 'Is my resume safe?',
    a: 'Your resume is processed securely through AI and never stored or shared. I only keep your email address to send you your results.',
  },
  {
    q: 'How accurate is the feedback?',
    a: "I've been reviewing resumes since 2016 across hospitality, tech and startups. I've built that experience into this tool so it gives you the same honest, specific advice I'd give you if you were my friend. It's a strong starting point - not a guarantee - but it's a lot more useful than generic career tips.",
  },
  {
    q: 'Who built this?',
    a: "Me - Farzana. I got tired of watching talented people get overlooked because their resume wasn't telling the right story - and because nobody talks about the other ways to get noticed. So I built the tool I'd use if I was talking to a friend.",
  },
  {
    q: 'Can I use this for any role or industry?',
    a: "Yes. The more specific you are about the role you're targeting, the more tailored the feedback. I'd recommend being as specific as possible.",
  },
  {
    q: "What's the difference between free and paid?",
    a: 'The free report shows your overall score, category scores and top issues - enough to know something\'s wrong. The paid report ($79 AUD) tells you exactly why and gives you the full plan to fix it - detailed recommendations, rewrite suggestions, LinkedIn profile rewrite, networking strategy and PDF download.',
  },
  {
    q: "What's coming next?",
    a: "This is just the start. I'm building out tools for navigating difficult workplace conversations, making the case for your promotion, and recognising toxic workplaces before they take a toll. Stay tuned.",
  },
]

const PRIVACY_LEGAL = [
  {
    q: 'Is my resume stored or shared?',
    a: 'No. Your resume is processed in memory during analysis and immediately discarded. We never store, share, or use your resume content for any other purpose. The only information we retain is your email address, target role, industry and career situation for our own records.',
  },
  {
    q: 'Is this tool powered by AI?',
    a: 'Yes. Roast My Resume uses AI to generate your analysis. The tool is built on 10 years of hiring-side experience - the questions it asks, the framework it uses, and the way it interprets your resume all come from real HR expertise. The AI delivers it, the human thinking behind it is what makes it different.',
  },
  {
    q: 'Are results guaranteed?',
    a: 'No. Roast My Resume provides career insight and strategic feedback to help you understand how your resume is being perceived. It is not a guarantee of employment outcomes. Always apply your own judgement and seek professional advice where needed.',
  },
  {
    q: 'What is your refund policy?',
    a: 'Because your full report is generated and delivered immediately upon payment, we are unable to offer refunds once the analysis has been completed. If you experience a technical issue that prevents you from receiving your report, please contact us at farzana@noturregularhr.com and we will make it right.',
  },
  {
    q: 'Who is behind this tool?',
    a: 'Roast My Resume is built by Farzana Khan, an HR professional with over 10 years of experience across hospitality, service-led businesses and startups. This is not a generic AI tool - it is built on real hiring-side experience from someone who has sat on both sides of the table.',
  },
]

function FaqItem({ q, a, id, open, onToggle }) {
  return (
    <div className="faq-item">
      <button
        className="faq-item__q"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className={`faq-item__icon${open ? ' open' : ''}`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-item__a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState(null)

  const toggle = (id) => setOpen(open === id ? null : id)

  return (
    <section className="faq">
      <div className="faq__inner">
        <div className="faq__list">
          {GENERAL.map(({ q, a }, i) => (
            <FaqItem key={i} id={`g-${i}`} q={q} a={a} open={open === `g-${i}`} onToggle={toggle} />
          ))}
        </div>

        <div className="faq__section-heading">
          <span>✦ privacy &amp; legal</span>
        </div>

        <div className="faq__list">
          {PRIVACY_LEGAL.map(({ q, a }, i) => (
            <FaqItem key={i} id={`l-${i}`} q={q} a={a} open={open === `l-${i}`} onToggle={toggle} />
          ))}
        </div>
      </div>
    </section>
  )
}
