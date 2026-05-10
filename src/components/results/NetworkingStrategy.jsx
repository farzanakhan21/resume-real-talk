import { useState } from 'react'
import { motion } from 'framer-motion'
import { copyToClipboard } from '../../utils'

export default function NetworkingStrategy({ data }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    copyToClipboard(data.connectionTemplate, () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <div className="card result-block" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <div className="card-header__icon">🎯</div>
          <div>
            <div className="card-header__title">Who to Connect With</div>
            <div className="card-header__sub">Target these titles for warm introductions</div>
          </div>
        </div>
        <div className="tag-row" style={{ marginBottom: '1.25rem' }}>
          {data.targetTitles?.map((t, i) => <span key={i} className="tag amber">{t}</span>)}
        </div>
        <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{data.approachStrategy}</p>
      </div>

      <div className="card result-block" style={{ marginBottom: '1rem' }}>
        <div className="card-header">
          <div className="card-header__icon">📍</div>
          <div>
            <div className="card-header__title">Where to Show Up</div>
          </div>
        </div>
        <div className="two-col">
          <div>
            <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Communities to join</div>
            <ul className="check-list">
              {data.communities?.map((c, i) => (
                <li key={i} data-icon="→" style={{ color: 'var(--text-secondary)' }}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Events to attend</div>
            <ul className="check-list">
              {data.events?.map((e, i) => (
                <li key={i} data-icon="→" style={{ color: 'var(--text-secondary)' }}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card result-block card--amber">
        <div className="card-header">
          <div className="card-header__icon">✉️</div>
          <div>
            <div className="card-header__title">Ready-to-Send Connection Message</div>
            <div className="card-header__sub">Under 280 characters. Paste directly into LinkedIn.</div>
          </div>
        </div>
        <div className="message-box" style={{ marginBottom: '1rem' }}>
          {data.connectionTemplate}
        </div>
        <button
          className={`btn--icon ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied!' : 'Copy message'}
        </button>
      </div>
    </motion.div>
  )
}
