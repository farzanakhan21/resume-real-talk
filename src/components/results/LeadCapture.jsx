import { motion } from 'framer-motion'

const OFFERINGS = [
  { icon: '📄', title: 'Downloadable PDF Report', desc: 'Full analysis formatted for sharing or saving' },
  { icon: '💼', title: 'LinkedIn Profile Rewrite', desc: 'Headline, about section, experience framing — copy-paste ready' },
  { icon: '📈', title: '30-Day Visibility Sprint', desc: 'Week-by-week plan to get noticed before you apply' },
  { icon: '🎯', title: '5 Rewrite Suggestions', desc: 'Two extra targeted rewrites beyond the free tier' },
  { icon: '✦', title: 'Personal Brand Audit', desc: 'How you show up online across every surface' },
  { icon: '🤝', title: 'Tailored Networking Plan', desc: 'Specific people, companies, and outreach sequences' },
]

export default function LeadCapture({ onUpgrade }) {
  return (
    <motion.div
      className="lead-capture-dark"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="lead-label">want the unfair advantage version?</div>
      <h2>Get the full breakdown.</h2>
      <p className="lead-sub">
        This is the free version. Unlock everything for $39 AUD — LinkedIn rewrite, 30-day visibility sprint, PDF download, and more rewrite suggestions.
      </p>

      <div className="lead-grid">
        {OFFERINGS.map(({ icon, title, desc }) => (
          <div key={title} className="lead-item">
            <div className="lead-item__icon">{icon}</div>
            <div className="lead-item__text">
              <strong>{title}</strong>
              {desc}
            </div>
          </div>
        ))}
      </div>

      <button className="btn--dark-primary" onClick={onUpgrade}>
        Unlock for $39 AUD <span>→</span>
      </button>
      <p className="lead-price-note">
        One-time payment · Secure checkout via Stripe · Instant access
      </p>
    </motion.div>
  )
}
