import { motion } from 'framer-motion'
import FAQ from './FAQ'
import LandingNav from './landing/LandingNav'
import LandingFooter from './landing/LandingFooter'

export default function FAQPage({ onNavigate }) {
  return (
    <motion.div
      key="faq"
      className="lp-faq-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <LandingNav onNavigate={onNavigate} />

      {/* Purple hero header */}
      <div className="lp-faq-hero">
        <span className="lp-section-tag lp-section-tag--gold">✦ faqs</span>
        <h1 className="lp-faq-hero__title">Questions I get asked.</h1>
        <p className="lp-faq-hero__sub">
          Everything you need to know before you roast.
        </p>
      </div>

      {/* Cream body with accordion */}
      <div className="lp-faq-body">
        <div className="lp-faq-body__inner">
          <FAQ />

          <div className="lp-faq-cta">
            <button className="lp-btn-primary" onClick={() => onNavigate('/')}>
              Get your resume roasted →
            </button>
          </div>
        </div>
      </div>

      <LandingFooter onNavigate={onNavigate} />
    </motion.div>
  )
}
