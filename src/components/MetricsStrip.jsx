import { motion } from 'framer-motion'

const STATS = [
  { value: '75% → 19%', label: 'turnover reduction' },
  { value: '$0', label: 'workers comp premium achieved' },
  { value: 'since 2016', label: 'in HR across hospitality, service-led & startups' },
  { value: 'built from nothing', label: 'HR functions built from nothing across multi-site teams' },
]

export default function MetricsStrip() {
  return (
    <motion.section
      className="metrics-strip"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className="metrics-strip__inner">
        <p className="metrics-strip__label">✦ built from real experience</p>
        <div className="metrics-strip__grid">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={i}
              className="metrics-strip__stat"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
            >
              <div className="metrics-strip__value">{value}</div>
              <div className="metrics-strip__desc">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
