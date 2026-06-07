const WHAT = [
  {
    n: '01',
    title: 'Hiring perception analysis',
    body: 'What a recruiter actually notices in the first 6 seconds. What a hiring manager subconsciously thinks. Unfiltered.',
  },
  {
    n: '02',
    title: 'ATS & red flag audit',
    body: 'Why you might not be making it past the systems — before a human ever sees you.',
  },
  {
    n: '03',
    title: 'Your unfair advantage',
    body: 'The strengths you\'re not highlighting. The positioning gaps costing you opportunities you don\'t even know exist.',
  },
  {
    n: '04',
    title: 'Positioning strategy',
    body: 'Who to contact, what to say, and how to get visible in the industries and companies you actually want.',
  },
  {
    n: '05',
    title: 'Networking scripts',
    body: 'Practical, specific outreach copy based on your actual experience. Not templates. Yours.',
  },
  {
    n: '06',
    title: '1:1 session (beta)',
    body: 'During beta, some users get a personalised session with Farzana to go through their results together.',
  },
]

export default function LandingWhat() {
  return (
    <section className="lp-what" id="lp-what">
      <div className="lp-what__inner">
        <div className="lp-section-header lp-section-header--dark">
          <span className="lp-section-tag lp-section-tag--gold">What you get</span>
          <h2 className="lp-section-title lp-section-title--white">
            Built different. Because you deserve better than a template.
          </h2>
        </div>
        <div className="lp-what__grid">
          {WHAT.map(({ n, title, body }) => (
            <div key={n} className="lp-what__item">
              <span className="lp-what__number">{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
