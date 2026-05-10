import { useState } from 'react'
import { motion } from 'framer-motion'
import { copyToClipboard } from '../../utils'

export default function PositioningStrategy({ data }) {
  const [copiedHeadline, setCopiedHeadline] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <div className="card result-block" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <div className="card-header__icon">🧭</div>
          <div>
            <div className="card-header__title">Your Positioning Narrative</div>
            <div className="card-header__sub">The angle you should own for this role</div>
          </div>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--text)', marginBottom: '1.5rem' }}>{data.narrativeAngle}</p>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Elevator pitch</div>
          <div className="insight-block amber">{data.elevatorPitch}</div>
        </div>
      </div>

      <div className="card result-block" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>LinkedIn headline: rewrite to this</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--amber)', lineHeight: 1.4 }}>{data.linkedinHeadline}</div>
          </div>
          <button
            className={`btn--icon ${copiedHeadline ? 'copied' : ''}`}
            style={{ flexShrink: 0 }}
            onClick={() => copyToClipboard(data.linkedinHeadline, () => { setCopiedHeadline(true); setTimeout(() => setCopiedHeadline(false), 2000) })}
          >
            {copiedHeadline ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="card result-block">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div className="card-header__icon">🔑</div>
          <div className="card-header__title">Keywords to Own Everywhere</div>
        </div>
        <div className="tag-row">
          {data.keywordsToOwn?.map((k, i) => <span key={i} className="tag amber">{k}</span>)}
        </div>
        <p className="muted" style={{ fontSize: '0.82rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
          Weave these into your resume, LinkedIn headline, About section, and how you talk about your work.
        </p>
      </div>
    </motion.div>
  )
}
