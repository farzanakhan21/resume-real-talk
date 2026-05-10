import { motion } from 'framer-motion'

const ratingStyle = {
  Strong: { bg: 'rgba(45,80,22,0.08)', color: '#2D5016', border: 'rgba(45,80,22,0.22)' },
  Developing: { bg: 'rgba(122,96,32,0.08)', color: '#8B6914', border: 'rgba(122,96,32,0.22)' },
  Weak: { bg: 'rgba(139,58,46,0.08)', color: '#8B3A2E', border: 'rgba(139,58,46,0.22)' },
}

export default function ExecutivePresence({ data }) {
  const style = ratingStyle[data.presenceRating] || ratingStyle.Developing
  return (
    <motion.div
      className="card result-block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <div className="card-header">
        <div className="card-header__icon">🎖️</div>
        <div>
          <div className="card-header__title">Executive Presence Signals</div>
          <div style={{ marginTop: '0.25rem' }}>
            <span className="rating-badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
              {data.presenceRating}
            </span>
          </div>
        </div>
      </div>

      <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>{data.languageAnalysis}</p>

      <div className="two-col">
        <div>
          <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>What signals leadership</div>
          <ul className="check-list">
            {data.presenceSignals?.map((s, i) => (
              <li key={i} data-icon="✓" style={{ color: 'var(--green)' }}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>What's undermining it</div>
          <ul className="check-list">
            {data.presenceGaps?.map((g, i) => (
              <li key={i} data-icon="○" style={{ color: 'var(--text-secondary)' }}>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="insight-block amber" style={{ marginTop: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '0.5rem' }}>How to position this better</div>
        {data.repositioningAdvice}
      </div>
    </motion.div>
  )
}
