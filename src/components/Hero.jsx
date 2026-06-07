import { motion } from 'framer-motion'

function scrollToForm() {
  const el = document.getElementById('roast-form')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export default function Hero() {
  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <button className="hero__badge" onClick={scrollToForm}>✦ roast my resume</button>
      <h1 className="hero__h1">
        Your resume<br />
        is <em>lying</em><br />
        to you.
      </h1>
      <p className="hero__sub">
        Not a generic ATS scanner. A brutally honest hiring perception analysis - what the recruiter sees, what the hiring manager feels, what you need to do differently.
      </p>
      <button className="hero__cta" onClick={scrollToForm}>Roast my resume →</button>
      <p className="hero__context">
        Built by someone who understands how recruiters, hiring managers, and HR teams actually think - not just how AI rewrites resumes.
      </p>
    </motion.section>
  )
}
