import { motion } from 'framer-motion'

function Section({ label, children }) {
  return (
    <motion.div
      className="about-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="about-section__label">{label}</div>
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
      transition={{ duration: 0.4 }}
    >
      <div className="about-inner">

        <motion.div
          className="about-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hero__badge">✦ the person behind the tool</span>
          <h1 className="about-headline">
            I didn't plan to<br />work in HR.<br />HR <em>found</em> me.
          </h1>
        </motion.div>

        <Section label="the beginning">
          <p>I was nineteen, working as a barista. Everything that could go wrong, went wrong.</p>
          <p>I was underpaid, overworked, and when I asked for a promotion or a pay rise, my manager made it clear there were other ways I could earn more. He was asking me to have an affair with him.</p>
          <p>I reached out to someone in the HR space for advice. I liked how she thought. I told her I wanted to do what she did.</p>
          <p>She gave me my first HR job.</p>
          <p>I was twenty-one, still at uni, and I walked into a company that had never had HR before. I was their first hire. I built the entire practice from scratch and stayed for five years. That's where I learned everything.</p>
        </Section>

        <Section label="what I learned at the top">
          <p>I never chased a career ladder. I chased projects. I wanted to get really good at specific things - and I knew that staying in one place wasn't going to get me the experience or the pay I was worth.</p>
          <p>So I kept moving. And eventually, I made it to the most senior HR seat in the room.</p>
          <p>And that's when I realised something that changed everything:</p>
          <blockquote className="about-pull">
            Nobody actually knows what they're doing. Everyone is figuring it out as they go.
          </blockquote>
          <p>I watched decisions get made - good ones, bad ones, manipulated ones. I saw how little most organisations actually invest in their people when it comes down to it. I spent years fighting for my team, my employees, my people.</p>
          <p>And I realised that no one at the top was going to fight for me the same way.</p>
          <p>So I stopped waiting for someone to give me permission.</p>
        </Section>

        <Section label="the moment">
          <p>One day I found myself writing my own redundancy letter.</p>
          <p>I'd spent years fighting for everyone else's careers. And there I was, making the case for my own exit.</p>
          <p>It was bittersweet. And I thought: if not now, when?</p>
          <p>So I started building.</p>
        </Section>

        <Section label="why I built this">
          <p>Most career advice is generic. Vague. Written for everyone, which means it actually helps no one.</p>
          <p>I built not ur regular hr because I wanted to give people the advice I wish I'd had - specific, honest, tailored to your actual situation. The kind of advice you'd get from a friend who happens to know exactly how hiring works from the inside.</p>
          <p>Not the corporate version. The real version.</p>
          <p>This is just the start. I'm building tools for every stage of the career journey - because whether you're trying to get in the room, navigate what happens once you're there, or figure out when it's time to leave, you deserve more than a Google search and a LinkedIn post.</p>
        </Section>

        <motion.div
          className="about-signoff"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="about-signoff__name">Farzana Khan</div>
          <div className="about-signoff__brand">not ur regular hr</div>
        </motion.div>

        <motion.div
          className="about-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button className="btn btn--primary" onClick={() => onNavigate('/')}>
            Try the career reality check →
          </button>
        </motion.div>

      </div>
    </motion.div>
  )
}
