export default function LandingAbout() {
  return (
    <section className="lp-about" id="lp-about">
      <div className="lp-about__inner">
        <div className="lp-about__content">
          <span className="lp-section-tag lp-section-tag--gold">Created by</span>
          <h2 className="lp-section-title lp-section-title--white">
            Someone who's been on every side of the table.
          </h2>
          <p>
            Since 2016 I've been in this space - leading talent strategy, candidate experience, employee journey, workforce restructures and leadership coaching - watching capable people get overlooked because they didn't know how to position themselves.
          </p>
          <p>
            Myself included. I've written my own redundancy letter. I've had interviews where I thought I nailed it and heard nothing. And ones where I walked out unsure and got the offer.
          </p>
          <p>
            As a candidate you don't see the other side. The one advert with 500+ applicants. The decisions pre-made before the role even goes live. The budget conversation just to get it approved. The hiring manager drowning in their day-to-day. The systems and filters before a human even looks. The first impression formed before you've said a word.
          </p>
          <p>Most people never get that information. So I created something that gives it to them.</p>
          <p>Farzana K.</p>
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
