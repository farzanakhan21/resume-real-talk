export default function LandingHero() {
  const scrollToForm = () => {
    const el = document.getElementById('roast-form')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="lp-hero">
      <div className="lp-hero__glow" />
      <div className="lp-hero__inner">
        <h1 className="lp-hero__headline">
          Your resume is <span className="lp-hero__accent">lying</span> to you.
        </h1>
        <p className="lp-hero__sub">
          Find out what recruiters actually see - and what to do about it.
        </p>

        <div className="resume-stage">
          <div className="resume-card">
            <div className="resume-badge">
              <span className="resume-badge__dot">✓</span>
              Analysed in 8 seconds
            </div>

            <div className="resume-head">
              <div className="resume-avatar" />
              <div>
                <div className="resume-name" />
                <div className="resume-role-bar" />
              </div>
              <div className="resume-contact">
                <span /><span /><span />
              </div>
            </div>

            <div className="resume-body">
              <div className="resume-main">
                <div className="resume-seclabel">Experience</div>
                <div className="resume-job">
                  <div className="resume-job-title" />
                  <div className="resume-job-meta" />
                  <div className="resume-line w95" />
                  <div className="resume-line w88" />
                  <div className="resume-line hl w70" />
                </div>
                <div className="resume-job">
                  <div className="resume-job-title" />
                  <div className="resume-job-meta" />
                  <div className="resume-line w95" />
                  <div className="resume-line w70" />
                </div>
                <div className="resume-job">
                  <div className="resume-job-title" />
                  <div className="resume-job-meta" />
                  <div className="resume-line w88" />
                  <div className="resume-line w70" />
                </div>
              </div>
              <aside className="resume-side">
                <div className="resume-seclabel">Skills</div>
                <div className="resume-chips">
                  <span className="resume-chip c1" />
                  <span className="resume-chip c2" />
                  <span className="resume-chip c3" />
                  <span className="resume-chip c4" />
                  <span className="resume-chip c5" />
                  <span className="resume-chip c2" />
                </div>
                <div className="resume-seclabel">Education</div>
                <div className="resume-sideline s1" />
                <div className="resume-sideline s2" />
                <div className="resume-seclabel" style={{ marginTop: '22px' }}>Contact</div>
                <div className="resume-sideline s3" />
                <div className="resume-sideline s2" />
              </aside>
            </div>
          </div>

          <div className="resume-cta-wrap">
            <button className="lp-btn-primary lp-btn-primary--lg" onClick={scrollToForm}>
              Roast My Resume
            </button>
            <span className="resume-cta-note">Takes less than 2 minutes</span>
          </div>
        </div>
      </div>
    </section>
  )
}
