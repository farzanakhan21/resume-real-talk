import { motion } from 'framer-motion'
import FAQ from './FAQ'

export default function FAQPage({ onNavigate }) {
  return (
    <motion.div
      key="faq"
      className="faq-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="faq-page__inner">
        <motion.div
          className="faq-page__header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hero__badge">✦ faqs</span>
          <h1 className="faq-page__headline">questions I get asked.</h1>
        </motion.div>

        <FAQ />

        <motion.div
          className="faq-page__cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button className="btn btn--primary" onClick={() => onNavigate('/')}>
            Get your resume roasted →
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
