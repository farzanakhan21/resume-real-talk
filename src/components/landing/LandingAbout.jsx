export default function LandingAbout() {
  return (
    <section className="lp-about" id="lp-about">
      <div className="lp-about__inner">
        <div className="lp-about__card">

          <div className="lp-about__profile">
            <img
              src="/farzana.png"
              alt="Farzana Khan"
              className="lp-about__portrait"
            />
            <div className="lp-about__profile-name">Farzana Khan</div>
            <div className="lp-about__profile-role">Founder · HR Strategist</div>
            <span className="lp-about__profile-tag">not ur regular hr</span>
          </div>

          <div className="lp-about__body">
            <span className="lp-section-tag">Created By</span>
            <h2 className="lp-about__body-h2">Someone who's been on every side of the table.</h2>

            <div className="lp-about__wins">
              <div className="lp-about__win">
                <div className="lp-about__win-num">
                  75→19%
                  <small>Turnover</small>
                </div>
                <p>Reduced staff turnover from <strong>75% to 19%</strong> through targeted retention strategy and culture work.</p>
              </div>
              <div className="lp-about__win">
                <div className="lp-about__win-num">
                  -80%
                  <small>Spend</small>
                </div>
                <p>Cut recruitment spend by <strong>80%</strong> through direct hiring and talent attraction - brand over budget.</p>
              </div>
              <div className="lp-about__win">
                <div className="lp-about__win-num">
                  6.9→8.3
                  <small>Engagement</small>
                </div>
                <p>Lifted employee engagement from <strong>6.9 to 8.3</strong> while leading HR for luxury hospitality brands including Accor MGallery.</p>
              </div>
            </div>

            <p className="lp-about__para">Since 2016 I've been leading talent strategy, candidate experience, and workforce transformation - watching capable people get overlooked because they didn't know how to position themselves. I created this because most people never see the other side of the hiring table. Now you can.</p>
            <div className="lp-about__signoff">- Farzana Khan</div>
          </div>

        </div>
      </div>
    </section>
  )
}
