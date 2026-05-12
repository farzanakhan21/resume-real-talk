import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    title: 'Upload your resume and tell us the role you\'re targeting',
  },
  {
    num: '02',
    title: 'Get your brutal honest score and what it\'s costing you',
  },
  {
    num: '03',
    title: 'Walk away with a clear plan and the unfair advantage moves nobody talks about',
  },
]

export default function HowItWorks() {
  return (
    <motion.section
      className="how-it-works"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <div className="how-it-works__inner">
        <div className="how-it-works__label">
          <span>how it works</span>
        </div>
        <div className="how-it-works__steps">
          {STEPS.map(({ num, title }, i) => (
            <motion.div
              key={num}
              className="step-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            >
              <div className="step-card__num">{num}</div>
              <div className="step-card__title">{title}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
