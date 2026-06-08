export default function LandingCTA() {
  const scrollToForm = () => {
    const el = document.getElementById('roast-form')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="lp-cta">
      <div className="lp-cta__inner">
        <span className="lp-section-tag lp-cta__tag">Ready?</span>
        <h2 className="lp-section-title lp-cta__title">
          Done waiting for permission to take control of your career?
        </h2>
        <p>Beta is open. Get your roast instantly or join the waitlist for a personalised 1:1 session.</p>
        <div className="lp-cta__buttons">
          <button className="lp-btn-primary" onClick={scrollToForm}>
            Roast my resume ❤️‍🔥
          </button>
          <a
            href="https://tally.so/r/lbzMJk"
            className="lp-btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the waitlist
          </a>
        </div>
      </div>
    </section>
  )
}
