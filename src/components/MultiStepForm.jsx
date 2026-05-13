import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROLE_CATEGORIES } from '../utils'

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
}

const INDUSTRIES = [
  'Construction & Engineering',
  'Creative & Design',
  'Education',
  'Finance & Banking',
  'Government & Public Sector',
  'Healthcare & Medical',
  'Hospitality & Tourism',
  'HR & People & Culture',
  'Legal & Professional Services',
  'Marketing & Media',
  'Not-for-Profit & Social Impact',
  'Operations & Logistics',
  'Retail & E-commerce',
  'Sales & Business Development',
  'Technology & Startups',
  'Other (I\'ll describe below)',
]

export default function MultiStepForm({ onSubmit, error }) {
  const [step, setStep] = useState(1)
  const [roleCategory, setRoleCategory] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [file, setFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [company, setCompany] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [formError, setFormError] = useState('')
  const fileInputRef = useRef()

  const handleRoleNext = () => {
    if (!roleCategory) return setFormError('Pick a category first - we need this to calibrate the whole analysis.')
    if (roleCategory === 'custom' && !customRole.trim()) return setFormError('Tell us what role you\'re going for.')
    setFormError('')
    setStep(2)
  }

  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') return setFormError('PDF only please - we can\'t read anything else.')
    setFile(f)
    setFormError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return setFormError('Drop your resume in first.')
    if (!jobTitle.trim()) return setFormError('We need the exact job title you\'re targeting.')
    if (!industry) return setFormError('Select your industry so we can tailor the feedback.')
    if (!company.trim()) return setFormError('Tell us what company or type of company you\'re targeting.')
    setFormError('')
    onSubmit({
      file,
      jobTitle: jobTitle.trim(),
      roleCategory: roleCategory === 'custom' ? customRole.trim() : roleCategory,
      industry: industry.trim(),
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
            <p className="muted small mb-3" style={{ marginBottom: '1.25rem', fontWeight: 500 }}>
              Pick the bucket you belong in. We'll calibrate the whole analysis to it.
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
                <label className="field__label">Tell us what you're going for</label>
                <input
                  className="input"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Head of People at a Series B startup"
                />
              </motion.div>
            )}

            {formError && <div className="error-msg">{formError}</div>}

            <button className="btn btn--primary" style={{ marginTop: '1.5rem' }} onClick={handleRoleNext}>
              Let's go <span className="btn-arrow">→</span>
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
                <label className="field__label">Your resume <span>*</span></label>
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
                  <span className="drop-zone__text">
                    {file ? file.name : 'Drop your resume here. We won\'t sugarcoat it.'}
                  </span>
                  {!file && <span className="drop-zone__sub">PDF only · max 10MB</span>}
                  {file && <span className="drop-zone__file">Locked and loaded ✓</span>}
                </div>
                <p className="privacy-note">
                  Your resume is processed securely by AI and never stored or shared. I only keep your email address to send you your results.
                </p>
              </div>

              <div className="field">
                <label className="field__label">Exact job title you're targeting <span>*</span></label>
                <input
                  className="input"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Head of People, Senior Product Manager"
                  required
                />
                <p className="field__hint">Be specific — not just 'manager' but 'People &amp; Culture Manager at a scaling startup'.</p>
              </div>

              <div className="field">
                <label className="field__label">YOUR INDUSTRY <span>*</span></label>
                <select
                  className="input"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <p className="field__hint">This helps us tailor your feedback to how hiring actually works in your industry.</p>
              </div>

              <div className="field">
                <label className="field__label">Target company <span>*</span></label>
                <input
                  className="input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Atlassian, Canva, a Series B fintech"
                  required
                />
                <p className="field__hint">Don't have a specific company? Enter the type of company you're targeting — e.g. 'Series B tech startup' or 'large hospitality group'.</p>
              </div>

              {(formError || error) && <div className="error-msg">{formError || error}</div>}

              <button type="submit" className="btn btn--primary" style={{ marginTop: '1.5rem' }}>
                Show me the truth <span className="btn-arrow">→</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
