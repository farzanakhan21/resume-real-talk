import { useState } from 'react'
import { motion } from 'framer-motion'
import { copyToClipboard } from '../../utils'

function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.75rem' }}>
        <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
        <button
          className={`btn--icon ${copied ? 'copied' : ''}`}
          style={{ flexShrink: 0 }}
          onClick={() => copyToClipboard(text, () => { setCopied(true); setTimeout(() => setCopied(false), 2000) })}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="message-box" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{text}</div>
    </div>
  )
}

export default function LinkedInRewrite({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <div className="card result-block" style={{ marginBottom: '1rem' }}>
        <div className="card-header" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header__icon">💼</div>
          <div>
            <div className="card-header__title">LinkedIn Profile Rewrite</div>
            <div className="card-header__sub">Copy-paste ready. Optimised for your target role.</div>
          </div>
        </div>

        <CopyBlock label="Headline" text={data.headline} />
        <CopyBlock label="About section" text={data.aboutSection} />
        <CopyBlock label="Experience framing" text={data.experienceFraming} />

        {data.featuredSection && (
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <div className="muted small" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Featured section recommendation</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.featuredSection}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
