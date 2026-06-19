const QUOTES = [
  { quote: 'omg it made me want to cry', meta: 'S.' },
  { quote: 'I made immediate changes to my profile', meta: 'M.' },
  { quote: 'I was so curious from the roast, I deffs would pay for the full report', meta: 'D.' },
]

export default function LandingProof() {
  return (
    <section className="lp-proof">
      <div className="lp-proof__inner">
        <div className="lp-section-header">
          <span className="lp-section-tag">Don't take my word for it</span>
          <h2 className="lp-section-title">The early feedback has been... something.</h2>
        </div>
      </div>

      <div className="lp-proof__grid">
        {QUOTES.map(({ quote, meta }) => (
          <div key={meta} className="lp-proof__card">
            <div className="lp-proof__avatar">{meta.replace('.', '')}</div>
            <p className="lp-proof__quote">"{quote}"</p>
            <div className="lp-proof__meta">
              <span className="lp-proof__dot" />
              {meta}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
