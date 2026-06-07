const QUOTES = [
  { quote: 'omg it made me want to cry', meta: 'Beta tester' },
  { quote: 'I made immediate changes to my profile', meta: 'Beta tester' },
  { quote: 'I was so curious from the roast, I deffs would pay for the full report', meta: 'Beta tester' },
  { quote: 'The market needs something more refreshingly honest and actionable.', meta: 'Sonia P. - Beta tester' },
]

export default function LandingProof() {
  return (
    <section className="lp-proof">
      <div className="lp-proof__inner">
        <div className="lp-section-header">
          <span className="lp-section-tag">Early feedback</span>
          <h2 className="lp-section-title">The early feedback has been… something.</h2>
        </div>
        <div className="lp-proof__grid">
          {QUOTES.map(({ quote, meta }) => (
            <div key={meta + quote} className="lp-proof__card">
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
