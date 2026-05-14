import { motion } from 'framer-motion'
import ScoreDashboard from './ScoreDashboard'
import FirstImpression from './FirstImpression'
import HardTruth from './HardTruth'
import ATSRisk from './ATSRisk'
import ExecutivePresence from './ExecutivePresence'
import HiddenAdvantages from './HiddenAdvantages'
import IndustryGaps from './IndustryGaps'
import RewriteSuggestions from './RewriteSuggestions'
import NetworkingStrategy from './NetworkingStrategy'
import PositioningStrategy from './PositioningStrategy'
import LinkedInRewrite from './LinkedInRewrite'
import ThirtyDayPlan from './ThirtyDayPlan'
import LeadCapture from './LeadCapture'
import LockedSection from './LockedSection'
import Disclaimer from '../Disclaimer'

function SectionHeader({ num, title, amberAccent }) {
  return (
    <motion.div
      className="section-gap"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-eyebrow">
        <div className="section-num">0{num}</div>
        <div className="section-line" />
      </div>
      <h2 className={`section-title ${amberAccent ? 'amber' : ''}`}>
        {title.split('|').map((part, i) =>
          i % 2 === 1 ? <em key={i}>{part}</em> : part
        )}
      </h2>
    </motion.div>
  )
}

export default function Results({ data, isPaid, userEmail, onRewrite, onReset, onUpgrade }) {
  const jobTitle = data.positioningStrategy?.linkedinHeadline || ''
  const roleCategory = ''

  const handlePrint = () => {
    const prev = document.title
    document.title = 'resume-roast-report'
    window.print()
    document.title = prev
  }

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Print-only cover page */}
      <div className="print-cover">
        <div className="print-cover__brand">not ur regular hr</div>
        <div className="print-cover__title">Roast My Resume</div>
        <div className="print-cover__subtitle">Full Analysis Report</div>
        {userEmail && <div className="print-cover__email">{userEmail}</div>}
        <div className="print-cover__date">{new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="results">

        {isPaid && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', marginBottom: '1.5rem' }}>
            <button className="btn btn--ghost" onClick={handlePrint} style={{ fontSize: '0.85rem' }}>
              Download PDF report
            </button>
            <p className="pdf-hint">When saving as PDF, uncheck 'Headers and footers' in your print dialog for the cleanest result.</p>
          </div>
        )}

        {/* ── Section 1: The Score ── */}
        <SectionHeader num={1} title="The Hard|Truth" />

        <ScoreDashboard scores={data.scores} isPaid={isPaid} />

        {/* Top 3 issues - free teaser */}
        {data.topIssues?.length > 0 && (
          <motion.div
            className="card result-block"
            style={{ marginTop: '1rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header__icon">⚠️</div>
              <div>
                <div className="card-header__title">Top 3 Issues Working Against You</div>
                <div className="card-header__sub">
                  {isPaid ? 'Full breakdown below' : 'Unlock the full report to see exactly what\'s wrong and how to fix it'}
                </div>
              </div>
            </div>
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.topIssues.slice(0, 3).map((issue, i) => (
                <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    background: 'rgba(109,40,217,0.1)',
                    border: '2px solid var(--accent)',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '0.1rem',
                  }}>{i + 1}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text)' }}>{issue}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        <div style={{ height: '1rem' }} />
        <FirstImpression data={data.firstImpression} isPaid={isPaid} />
        <div style={{ height: '1rem' }} />
        <ATSRisk data={data.atsRisk} isPaid={isPaid} />

        {/* ── Paid: full detail sections ── */}
        {isPaid && (
          <>
            <div style={{ height: '1rem' }} />
            <HardTruth data={data.hardTruth} />
            <div style={{ height: '1rem' }} />
            <ExecutivePresence data={data.executivePresence} />
            <div style={{ height: '1rem' }} />
            <HiddenAdvantages data={data.hiddenAdvantages} />
            <div style={{ height: '1rem' }} />
            <IndustryGaps data={data.industryTranslation} />
            <div style={{ height: '1rem' }} />
            <RewriteSuggestions data={data.rewriteSuggestions} onRewrite={onRewrite} jobTitle={jobTitle} roleCategory={roleCategory} />
          </>
        )}

        {/* ── Free: locked section previews ── */}
        {!isPaid && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
            }}>
              <span>Locked in full report</span>
              <span style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <LockedSection icon="🔍" title="Hard Truth & Core Disconnect" lines={3} onUpgrade={onUpgrade} delay={0.05} />
              <LockedSection icon="🎖️" title="Executive Presence Analysis" lines={3} onUpgrade={onUpgrade} delay={0.1} />
              <LockedSection icon="✦" title="Hidden Competitive Advantages" lines={2} onUpgrade={onUpgrade} delay={0.15} />
              <LockedSection icon="🌐" title="Industry Translation Gaps" lines={2} onUpgrade={onUpgrade} delay={0.2} />
              <LockedSection icon="✏️" title="Rewrite Suggestions with Copy-Paste Examples" lines={4} onUpgrade={onUpgrade} delay={0.25} />
            </div>
          </div>
        )}

        {/* ── Section 2: Unfair Advantage Playbook ── */}
        <SectionHeader num={2} title="The Unfair|Advantage Playbook" amberAccent />

        {isPaid ? (
          <>
            <NetworkingStrategy data={data.networkingStrategy} />
            <div style={{ height: '1rem' }} />
            <PositioningStrategy data={data.positioningStrategy} />
            {data.linkedInRewrite && (
              <>
                <div style={{ height: '1rem' }} />
                <LinkedInRewrite data={data.linkedInRewrite} />
              </>
            )}
            {data.thirtyDayPlan && (
              <>
                <div style={{ height: '1rem' }} />
                <ThirtyDayPlan data={data.thirtyDayPlan} />
              </>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <LockedSection icon="🤝" title="Tailored Networking Strategy" lines={3} onUpgrade={onUpgrade} delay={0.05} />
            <LockedSection icon="🎯" title="Positioning Strategy & Elevator Pitch" lines={3} onUpgrade={onUpgrade} delay={0.1} />
            <LockedSection icon="💼" title="LinkedIn Profile Rewrite" lines={4} onUpgrade={onUpgrade} delay={0.15} />
            <LockedSection icon="📈" title="30-Day Visibility Sprint" lines={3} onUpgrade={onUpgrade} delay={0.2} />
          </div>
        )}

        {/* Lead capture for free users */}
        {!isPaid && <LeadCapture onUpgrade={onUpgrade} />}

        <div className="no-print" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <button className="btn btn--ghost" onClick={onReset}>
            Roast another resume →
          </button>
        </div>
      </div>

      <Disclaimer />

      <footer className="footer no-print">
        <p>not ur regular hr &copy; 2026 · built different. because you deserve better than a template.</p>
      </footer>
    </motion.div>
  )
}
