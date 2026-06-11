import { motion } from 'framer-motion'
import { scoreColor, scoreLabel } from '../../utils'
import AtsTooltip from './AtsTooltip'

const DIMENSIONS = [
  { key: 'atsCompatibility', label: 'ATS Compatibility', atsLabel: true },
  { key: 'executivePresence', label: 'Executive Presence' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'strategicPositioning', label: 'Strategic Positioning' },
  { key: 'credibilitySignals', label: 'Credibility Signals' },
  { key: 'impactEvidence', label: 'Impact Evidence' },
  { key: 'industryTranslation', label: 'Industry Translation' },
]

export default function ScoreDashboard({ scores, isPaid }) {
  const overall = scores.overall
  const color = scoreColor(overall)

  return (
    <div className="card result-block">
      <div className="score-hero">
        <div>
          <div className="score-big-label">Overall Score</div>
          <motion.div
            className="score-big"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {overall}
          </motion.div>
          <div className="score-big-label" style={{ marginTop: '0.25rem' }}>out of 100</div>
          {scores.brutalOneLiner && (
            <div className="score-brutal-liner">{scores.brutalOneLiner}</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="score-dimensions">
            {DIMENSIONS.map(({ key, label, atsLabel }, i) => {
              const dim = scores[key]
              const sc = dim?.score ?? 0
              const c = scoreColor(sc)
              return (
                <div key={key}>
                  <div className="score-dim">
                    <div className="score-dim__label">
                      {atsLabel ? <><AtsTooltip /> Compatibility</> : label}
                    </div>
                    <div className="score-dim__bar-wrap">
                      <motion.div
                        className="score-dim__bar"
                        style={{ background: c }}
                        initial={{ width: 0 }}
                        animate={{ width: `${sc}%` }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 + i * 0.07 }}
                      />
                    </div>
                    <div className="score-dim__num" style={{ color: c }}>{sc}</div>
                  </div>
                  {isPaid && dim?.insight && (
                    <div className="score-dim__insight">{dim.insight}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
