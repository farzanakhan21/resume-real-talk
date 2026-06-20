const WHAT = [
  {
    n: '01',
    title: 'Hiring Perception Analysis',
    body: 'What a recruiter actually notices in the first 6 seconds - and what a hiring manager subconsciously thinks.',
  },
  {
    n: '02',
    title: 'ATS & Red Flag Audit',
    body: 'Why you might not be making it past the systems - before a human ever sees you.',
  },
  {
    n: '03',
    title: 'Your Unfair Advantage',
    body: 'The strengths you\'re not highlighting and the positioning gaps costing you opportunities you don\'t know exist.',
  },
  {
    n: '04',
    title: 'Positioning Strategy',
    body: 'Who to contact, what to say, and how to get visible in the industries and companies you actually want.',
  },
  {
    n: '05',
    title: 'Networking Scripts',
    body: 'Practical, specific outreach copy based on your actual experience. Not templates - yours.',
  },
  {
    n: '06',
    title: '1:1 Session',
    body: 'Sit down with me and go through your results together. A real conversation, not a chatbot.',
  },
]

export default function LandingWhat() {
  return (
    <section className="lp-what" id="lp-what">
      <div className="lp-what__inner">
        <div className="lp-section-header">
          <span className="lp-section-tag">What You Get</span>
          <h2 className="lp-section-title">
            Everything you need to be seen clearly.
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
