export default function LandingAbout() {
  return (
    <section className="lp-about" id="lp-about">
      <div className="lp-about__inner">
        <div className="lp-about__content">
          <span className="lp-section-tag lp-section-tag--gold">Built by</span>
          <h2 className="lp-section-title lp-section-title--white">
            Someone who's been on every side of the table.
          </h2>
          <p>
            I've sat in <strong>hiring meetings, redundancy discussions, performance reviews and leadership conversations</strong> for over 10 years - watching talented people get overlooked because they didn't know how to position themselves.
          </p>
          <p>
            Myself included. I've written my own redundancy letter. So yes - I've been on every side of this. I've had interviews where I thought I nailed it and heard nothing. And ones where I walked out unsure and got the offer.
          </p>
          <p>
            The gap between how we think we're coming across and how we're actually being perceived is real. And most people never find out.
          </p>
          <p>
            <strong>When people ask about the HR budget, I have to laugh sometimes and say - I AM THE BUDGET. 😂</strong> The resources just aren't there to give everyone the feedback they deserve.
          </p>
          <p>So I built something that does.</p>
        </div>

        {/* Portrait photo — centred below the copy */}
        <div className="lp-about__photo-wrap">
          <img
            src="/farzana.png"
            alt="Farzana Khan"
            className="lp-about__portrait"
          />
        </div>
      </div>
    </section>
  )
}
