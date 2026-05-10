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
import Disclaimer from '../Disclaimer'

function SectionHeader({ num, title, accent, amberAccent }) {
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

  const handlePrint = () => window.print()

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="results">

        {/* PDF download bar for paid users */}
        {isPaid && (
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button className="btn btn--ghost" onClick={handlePrint} style={{ fontSize: '0.85rem' }}>
              Download PDF report
            </button>
          </div>
        )}

        {/* ── Section 1: The Hard Truth ── */}
        <SectionHeader num={1} title="The Hard|Truth" />

        <ScoreDashboard scores={data.scores} />
        <div style={{ height: '1rem' }} />
        <FirstImpression data={data.firstImpression} />
        <div style={{ height: '1rem' }} />
        <HardTruth data={data.hardTruth} />
        <div style={{ height: '1rem' }} />
        <ATSRisk data={data.atsRisk} />
        <div style={{ height: '1rem' }} />
        <ExecutivePresence data={data.executivePresence} />
        <div style={{ height: '1rem' }} />
        <HiddenAdvantages data={data.hiddenAdvantages} />
        <div style={{ height: '1rem' }} />
        <IndustryGaps data={data.industryTranslation} />
        <div style={{ height: '1rem' }} />
        <RewriteSuggestions
          data={data.rewriteSuggestions}
          onRewrite={onRewrite}
          jobTitle={jobTitle}
          roleCategory={roleCategory}
        />

        {/* ── Section 2: The Unfair Advantage Playbook ── */}
        <SectionHeader num={2} title="The Unfair|Advantage Playbook" amberAccent />

        <NetworkingStrategy data={data.networkingStrategy} />
        <div style={{ height: '1rem' }} />
        <PositioningStrategy data={data.positioningStrategy} />

        {/* ── Paid sections ── */}
        {isPaid && data.linkedInRewrite && (
          <>
            <div style={{ height: '1rem' }} />
            <LinkedInRewrite data={data.linkedInRewrite} />
          </>
        )}

        {isPaid && data.thirtyDayPlan && (
          <>
            <div style={{ height: '1rem' }} />
            <ThirtyDayPlan data={data.thirtyDayPlan} />
          </>
        )}

        {/* Lead capture for free users */}
        {!isPaid && <LeadCapture onUpgrade={onUpgrade} />}

        {/* Reset */}
        <div className="no-print" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <button className="btn btn--ghost" onClick={onReset}>
            Analyse another resume
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
