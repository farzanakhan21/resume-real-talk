import { motion } from 'framer-motion'

function Week({ num, title, tasks }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontFamily: 'var(--mono)', fontWeight: 700, flexShrink: 0
        }}>W{num}</div>
        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{title}</div>
      </div>
      <ul className="check-list" style={{ paddingLeft: '2.5rem' }}>
        {tasks?.map((t, i) => (
          <li key={i} data-icon="✓" style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem', fontSize: '0.88rem' }}>{t}</li>
        ))}
      </ul>
    </div>
  )
}

export default function ThirtyDayPlan({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <div className="card result-block card--amber">
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header__icon">📈</div>
          <div>
            <div className="card-header__title">Your 30-Day Visibility Sprint</div>
            <div className="card-header__sub">Week-by-week actions to get noticed before you apply</div>
          </div>
        </div>

        <Week num={1} title={data.week1?.title} tasks={data.week1?.tasks} />
        <Week num={2} title={data.week2?.title} tasks={data.week2?.tasks} />
        <Week num={3} title={data.week3?.title} tasks={data.week3?.tasks} />
        <Week num={4} title={data.week4?.title} tasks={data.week4?.tasks} />
      </div>
    </motion.div>
  )
}
