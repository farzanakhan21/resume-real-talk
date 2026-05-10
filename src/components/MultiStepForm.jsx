import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROLE_CATEGORIES } from '../utils'

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
}

export default function MultiStepForm({ onSubmit, error }) {
  const [step, setStep] = useState(1)
  const [roleCategory, setRoleCategory] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [file, setFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [formError, setFormError] = useState('')
  const fileInputRef = useRef()

  const handleRoleNext = () => {
    if (!roleCategory) return setFormError('Please select a role category.')
    if (roleCategory === 'custom' && !customRole.trim()) return setFormError('Please describe your target role.')
    setFormError('')
    setStep(2)
  }

  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') return setFormError('Please upload a PDF file.')
    setFile(f)
    setFormError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return setFormError('Please upload your resume PDF.')
    if (!jobTitle.trim()) return setFormError('Please enter your target job title.')
    setFormError('')
    onSubmit({
      file,
      jobTitle: jobTitle.trim(),
      roleCategory: roleCategory === 'custom' ? customRole.trim() : roleCategory,
      company: company.trim(),
    })
  }

  return (
    <div>
      <div className="step-indicator" style={{ marginBottom: '2.5rem' }}>
        <div className={`step-dot ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`} />
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" {...slide}>
            <p className="muted small mb-3" style={{ marginBottom: '1.25rem' }}>
              What role are you targeting? We'll tailor the entire analysis to this.
            </p>
            <div className="role-grid mb-4" style={{ marginBottom: '1.5rem' }}>
              {ROLE_CATEGORIES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`role-btn ${roleCategory === r.id ? 'selected' : ''}`}
                  onClick={() => { setRoleCategory(r.id); setFormError('') }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {roleCategory === 'custom' && (
              <motion.div
                className="field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                style={{ marginBottom: '1.5rem' }}
              >
                <label className="field__label">Describe your role</label>
                <input
                  className="input"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Head of People at a Series B startup"
                />
              </motion.div>
            )}

            {formError && <div className="error-msg">{formError}</div>}

            <button className="btn btn--primary mt-2" style={{ marginTop: '1.5rem' }} onClick={handleRoleNext}>
              Continue <span className="btn-arrow">→</span>
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" {...slide}>
            <button
              type="button"
              className="btn btn--ghost"
              style={{ marginBottom: '1.75rem', fontSize: '0.8rem' }}
              onClick={() => setStep(1)}
            >
              ← Back
            </button>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label className="field__label">Upload your resume <span>*</span></label>
                <div
                  className={`drop-zone ${dragOver ? 'over' : ''}`}
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  <span className="drop-zone__icon">{file ? '✓' : '📄'}</span>
                  <span className="drop-zone__text">{file ? file.name : 'Click or drag your PDF here'}</span>
                  {!file && <span className="drop-zone__sub">PDF only · max 10MB</span>}
                  {file && <span className="drop-zone__file">Ready to analyse</span>}
                </div>
              </div>

              <div className="field">
                <label className="field__label">Exact target job title <span>*</span></label>
                <input
                  className="input"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Head of People, Senior Product Manager"
                  required
                />
              </div>

              <div className="field">
                <label className="field__label">Target company <em>(optional, makes analysis more specific)</em></label>
                <input
                  className="input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Atlassian, Canva, a Series B fintech"
                />
              </div>

              {(formError || error) && <div className="error-msg">{formError || error}</div>}

              <button type="submit" className="btn btn--primary" style={{ marginTop: '1.5rem' }}>
                Get My Positioning Analysis <span className="btn-arrow">→</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
