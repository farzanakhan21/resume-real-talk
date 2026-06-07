const COMPARISONS = [
  {
    theirs: '"Use strong action verbs and quantify your achievements."',
    ours: '"Your title buries your actual impact. Here\'s how a hiring manager reads this in 6 seconds."',
  },
  {
    theirs: '"Tailor your resume to each job description."',
    ours: '"Your positioning is giving identity crisis. Here\'s who to contact and what to say instead."',
  },
  {
    theirs: '"Make sure your LinkedIn headline is optimised."',
    ours: '"You have the receipts — but you\'re burying them. Here\'s your unfair advantage you\'re not using."',
  },
]

export default function LandingDiff() {
  return (
    <section className="lp-diff">
      <div className="lp-diff__inner">
        <div className="lp-diff__content">
          <span className="lp-section-tag">Why it's different</span>
          <h2 className="lp-section-title">
            ChatGPT will tell you to use strong action verbs.
          </h2>
          <p>
            This tells you why a hiring manager would scroll past you in 6 seconds — and what to do about it.
          </p>
          <p>
            And yes, you could spend hours prompting AI to get there. Or you could get it in 60 seconds from{' '}
            <strong>someone who's actually been in the room.</strong>
          </p>
          <div className="lp-diff__tagline">
            built different. because you deserve better than a template.
          </div>
        </div>

        <div className="lp-diff__compare">
          {COMPARISONS.map(({ theirs, ours }, i) => (
            <div key={i} className="lp-compare-row">
              <div className="lp-compare-card lp-compare-card--theirs">
                <span className="lp-compare-label">Generic AI</span>
                <p>{theirs}</p>
              </div>
              <div className="lp-compare-card lp-compare-card--ours">
                <span className="lp-compare-label">Roast My Resume</span>
                <p>{ours}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
