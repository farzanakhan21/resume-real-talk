import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { copyToClipboard } from '../utils'

const VERSIONS = [
  { key: 'ats', label: 'ATS-Optimised', desc: 'Keyword-rich, metric-driven, scan-friendly' },
  { key: 'executive', label: 'Executive', desc: 'Strategic framing, authority language, outcome-led' },
  { key: 'startup', label: 'Startup / Founder', desc: 'Punchy, direct, zero corporate BS' },
  { key: 'concise', label: 'Ultra-Concise', desc: 'Maximum signal, minimum words' },
]

export default function RewriteModal({ target, onClose }) {
  const [loading, setLoading] = useState(true)
  const [rewrites, setRewrites] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    async function fetchRewrites() {
      try {
        const res = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'Rewrite failed.')
        setRewrites(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRewrites()
  }, [target])

  const handleCopy = (key, text) => {
    copyToClipboard(text, () => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <button className="modal__close" onClick={onClose}>✕</button>
        <div className="modal__badge">rewrite studio</div>
        <h2 style={{ marginBottom: '0.5rem' }}>{target.section}</h2>
        <p style={{ marginBottom: '0' }}>
          Four rewrites, four positioning angles. Copy the one that fits.
        </p>

        {loading && (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <div className="loading__spinner" style={{ margin: '0 auto 1rem' }} />
            <p className="muted small">Crafting rewrites…</p>
          </div>
        )}

        {error && <div className="error-msg mt-2">{error}</div>}

        {rewrites && (
          <div className="rewrite-versions">
            {VERSIONS.map(({ key, label, desc }) => (
              <div key={key} className="rewrite-version">
                <div className="rewrite-version__label">
                  <span>{label} <span className="muted" style={{ fontWeight: 400 }}>· {desc}</span></span>
                  <button
                    className={`btn--icon ${copied === key ? 'copied' : ''}`}
                    onClick={() => handleCopy(key, rewrites[key])}
                  >
                    {copied === key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="rewrite-version__text">{rewrites[key]}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
