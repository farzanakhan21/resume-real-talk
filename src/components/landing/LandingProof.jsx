const QUOTES = [
  { quote: 'omg it made me want to cry', meta: 'S.' },
  { quote: 'I made immediate changes to my profile', meta: 'M.' },
  { quote: 'I was so curious from the roast, I deffs would pay for the full report', meta: 'D.' },
  { quote: 'The market needs something more refreshingly honest and actionable.', meta: 'S.' },
  { quote: 'Unintentional signal is spot on.', meta: 'M.' },
]

function Card({ quote, meta }) {
  return (
    <div className="lp-proof__card">
      <p className="lp-proof__quote">"{quote}"</p>
      <div className="lp-proof__meta">
        <span className="lp-proof__name">{meta}</span>
      </div>
    </div>
  )
}

export default function LandingProof() {
  return (
    <section className="lp-proof">
      <div className="lp-proof__inner">
        <div className="lp-section-header">
          <span className="lp-section-tag">real user reactions</span>
        </div>
      </div>

      <div className="lp-proof__marquee">
        <div className="lp-proof__marquee-track">
          <div className="lp-proof__marquee-group">
            {QUOTES.map((q, i) => <Card key={i} {...q} />)}
          </div>
          <div className="lp-proof__marquee-group" aria-hidden="true">
            {QUOTES.map((q, i) => <Card key={i} {...q} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
