import { useState } from 'react'
import { motion } from 'framer-motion'

export default function EmailGate({ onSubmit, onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return setError('That doesn\'t look like an email address.')
    setError('')
    onSubmit(email.trim())
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <button className="modal__close" onClick={onClose}>✕</button>
        <div className="modal__badge">one last thing</div>
        <h2>Where should we send your reality check?</h2>
        <p>
          Your analysis is ready. Drop your email and we'll pull it right up. We'll occasionally send career intel worth your time — nothing else.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoFocus
              required
            />
          </div>
          {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" className="btn btn--primary">
            Show me the analysis <span className="btn-arrow">→</span>
          </button>
        </form>
      </motion.div>
    </div>
  )
}
