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
          <button className="modal__close" onClick={onClose}>✕</button>
          <div className="modal__badge">you've been roasted before</div>
          <h2>Once is free. Twice is $39.</h2>
          <p>
            You've already had your free roast. Unlock the full report - LinkedIn rewrite, 30-day visibility plan, PDF download, and more.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem' }}>
            {[
              { icon: '📄', text: 'Full analysis report - downloadable PDF' },
              { icon: '💼', text: 'LinkedIn profile rewrite - headline, about, experience' },
              { icon: '📈', text: '30-day visibility sprint - week-by-week action plan' },
              { icon: '🎯', text: '5 targeted rewrite suggestions (vs 3 in free)' },
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
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.75rem', fontFamily: 'var(--mono)' }}>
            One-time payment · Secure checkout via Stripe · Instant access
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
            All sales are final. No refunds on digital products.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
