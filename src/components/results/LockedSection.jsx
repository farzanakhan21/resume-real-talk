import { motion } from 'framer-motion'

const WIDTHS = [92, 78, 85, 68, 80]

export default function LockedSection({ title, icon, lines = 3, onUpgrade, delay = 0 }) {
  return (
    <motion.div
      className="locked-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <div className="locked-section__header">
        <span className="locked-section__icon">{icon}</span>
        <span className="locked-section__title">{title}</span>
        <span style={{ fontSize: '0.85rem' }}>🔒</span>
      </div>
      <div className="locked-section__preview">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="locked-line"
            style={{ width: `${WIDTHS[i % WIDTHS.length]}%` }}
          />
        ))}
      </div>
      <button className="locked-section__cta" onClick={onUpgrade}>
        Unlock the full breakdown →
      </button>
    </motion.div>
  )
}
