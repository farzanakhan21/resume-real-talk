import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'Is the first analysis really free?',
    a: 'Yes. No credit card needed. Upload your resume and get your score instantly.',
  },
  {
    q: 'Is my resume safe?',
    a: 'Your resume is processed securely through AI and never stored or shared. I only keep your email address to send you your results.',
  },
  {
    q: 'How accurate is the feedback?',
    a: "I've spent 10+ years reviewing resumes across hospitality, tech and startups. I've built that experience into this tool so it gives you the same honest, specific advice I'd give you if you were my friend. It's a strong starting point - not a guarantee - but it's a lot more useful than generic career tips.",
  },
  {
    q: 'Who built this?',
    a: "Me - Farzana. I'm an HR director and people & culture leader who got tired of watching talented people get overlooked because their resume wasn't telling the right story - and because nobody talks about the other ways to get noticed. So I built the tool I'd use as if I was talking to a friend.",
  },
  {
    q: 'Can I use this for any role or industry?',
    a: "Yes. The more specific you are about the role you're targeting, the more tailored the feedback. I'd recommend being as specific as possible.",
  },
  {
    q: "What's the difference between free and paid?",
    a: 'The free report shows your overall score, category scores and top issues - enough to know something\'s wrong. The paid report ($39 AUD) tells you exactly why and gives you the full plan to fix it - detailed recommendations, rewrite suggestions, LinkedIn profile rewrite, networking strategy and PDF download.',
  },
  {
    q: "What's coming next?",
    a: "This is just the start. I'm building out tools for navigating difficult workplace conversations, making the case for your promotion, and recognising toxic workplaces before they take a toll. Stay tuned.",
  },
  {
    q: 'What is your refund policy?',
    a: "All sales are final. Because this is a digital product delivered instantly, I'm unable to offer refunds once the report has been generated. If you have any issues with your report, reach out to farzana@noturregularhr.com and I'll make it right.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  const toggle = (i) => setOpen(open === i ? null : i)

  return (
    <section className="faq">
      <div className="faq__inner">
        <h2 className="faq__title">questions I get asked.</h2>
        <div className="faq__list">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="faq-item">
              <button
                className="faq-item__q"
                onClick={() => toggle(i)}
                aria-expanded={open === i}
              >
                <span>{q}</span>
                <span className={`faq-item__icon${open === i ? ' open' : ''}`}>+</span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
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
          ))}
        </div>
      </div>
    </section>
  )
}
