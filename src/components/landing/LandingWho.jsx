const WHO = [
  { title: 'Job hunting', body: 'Applying and hearing nothing back. Not sure if it\'s your resume, your profile, or the system.' },
  { title: 'Employed but stuck', body: 'You\'re good at what you do. Nobody outside your company seems to know it yet.' },
  { title: 'Career pivot', body: 'Changing industries or roles and not sure how to reposition your experience.' },
  { title: 'Levelling up', body: 'Ready for the next step but not getting shortlisted for the roles you know you\'re ready for.' },
  { title: 'Exploring', body: 'Not sure what\'s next yet - but you want to know how you\'re being perceived right now.' },
  { title: 'Just curious', body: 'Everything\'s fine - but what if you\'re leaving opportunities on the table without knowing it?' },
]

export default function LandingWho() {
  return (
    <section className="lp-who">
      <div className="lp-who__inner">
        <div className="lp-section-header">
          <span className="lp-section-tag">Who this is for</span>
          <h2 className="lp-section-title">If you fall into one of these, keep reading.</h2>
        </div>
        <div className="lp-who__grid">
          {WHO.map(({ title, body }) => (
            <div key={title} className="lp-who__card">
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
