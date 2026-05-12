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
            not ur regular hr -<br />and I mean that <em>literally.</em>
          </h1>
        </motion.div>

        <Section delay={0.1}>
          <p>I'm not on the employee's side. I'm not on the employer's side.</p>
          <p className="about-emphasis">I'm at the intersection.</p>
          <p>After 10+ years across HR, recruitment, and people &amp; culture - in startups, hospitality, and everything in between - I've sat in every seat at the table. I've been the one making the decisions, and I've been the one affected by them.</p>
          <p>What I've learned: everyone deserves to be heard. Employees, managers, founders, operators. And there's always a way to figure out how to use your voice - whether you're trying to get in the room, run the room, or redesign what happens inside it.</p>
        </Section>

        <Section delay={0.15}>
          <p className="about-emphasis">My whole philosophy is simple: if the goal is experience, you never fail.</p>
          <p>I'm not here to be your therapist or your hype person. I'm here to share what I know - the same advice I give my friends and family when they call me about work, careers, and figuring out what's next.</p>
          <p>Specific. Honest. Practical. No corporate BS.</p>
        </Section>

        <Section delay={0.2}>
          <p>I'm building tools for every stage of the working life - not just getting the job, but navigating what happens once you're in it.</p>
          <p>Because whether you're job hunting, managing a team, trying to get promoted, or figuring out if it's time to leave - you deserve more than generic advice written for everyone and useful to no one.</p>
        </Section>

        <motion.div
          className="about-signoff"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="about-signoff__name">Farzana Khan</div>
          <div className="about-signoff__brand">not ur regular hr</div>
        </motion.div>

        <motion.div
          className="about-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button className="btn btn--primary" onClick={() => onNavigate('/')}>
            Try the career reality check →
          </button>
        </motion.div>

      </div>
    </motion.div>
  )
}
