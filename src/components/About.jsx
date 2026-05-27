import { motion } from 'framer-motion'

function Section({ children, delay = 0 }) {
  return (
    <motion.div
      className="about-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <div className="about-section__body">{children}</div>
    </motion.div>
  )
}

export default function About({ onNavigate }) {
  return (
    <motion.div
      key="about"
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="about-inner">

        <motion.div
          className="about-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hero__badge">✦ about</span>
          <h1 className="about-headline">
            I build what I wish existed. And share what I know the way I would with a friend.
          </h1>
          <p className="about-subheadline">here's what being on the inside since 2016 has taught me.</p>
        </motion.div>

        <Section delay={0.1}>
          <p>I built Roast My Resume because I felt the pain personally. The no responses. The silence. The generic tools that told me nothing useful.</p>

          <p>But I've also sat on the other side of the hiring table. I know what hiring managers actually think. I know why people get screened out before a human even sees their application.</p>

          <p>So I stopped relying on job applications and figured out how to show up differently. Then I built the tool I wished existed.</p>

          <h3 className="about-receipts-heading">the receipts.</h3>

          <ul className="about-receipts">
            <li>Reviewed <strong>thousands of resumes</strong> - and know exactly what makes hiring managers stop scrolling</li>
            <li>Helped secure <strong>100+ interviews</strong> through strategic positioning</li>
            <li>Reduced turnover from <strong>75% to 19%</strong></li>
            <li>Improved engagement scores from <strong>6.9 to 8.3</strong></li>
            <li>Achieved <strong>$0 workers' comp premium</strong></li>
            <li>Reduced recruitment spend from <strong>$20,000 to $0</strong></li>
            <li>Built HR functions from scratch for businesses that <strong>had never had one</strong></li>
            <li>Navigated successful audits with <strong>Fair Work, Safe Work, and Home Affairs</strong> - I know exactly what they look for</li>
            <li>Worked with the systems, and against them - <strong>I know both sides</strong></li>
          </ul>

          <p className="about-and-yes">And yes - I've also been the one writing my own redundancy letter. Which is exactly why I know this stuff works.</p>
        </Section>

        {/* Sign-off: photo inline with name */}
        <motion.div
          className="about-signoff"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <img src="/farzana.png" alt="Farzana Khan" className="about-photo" />
          <div className="about-signoff__text">
            <div className="about-signoff__name">Farzana Khan</div>
            <div className="about-signoff__brand">not ur regular hr</div>
            <div className="about-signoff__est">est. 2016</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="about-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <button className="btn btn--primary" onClick={() => onNavigate('/')}>
            Try Roast My Resume - it's free →
          </button>
        </motion.div>

      </div>
    </motion.div>
  )
}
