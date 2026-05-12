import { motion } from 'framer-motion'

export default function FirstImpression({ data, isPaid }) {
  return (
    <motion.div
      className="card result-block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="card-header">
        <div className="card-header__icon">⚡</div>
        <div>
          <div className="card-header__title">First Impression Snapshot</div>
          <div className="card-header__sub">What happens in the first 6 seconds</div>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div className="muted small mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Recruiter's immediate read</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{data.headline}</div>
      </div>

      <div className="insight-block" style={{ marginBottom: isPaid ? '1.5rem' : 0 }}>
        "{data.sixSecondRead}"
      </div>

      {isPaid && (
        <>
          <div className="two-col" style={{ marginTop: '1.5rem' }}>
            <div>
              <div className="muted small mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>What's landing</div>
              <ul className="check-list">
                {data.immediateSignals?.map((s, i) => (
                  <li key={i} data-icon="✓" style={{ color: 'var(--green)' }}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="muted small mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>What's missing</div>
              <ul className="check-list">
                {data.visualGaps?.map((g, i) => (
                  <li key={i} data-icon="○" style={{ color: 'var(--text-secondary)' }}>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <span className="muted" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '0.75rem' }}>Verdict</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{data.hirabilityVerdict}</span>
          </div>
        </>
      )}
    </motion.div>
  )
}
