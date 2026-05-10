import { motion, AnimatePresence } from 'framer-motion'

export default function PaywallModal({ email, onClose, onUpgrade, loading }) {
  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="modal"
          style={{ maxWidth: 520 }}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div style={{ marginBottom: '0.4rem', fontSize: '0.7rem', fontFamily: 'var(--mono)', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber)' }}>
            you've already used your free analysis
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Get the full breakdown for $39 AUD
          </h2>
          <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            One free analysis per email. Your results are waiting — unlock the complete report including your LinkedIn rewrite and 30-day visibility plan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
            {[
              { icon: '📄', text: 'Full analysis report (PDF download)' },
              { icon: '💼', text: 'LinkedIn profile rewrite — headline, about, experience framing' },
              { icon: '📈', text: '30-day visibility sprint — week-by-week action plan' },
              { icon: '🎯', text: '5 targeted rewrite suggestions (vs 3 in free tier)' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn--primary"
              style={{ flex: 1, minWidth: 180 }}
              onClick={onUpgrade}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Unlock for $39 AUD →'}
            </button>
            <button className="btn btn--ghost" onClick={onClose} style={{ flexShrink: 0 }}>
              Not now
            </button>
          </div>
          <p className="muted" style={{ fontSize: '0.75rem', marginTop: '0.75rem' }}>
            One-time payment. Secure checkout via Stripe. Instant access.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
