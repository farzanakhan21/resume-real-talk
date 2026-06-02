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
          <p>I tell you what actually goes through our minds when we look at your resume.</p>

          <p>I've been on the hiring side since 2016 - in hospitality, service-led businesses and startups. I know what makes a hiring manager stop scrolling. I know why good people get screened out before a human even reads their application. And I know what it feels like to be on the other side of that silence too.</p>

          <p>I've also been the one writing my own redundancy letter. So when I say I know this stuff works - I mean it from both sides of the table.</p>

          <p>I built Roast My Resume because the tools that exist aren't telling people the truth. This isn't just AI. It's 10 years of hiring-side experience, encoded into every part of the analysis.</p>
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
