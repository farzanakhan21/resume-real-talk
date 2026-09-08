// nurhr brand lockup. Three variants:
//   inline  — nav bar: "roast my resume · by · nurhr" on one baseline
//   stacked — site header / OG: product over "by nurhr" over tagline
//   dark    — footer / plum sections: stacked, cream text, urhr in gold-light
// The nurhr wordmark is one continuous word: n (plum/cream) + urhr (gold).
// No space, punctuation, icon, or underline between them.

function Wordmark() {
  return (
    <span className="nurhr">n<span className="nurhr__urhr">urhr</span></span>
  )
}

export default function Lockup({ variant = 'stacked', className = '' }) {
  if (variant === 'inline') {
    return (
      <span className={`lockup lockup--inline ${className}`}>
        <span className="lockup__product">roast my resume</span>
        <span className="lockup__by">by</span>
        <Wordmark />
      </span>
    )
  }

  // stacked + dark share the same structure
  return (
    <span className={`lockup lockup--${variant} ${className}`}>
      <span className="lockup__product">roast my resume</span>
      <span className="lockup__line">
        <span className="lockup__by">by</span>
        <Wordmark />
      </span>
      <span className="lockup__tag">not ur regular hr</span>
    </span>
  )
}
