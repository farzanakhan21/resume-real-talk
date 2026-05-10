import { motion } from 'framer-motion'

export default function HardTruth({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
    >
      <div className="card result-block card--accent">
        <div className="card-header">
          <div className="card-header__icon">🔍</div>
          <div>
            <div className="card-header__title">The Core Disconnect</div>
            <div className="card-header__sub">The gap between what your resume signals and what this role demands</div>
          </div>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--text)' }}>{data.coreDisconnect}</p>
      </div>

      <div className="card result-block" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <div className="card-header__icon">👤</div>
          <div>
            <div className="card-header__title">What Recruiters Actually See</div>
            <div className="card-header__sub">First-person hiring manager perspective</div>
          </div>
        </div>
        <div className="insight-block">"{data.whatRecruitersActuallySee}"</div>
      </div>

      <div className="card result-block" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <div className="card-header__icon">📡</div>
          <div>
            <div className="card-header__title">Unintentional Signals</div>
            <div className="card-header__sub">What your resume communicates without you realising</div>
          </div>
        </div>
        <ul className="check-list">
          {data.unintentionalSignals?.map((s, i) => (
            <li key={i} data-icon="→" style={{ color: 'var(--text-secondary)' }}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="card result-block" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <div className="card-header__icon">🔦</div>
          <div>
            <div className="card-header__title">Where Your Experience Gets Lost</div>
            <div className="card-header__sub">The translation problem</div>
          </div>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>{data.whereExperienceGetsLost}</p>
      </div>
    </motion.div>
  )
}
