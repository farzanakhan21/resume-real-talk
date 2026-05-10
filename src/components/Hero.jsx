import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="hero__eyebrow">career positioning analysis</div>
      <h1 className="hero__h1">
        Your resume is<br />
        <em>lying</em> to you.
      </h1>
      <p className="hero__sub">
        Not a generic ATS scanner. A brutally honest hiring perception analysis — what the recruiter sees, what the hiring manager feels, what you need to do differently.
      </p>
    </motion.section>
  )
}
