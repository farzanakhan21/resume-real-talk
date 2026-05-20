import { motion } from 'framer-motion'

const TILES = [
  {
    icon: '🔥',
    title: 'The Hard Truth',
    sub: 'Overall score + brutal one-liner',
    lines: ['90%', '75%', '55%'],
    badge: { label: 'Score', value: '––' },
  },
  {
    icon: '🤖',
    title: 'ATS Risk Scan',
    sub: 'Keyword gaps + formatting issues',
    lines: ['80%', '95%', '65%'],
    badge: { label: 'Risk', value: 'HIGH' },
  },
  {
    icon: '⚡',
    title: 'First Impression Snapshot',
    sub: 'What a recruiter sees in 6 seconds',
    lines: ['85%', '70%', '90%'],
  },
  {
    icon: '🔍',
    title: 'The Core Disconnect',
    sub: 'Gap between your resume and the role',
    lines: ['100%', '80%', '60%'],
  },
  {
    icon: '🎖',
    title: 'Executive Presence Signals',
    sub: 'What signals leadership vs undermines it',
    lines: ['75%', '90%', '50%'],
  },
  {
    icon: '💎',
    title: 'Hidden Competitive Advantages',
    sub: 'What you have that you\'re not using',
    lines: ['85%', '65%', '80%'],
  },
  {
    icon: '✏️',
    title: 'Rewrite Suggestions',
    sub: 'Specific sections rewritten with explanations',
    lines: ['90%', '100%', '70%'],
  },
  {
    icon: '🎯',
    title: 'The Unfair Advantage Playbook',
    sub: 'Who to connect with + exact messaging',
    lines: ['80%', '55%', '85%'],
  },
]

function scrollToForm() {
  const el = document.getElementById('roast-form')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function SeeWhatYouGet() {
  return (
    <section className="swyg">
      <div className="swyg__inner">

        <motion.div
          className="swyg__header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="swyg__label">✦ no surprises</span>
          <h2 className="swyg__heading">See exactly what you're getting</h2>
          <p className="swyg__sub">No surprises. Here's a real example of what lands in your inbox.</p>
        </motion.div>

        <div className="swyg__grid">
          {TILES.map(({ icon, title, sub, lines, badge }, i) => (
            <motion.div
              key={title}
              className="locked-section swyg__tile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.06 }}
            >
              <div className="locked-section__header">
                <span className="locked-section__icon">{icon}</span>
                <div className="swyg__tile-titles">
                  <div className="locked-section__title">{title}</div>
                  <div className="swyg__tile-sub">{sub}</div>
                </div>
                {badge && (
                  <span className={`swyg__badge swyg__badge--${badge.label.toLowerCase()}`}>
                    {badge.label}: <strong>{badge.value}</strong>
                  </span>
                )}
              </div>
              <div className="locked-section__preview">
                {lines.map((w, j) => (
                  <div key={j} className="locked-line" style={{ width: w }} />
                ))}
              </div>
              <div className="swyg__lock">🔒 unlocks with full report</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="swyg__footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <p className="swyg__disclaimer">
            Every section is tailored to your actual resume, your target role, and your industry.
            Not a template. Not generic advice.
          </p>
          <button className="btn btn--primary" onClick={scrollToForm}>
            Get My Roast → $79 AUD
          </button>
        </motion.div>

      </div>
    </section>
  )
}
