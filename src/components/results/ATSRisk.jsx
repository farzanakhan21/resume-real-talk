import { motion } from 'framer-motion'
import { riskColor } from '../../utils'

export default function ATSRisk({ data }) {
  const color = riskColor(data.riskLevel)
  return (
    <motion.div
      className="card result-block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 }}
    >
      <div className="card-header">
        <div className="card-header__icon">🤖</div>
        <div>
          <div className="card-header__title">ATS Risk Scan</div>
          <div style={{ marginTop: '0.25rem' }}>
            <span className="rating-badge" style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}>
              {data.riskLevel} Risk
            </span>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="muted small mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Keyword gaps</div>
          <div className="tag-row">
            {data.keywordGaps?.map((k, i) => <span key={i} className="tag red">{k}</span>)}
          </div>
        </div>
        <div>
          <div className="muted small mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Formatting issues</div>
          <ul className="check-list">
            {data.formattingIssues?.map((f, i) => (
              <li key={i} data-icon="✗" style={{ color: 'var(--red)' }}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="muted small mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Quick fixes</div>
        <ul className="check-list">
          {data.quickFixes?.map((f, i) => (
            <li key={i} data-icon="✓" style={{ color: 'var(--green)' }}>{f}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
