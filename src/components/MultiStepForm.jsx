import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { INDUSTRIES, getDepartments, getRoles } from '../roleData'
import SearchableSelect from './SearchableSelect'

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
}

export default function MultiStepForm({ onSubmit, error }) {
  const [step, setStep] = useState(1)

  // Step 1: cascading role selection
  const [industry, setIndustry] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')

  // Step 2: resume details
  const [file, setFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const [formError, setFormError] = useState('')
  const fileInputRef = useRef()

  const departments = industry ? getDepartments(industry) : []
  const roles = department ? getRoles(department) : []
  const isOtherRole = role === 'Other / Describe my role'

  // ── Cascading clear handlers ─────────────────────────────────────────────
  const handleIndustryChange = (val) => {
    setIndustry(val)
    setDepartment('')
    setRole('')
    setCustomRole('')
    setFormError('')
  }

  const handleDepartmentChange = (val) => {
    setDepartment(val)
    setRole('')
    setCustomRole('')
    setFormError('')
  }

  const handleRoleChange = (val) => {
    setRole(val)
    setCustomRole('')
    setFormError('')
  }

  // ── Step 1 → Step 2 ──────────────────────────────────────────────────────
  const handleRoleNext = () => {
    if (!industry) return setFormError('Select your industry — we need this to calibrate the whole analysis.')
    if (!department) return setFormError('Select your department so we can narrow the feedback.')
    if (!role) return setFormError('Pick your role — this is the last step before the real stuff.')
    if (isOtherRole && !customRole.trim()) return setFormError('Tell us what role you\'re going for.')
    setFormError('')
    setStep(2)
  }

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') return setFormError('PDF only please — we can\'t read anything else.')
    setFile(f)
    setFormError('')
  }

  // ── Final submit ─────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return setFormError('Drop your resume in first.')
    if (!jobTitle.trim()) return setFormError('We need the exact job title you\'re targeting.')
    if (!company.trim()) return setFormError('Tell us what company or type of company you\'re targeting.')
    setFormError('')
    onSubmit({
      file,
      jobTitle: jobTitle.trim(),
      industry,
      department,
      roleCategory: isOtherRole ? customRole.trim() : role,
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
            <p style={{ marginBottom: '1.75rem', fontSize: '1.15rem', fontWeight: 700, color: '#7C3AED' }}>
              Tell us exactly where you work. We'll calibrate every bit of feedback to your industry, department and role.
            </p>

            {/* Industry */}
            <div className="field">
              <label className="field__label">Industry <span>*</span></label>
              <select
                className="input"
                value={industry}
                onChange={(e) => handleIndustryChange(e.target.value)}
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Department — appears once industry is selected */}
            <AnimatePresence>
              {industry && (
                <motion.div
                  className="field"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <label className="field__label">Department <span>*</span></label>
                  <select
                    className="input"
                    value={department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                  >
                    <option value="">Select your department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role — appears once department is selected */}
            <AnimatePresence>
              {department && (
                <motion.div
                  className="field"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <label className="field__label">Role <span>*</span></label>
                  <SearchableSelect
                    value={role}
                    onChange={handleRoleChange}
                    options={roles}
                    placeholder="Search or select your role…"
                    disabled={!department}
                  />
                  <p className="field__hint">Start typing to filter the list.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom role — appears if "Other / Describe my role" is selected */}
            <AnimatePresence>
              {isOtherRole && (
                <motion.div
                  className="field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <label className="field__label">Describe your role <span>*</span></label>
                  <input
                    className="input"
                    value={customRole}
                    onChange={(e) => { setCustomRole(e.target.value); setFormError('') }}
                    placeholder="e.g. Head of People at a Series B startup"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {formError && <div className="error-msg">{formError}</div>}

            <button
              className="btn btn--primary"
              style={{ marginTop: '1.5rem' }}
              onClick={handleRoleNext}
            >
              Next <span className="btn-arrow">→</span>
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
                Roast My Resume <span className="btn-arrow">→</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
