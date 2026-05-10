import { motion } from 'framer-motion'

const OFFERINGS = [
  { icon: '📄', title: 'Downloadable PDF Report', desc: 'Full analysis formatted for sharing or saving' },
  { icon: '💼', title: 'LinkedIn Profile Rewrite', desc: 'Headline, about section, and experience framing — copy-paste ready' },
  { icon: '📈', title: '30-Day Visibility Sprint', desc: 'Week-by-week plan to get noticed before you apply' },
  { icon: '🎯', title: '5 Rewrite Suggestions', desc: 'Two extra targeted rewrites beyond the free tier' },
  { icon: '✦', title: 'Personal Brand Audit', desc: 'How you show up online across every surface' },
  { icon: '🤝', title: 'Tailored Networking Plan', desc: 'Specific people, companies, and outreach sequences' },
]

export default function LeadCapture({ onUpgrade }) {
  return (
    <motion.div
      className="card card--elevated"
      style={{ marginTop: '5rem', border: '1px solid var(--border-amber)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div style={{ marginBottom: '0.5rem', fontSize: '0.7rem', fontFamily: 'var(--mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber)' }}>
        want the unfair advantage version?
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '0.75rem' }}>
        Get the full breakdown.
      </h2>
      <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 480, marginBottom: '2rem' }}>
        This is the free version. Unlock the full report for $39 AUD — LinkedIn rewrite, 30-day visibility sprint, PDF download, and more rewrite suggestions.
      </p>

      <div className="lead-grid" style={{ marginBottom: '2rem' }}>
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

      <button className="btn btn--primary" style={{ width: 'auto', display: 'inline-flex' }} onClick={onUpgrade}>
        Unlock for $39 AUD <span className="btn-arrow">→</span>
      </button>
      <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.75rem' }}>
        One-time payment. Secure checkout via Stripe. Instant access.
      </p>
    </motion.div>
  )
}
