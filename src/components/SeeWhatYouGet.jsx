import { motion } from 'framer-motion'

export default function SeeWhatYouGet() {
  return (
    <motion.section
      className="swyg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="swyg__inner swyg__inner--simple">
        <span className="swyg__label">✦ no surprises</span>
        <h2 className="swyg__heading">See exactly what you're getting</h2>
        <p className="swyg__sub">No surprises. Here's a real example of what lands in your inbox.</p>
        <a
          href="/sample-report.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary swyg__sample-btn"
        >
          View sample report →
        </a>
      </div>
    </motion.section>
  )
}
