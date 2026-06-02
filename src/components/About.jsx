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
