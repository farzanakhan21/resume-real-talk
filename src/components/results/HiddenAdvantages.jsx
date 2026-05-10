import { motion } from 'framer-motion'

export default function HiddenAdvantages({ data }) {
  return (
    <motion.div
      className="card result-block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 }}
    >
      <div className="card-header">
        <div className="card-header__icon">💎</div>
        <div>
          <div className="card-header__title">Hidden Competitive Advantages</div>
          <div className="card-header__sub">What you have that you're not using</div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Overlooked strengths</div>
        <ul className="check-list">
          {data.overlookedStrengths?.map((s, i) => (
            <li key={i} data-icon="◆" style={{ color: 'var(--amber)' }}>{s}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your unique positioning</div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--text)' }}>{data.uniquePositioning}</p>
      </div>

      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How to amplify this</div>
        <ul className="check-list">
          {data.howToAmplify?.map((a, i) => (
            <li key={i} data-icon="→" style={{ color: 'var(--text)' }}>{a}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
