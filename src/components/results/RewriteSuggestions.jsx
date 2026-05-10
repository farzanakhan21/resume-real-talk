import { motion } from 'framer-motion'

export default function RewriteSuggestions({ data, onRewrite, jobTitle, roleCategory }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '1.25rem' }}>✏️</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Rewrite Suggestions</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>Sections with the highest impact if rewritten</div>
        </div>
      </div>

      {data?.map((item, i) => (
        <div key={i} className="card rewrite-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.section}</div>
              <div className="rewrite-issue muted" style={{ marginTop: '0.25rem' }}>{item.issue}</div>
            </div>
            <button
              className="btn--outline-amber"
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => onRewrite({ section: item.section, originalText: item.originalText, whyItHurts: item.whyItHurts, direction: item.direction, jobTitle, roleCategory })}
            >
              Rewrite this →
            </button>
          </div>

          <div className="rewrite-original">"{item.originalText}"</div>

          <div className="rewrite-why">
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--red)', display: 'block', marginBottom: '0.3rem' }}>Why this hurts</span>
            {item.whyItHurts}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: '0.5rem' }}>Goal</span>
            {item.direction}
          </div>
        </div>
      ))}
    </motion.div>
  )
}
