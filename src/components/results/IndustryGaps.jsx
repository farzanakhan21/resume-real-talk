import { motion } from 'framer-motion'

export default function IndustryGaps({ data }) {
  return (
    <motion.div
      className="card result-block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.14 }}
    >
      <div className="card-header">
        <div className="card-header__icon">🌐</div>
        <div>
          <div className="card-header__title">Industry Translation Gaps</div>
          <div className="card-header__sub">Where strong experience stops landing</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Where it gets lost</div>
          <ul className="check-list">
            {data.translationGaps?.map((g, i) => (
              <li key={i} data-icon="↯" style={{ color: 'var(--text-secondary)' }}>{g}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Language to adopt</div>
          <div className="tag-row">
            {data.languageToAdopt?.map((l, i) => <span key={i} className="tag amber">{l}</span>)}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How to reframe it</div>
        <ul className="check-list">
          {data.reframingSuggestions?.map((r, i) => (
            <li key={i} data-icon="→" style={{ color: 'var(--text)' }}>{r}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
