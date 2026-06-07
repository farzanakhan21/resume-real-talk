const QUOTES = [
  { quote: 'omg it made me want to cry', meta: 'Beta tester' },
  { quote: 'I made immediate changes to my profile', meta: 'Beta tester' },
  { quote: 'I was so curious from the roast, I deffs would pay for the full report', meta: 'Beta tester' },
  { quote: 'The market needs something more refreshingly honest and actionable.', meta: 'Sonia P. - Beta tester' },
]

// Duplicated so the loop resets seamlessly at the -50% mark
const CAROUSEL_QUOTES = [...QUOTES, ...QUOTES]

export default function LandingProof() {
  return (
    <section className="lp-proof">
      <div className="lp-proof__inner">
        <div className="lp-section-header">
          <span className="lp-section-tag">Early feedback</span>
          <h2 className="lp-section-title">The early feedback has been… something.</h2>
        </div>
      </div>

      {/* Carousel spans full section width, outside the inner container */}
      <div className="lp-carousel">
        <div className="lp-carousel__track">
          {CAROUSEL_QUOTES.map(({ quote, meta }, i) => (
            <div
              key={i}
              className="lp-proof__card"
              aria-hidden={i >= QUOTES.length}
            >
              <p className="lp-proof__quote">"{quote}"</p>
              <div className="lp-proof__meta">
                <span className="lp-proof__dot" />
                {meta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
