import { useState } from 'react'
import { motion } from 'framer-motion'

const OFFERINGS = [
  { icon: '🔍', title: 'Hard Truth + Core Disconnect', desc: 'What\'s actually blocking you - not what you want to hear, what you need to' },
  { icon: '✏️', title: 'Rewrite Suggestions', desc: 'Copy-paste replacements for your weakest sections' },
  { icon: '🎖️', title: 'Executive Presence Analysis', desc: 'Why you might be underselling seniority without realising it' },
  { icon: '✦', title: 'Hidden Competitive Advantages', desc: 'What makes you different that isn\'t coming through on paper' },
  { icon: '💼', title: 'LinkedIn Profile Rewrite', desc: 'Headline, about section, and experience framing - ready to paste' },
  { icon: '📈', title: '30-Day Visibility Sprint', desc: 'Exact moves, week by week, to get noticed before you even apply' },
]

export default function LeadCapture({ onUpgrade }) {
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')

  const handlePay = async () => {
    setPromoError('')
    const err = await onUpgrade(promoCode)
    if (err) setPromoError(err)
  }

  return (
    <motion.div
      className="lead-capture-dark"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="lead-label">you've seen the problem. here's the fix.</div>
      <h2>Get the full report for $79 AUD →</h2>
      <p className="lead-sub">
        You know something is off. The full report tells you exactly what, why, and precisely what to do about it.
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

      {/* Promo code field */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,248,244,0.5)', marginBottom: '0.45rem' }}>
          Got a promo code?
        </label>
        <input
          className="input"
          style={{ background: 'rgba(250,248,244,0.08)', border: '2px solid rgba(250,248,244,0.15)', color: 'var(--text-on-dark)', fontSize: '0.9rem' }}
          value={promoCode}
          onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
          placeholder="Enter code"
          autoComplete="off"
          spellCheck={false}
        />
        {promoError && (
          <p style={{ fontSize: '0.78rem', color: '#F87171', marginTop: '0.4rem', fontWeight: 600 }}>
            {promoError}
          </p>
        )}
      </div>

      <button className="btn--dark-primary" onClick={handlePay}>
        Unlock everything for $79 AUD →
      </button>
      <p className="lead-price-note">
        One-time payment · Secure checkout via Stripe · Instant access
      </p>
    </motion.div>
  )
}
