export default function LandingHero() {
  const scrollToForm = () => {
    const el = document.getElementById('roast-form')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToWhat = () => {
    const el = document.getElementById('lp-what')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="lp-hero">
      <div className="lp-hero__inner">
        <div className="lp-hero__tag">
          <span className="lp-hero__tag-dot" />
          Beta - limited access open
        </div>

        <h1 className="lp-hero__headline">
          Your resume is<br /><em>lying</em> to you.
        </h1>

        <p className="lp-hero__sub">
          Not a generic ATS scanner. A brutally honest hiring perception analysis - what the recruiter sees, what the hiring manager feels, what you need to do differently.
        </p>

        <div className="lp-hero__actions">
          <button className="lp-btn-primary" onClick={scrollToForm}>
            Roast my resume ❤️‍🔥
          </button>
          <button className="lp-btn-ghost" onClick={scrollToWhat}>
            See what's included →
          </button>
        </div>

        <div className="lp-hero__proof">
          <div className="lp-proof-item">
            <span className="lp-proof-number">10+</span>
            <span className="lp-proof-label">Years HR experience</span>
          </div>
          <div className="lp-proof-item">
            <span className="lp-proof-number">Beta</span>
            <span className="lp-proof-label">Early access open</span>
          </div>
          <div className="lp-proof-item">
            <span className="lp-proof-number">1:1</span>
            <span className="lp-proof-label">Sessions available</span>
          </div>
        </div>
      </div>
    </section>
  )
}
