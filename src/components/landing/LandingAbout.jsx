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
            <span className="lp-about__name">Farzana Khan</span>
            <span className="lp-about__role">not ur regular hr</span>
          </div>

          <div className="lp-about__body">
            <span className="lp-section-tag">Created by</span>
            <p>I tell you what actually goes through our minds when we look at your resume.</p>
            <p>I've been on the hiring side since 2016 - in hospitality, service-led businesses and startups. I've watched hiring managers stop scrolling. I've seen good people get screened out before a human even reads their application. And I've been on the other side of that silence too.</p>
            <p>I've also been the one writing my own redundancy letter. So this comes from both sides of the table.</p>
            <p>I built Roast My Resume because the tools that exist aren't telling people the truth. This isn't just AI. It's 10 years of hiring-side experience, encoded into every part of the analysis.</p>
            <span className="lp-about__signoff">Farzana Khan<br />not ur regular hr<br />est. 2016</span>
          </div>
        </div>
      </div>
    </section>
  )
}
