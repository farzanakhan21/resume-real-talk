import { motion } from 'framer-motion'

export default function WhyDifferent() {
  return (
    <motion.section
      className="why-different"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="why-different__inner">
        <div className="why-different__left">
          <span className="why-different__label">✦ why this is different</span>
          <h2 className="why-different__heading">Why This Is<br />Different</h2>
        </div>
        <div className="why-different__right">
          <p className="why-different__lead">
            Most resume tools scan for keywords.<br />
            This one understands how hiring actually works.
          </p>
          <p>
            I've spent years inside fast-paced workplaces - sitting in hiring meetings, restructures, and leadership decisions. I've seen what makes a recruiter stop scrolling. What makes a hiring manager say no before they finish reading. What gets someone shortlisted when they shouldn't be, and screened out when they should have been a no-brainer.
          </p>
          <p className="why-different__pull">
            This isn't AI guessing at your resume.<br />
            It's AI trained on how the other side of the table actually thinks.
          </p>
        </div>
      </div>
    </motion.section>
  )
}
