import { motion } from 'framer-motion'

export default function FounderIntro() {
  return (
    <motion.section
      className="founder-intro"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className="founder-intro__inner">
        <div className="founder-intro__quote">"</div>
        <div className="founder-intro__body">
          <p>I've spent 10+ years in HR and recruitment watching talented people get overlooked - not because they weren't good enough, but because their resume wasn't telling the right story.</p>
          <p>Most career advice out there is generic. Vague. Written for everyone, which means it helps no one.</p>
          <p>This tool gives you the kind of specific, tailored feedback I'd give you if you were my friend sitting across from me. Not the corporate version. The real version.</p>
          <div className="founder-intro__sig">
            <div className="founder-intro__name">Farzana</div>
            <div className="founder-intro__brand">not ur regular hr</div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
