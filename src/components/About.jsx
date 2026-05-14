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
            I didn't plan to work in HR.<br />HR found me.
          </h1>
          <p className="about-subheadline">here's what 10+ years on the inside taught me.</p>
        </motion.div>

        <Section delay={0.1}>
          <p>10+ years building HR from the ground up - in hospitality, events, and high-growth environments. And now building products to fix the problems I keep seeing from the inside.</p>
          <h3 className="about-receipts-heading">the receipts.</h3>
          <ul className="about-receipts">
            <li>Reviewed <strong>thousands of resumes</strong></li>
            <li>Interviewed <strong>over 100 times</strong></li>
            <li>Left <strong>toxic workplaces</strong></li>
            <li>Had <strong>difficult managers</strong></li>
            <li>Found myself writing <strong>my own redundancy letter</strong> and thought: is this it?</li>
          </ul>
          <p>That moment changed everything. There had to be something more. So I started fractional HR, career coaching, and eventually building the tools I always wished existed.</p>
          <ul className="about-receipts">
            <li>Helped frontline staff <strong>step into management roles</strong> they didn't think they were ready for</li>
            <li>Helped people made redundant <strong>land their next role within 90 days</strong></li>
            <li>Helped people <strong>pivot from a decade in one industry</strong> into something completely new</li>
            <li>Helped people <strong>ask for more with confidence</strong>, get clarity in interviews, and position themselves better</li>
          </ul>
          <p>The through-line in all of it: <strong>people systems that work in real life</strong>, not just in policy documents.</p>
        </Section>

        <Section delay={0.15}>
          <p>I believe great HR doesn't take sides - not the employee's, not the employer's. We sit at the intersection.</p>
          <p>After 10+ years across HR, recruitment, and people &amp; culture - in startups, hospitality, and everything in between - the biggest thing I've learned is that everyone is just figuring it out as they go.</p>
          <p>Everyone deserves to be heard. And there's always a way to figure out how to use your voice - whether you're trying to get in the room, run the room, or redesign what happens inside it.</p>
        </Section>

        <Section delay={0.2}>
          <p>If you're a founder or operator building something from scratch - or scaling faster than your people processes can keep up - I work with businesses directly as a fractional HR and people &amp; culture leader. I've built HR functions from the ground up, navigated the chaos of hypergrowth, and helped founders make people decisions that don't come back to bite them later. I make complex legislation simple and difficult conversations easy.</p>
        </Section>

        <Section delay={0.25}>
          <p>Helping people figure out how to use your voice is what I do - and the different roles I play let me do that across every type of person and problem.</p>
          <p>I've been the employee figuring it out. I've been the most senior HR person in the room watching how decisions actually get made. I've been the founder building from scratch with no rulebook.</p>
          <p>I know where the gaps are. I know the patterns. And I've turned what I've learned into systems that actually work in real life - not theory, not generic advice, not what sounds good in a LinkedIn post.</p>
          <p>This is what I'd tell you if you were my friend and you needed real answers.</p>
        </Section>

        <motion.div
          className="about-signoff"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <img src="/farzana.png" alt="Farzana Khan" className="about-photo" />
          <div className="about-signoff__text">
            <div className="about-signoff__name">Farzana Khan</div>
            <div className="about-signoff__brand">not ur regular hr</div>
          </div>
        </motion.div>

        <motion.div
          className="about-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <button className="btn btn--primary" onClick={() => onNavigate('/')}>
            Get your resume roasted →
          </button>
          <p className="pdf-hint" style={{ marginTop: '1rem' }}>When saving as PDF, uncheck 'Headers and footers' in your print dialog for the cleanest result.</p>
        </motion.div>

      </div>
    </motion.div>
  )
}
