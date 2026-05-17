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

const CAREER_SITUATIONS = [
  'Employed and looking',
  'Unemployed and actively searching',
  'Exploring my options',
  'Pivoting industries',
  'Recently made redundant',
  'Returning to the workforce',
  'Other',
]

const TIMEFRAMES = [
  'I need a role ASAP (1-3 months)',
  'I\'m being strategic (3-6 months)',
  'I\'m planning ahead (6-12 months)',
  'I\'m not sure yet',
]

function OptionCard({ label, selected, onClick }) {
  return (
    <button
      type="button"
      className={`option-card${selected ? ' option-card--selected' : ''}`}
      onClick={onClick}
    >
      <span className="option-card__check">{selected ? '✓' : ''}</span>
      <span className="option-card__label">{label}</span>
    </button>
  )
}

export default function MultiStepForm({ onSubmit, error }) {
  const [step, setStep] = useState(1)

  // Step 1: career situation
  const [careerSituation, setCareerSituation] = useState('')
  const [otherSituation, setOtherSituation] = useState('')
  const [previousIndustry, setPreviousIndustry] = useState('')
  const isOtherSituation = careerSituation === 'Other'
  const isPivoting = careerSituation === 'Pivoting industries'

  // Step 2: timeframe
  const [timeframe, setTimeframe] = useState('')

  // Step 3: cascading role selection
  const [industry, setIndustry] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')

  // Step 4: resume details
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
    setIndustry(val); setDepartment(''); setRole(''); setCustomRole(''); setFormError('')
  }
  const handleDepartmentChange = (val) => {
    setDepartment(val); setRole(''); setCustomRole(''); setFormError('')
  }
  const handleRoleChange = (val) => {
    setRole(val); setCustomRole(''); setFormError('')
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  const handleSituationNext = () => {
    if (!careerSituation) return setFormError('Let us know where you\'re at right now.')
    if (isOtherSituation && !otherSituation.trim()) return setFormError('Tell us a bit about your situation.')
    if (isPivoting && !previousIndustry) return setFormError('Tell us which industry you\'re coming from - this shapes the whole analysis.')
    setFormError(''); setStep(2)
  }

  const handleTimeframeNext = () => {
    if (!timeframe) return setFormError('Tell us how soon you\'re looking to move.')
    setFormError(''); setStep(3)
  }

  const handleRoleNext = () => {
    if (!industry) return setFormError('Select your industry - we need this to calibrate the whole analysis.')
    if (!department) return setFormError('Select your department so we can narrow the feedback.')
    if (!role) return setFormError('Pick your role - this is the last step before the real stuff.')
    if (isOtherRole && !customRole.trim()) return setFormError('Tell us what role you\'re going for.')
    setFormError(''); setStep(4)
  }

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') return setFormError('PDF only please - we can\'t read anything else.')
    setFile(f); setFormError('')
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
      careerSituation: isOtherSituation ? otherSituation.trim() : careerSituation,
      timeframe,
      industry,
      department,
      roleCategory: isOtherRole ? customRole.trim() : role,
      company: company.trim(),
      previousIndustry: isPivoting ? previousIndustry : '',
    })
  }

  const totalSteps = 4

  return (
    <div>
      {/* Step indicator */}
      <div className="step-indicator" style={{ marginBottom: '2.5rem' }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`step-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Career Situation ── */}
        {step === 1 && (
          <motion.div key="step1" {...slide}>
            <p className="form-step-label">WHERE ARE YOU RIGHT NOW?</p>
            <p className="form-step-hint">This helps us tailor your feedback to your actual situation.</p>

            <div className="option-grid">
              {CAREER_SITUATIONS.map(opt => (
                <OptionCard
                  key={opt}
                  label={opt}
                  selected={careerSituation === opt}
                  onClick={() => { setCareerSituation(opt); setOtherSituation(''); setPreviousIndustry(''); setFormError('') }}
                />
              ))}
            </div>

            <AnimatePresence>
              {isOtherSituation && (
                <motion.div
                  className="field"
                  style={{ marginTop: '0.75rem' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <label className="field__label">Describe your situation <span>*</span></label>
                  <input
                    className="input"
                    value={otherSituation}
                    onChange={(e) => { setOtherSituation(e.target.value); setFormError('') }}
                    placeholder="e.g. Freelancing and looking to go back in-house"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isPivoting && (
                <motion.div
                  className="field pivot-industry-field"
                  style={{ marginTop: '0.75rem' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="form-step-label" style={{ fontSize: '0.82rem', marginBottom: '0.3rem' }}>WHAT INDUSTRY ARE YOU COMING FROM?</p>
                  <p className="field__hint" style={{ marginBottom: '0.75rem' }}>This helps us identify your transferable skills and how to reframe your experience for your target industry.</p>
                  <select
                    className="input"
                    value={previousIndustry}
                    onChange={(e) => { setPreviousIndustry(e.target.value); setFormError('') }}
                  >
                    <option value="">Select your current industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {formError && <div className="error-msg" style={{ marginTop: '1rem' }}>{formError}</div>}

            <button className="btn btn--primary" style={{ marginTop: '1.5rem' }} onClick={handleSituationNext}>
              Next <span className="btn-arrow">→</span>
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Timeframe ── */}
        {step === 2 && (
          <motion.div key="step2" {...slide}>
            <button type="button" className="btn btn--ghost" style={{ marginBottom: '1.75rem', fontSize: '0.8rem' }} onClick={() => setStep(1)}>
              ← Back
            </button>

            <p className="form-step-label">HOW SOON ARE YOU LOOKING TO MAKE A MOVE?</p>
            <p className="form-step-hint">We'll adjust the urgency and strategy of your feedback accordingly.</p>

            <div className="option-grid">
              {TIMEFRAMES.map(opt => (
                <OptionCard
                  key={opt}
                  label={opt}
                  selected={timeframe === opt}
                  onClick={() => { setTimeframe(opt); setFormError('') }}
                />
              ))}
            </div>

            {formError && <div className="error-msg" style={{ marginTop: '1rem' }}>{formError}</div>}

            <button className="btn btn--primary" style={{ marginTop: '1.5rem' }} onClick={handleTimeframeNext}>
              Next <span className="btn-arrow">→</span>
            </button>
          </motion.div>
        )}

        {/* ── Step 3: Industry / Department / Role ── */}
        {step === 3 && (
          <motion.div key="step3" {...slide}>
            <button type="button" className="btn btn--ghost" style={{ marginBottom: '1.75rem', fontSize: '0.8rem' }} onClick={() => setStep(2)}>
              ← Back
            </button>

            <p className="form-step-label">WHAT'S YOUR INDUSTRY &amp; ROLE?</p>
            <p className="form-step-hint">We'll calibrate every bit of feedback to your industry, department and role.</p>

            {/* Industry */}
            <div className="field">
              <label className="field__label">Industry <span>*</span></label>
              <select className="input" value={industry} onChange={(e) => handleIndustryChange(e.target.value)}>
                <option value="">Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Department - appears once industry is selected */}
            <AnimatePresence>
              {industry && (
                <motion.div className="field" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                  <label className="field__label">Department <span>*</span></label>
                  <select className="input" value={department} onChange={(e) => handleDepartmentChange(e.target.value)}>
                    <option value="">Select your department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role - appears once department is selected */}
            <AnimatePresence>
              {department && (
                <motion.div className="field" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
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

            {/* Custom role */}
            <AnimatePresence>
              {isOtherRole && (
                <motion.div className="field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
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

            <button className="btn btn--primary" style={{ marginTop: '1.5rem' }} onClick={handleRoleNext}>
              Next <span className="btn-arrow">→</span>
            </button>
          </motion.div>
        )}

        {/* ── Step 4: File + Details ── */}
        {step === 4 && (
          <motion.div key="step4" {...slide}>
            <button type="button" className="btn btn--ghost" style={{ marginBottom: '1.75rem', fontSize: '0.8rem' }} onClick={() => setStep(3)}>
              ← Back
            </button>

            <p className="form-step-label">UPLOAD YOUR RESUME</p>
            <p className="form-step-hint">Drop your resume or LinkedIn PDF and tell us exactly what you're targeting.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label className="field__label">Upload your resume or LinkedIn profile PDF <span>*</span></label>
                <div
                  className={`drop-zone ${dragOver ? 'over' : ''}`}
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={(e) => handleFile(e.target.files[0])} />
                  <span className="drop-zone__icon">{file ? '✓' : '📄'}</span>
                  <span className="drop-zone__text">
                    {file ? file.name : 'Drop your resume or LinkedIn PDF here.'}
                  </span>
                  {!file && <span className="drop-zone__sub">PDF only · max 10MB</span>}
                  {file && <span className="drop-zone__file">Locked and loaded ✓</span>}
                </div>
                <p className="field__hint" style={{ marginTop: '0.5rem' }}>
                  To download your LinkedIn profile as a PDF - go to your LinkedIn profile - click 'More' - select 'Save to PDF'.
                </p>
                <p className="privacy-note">
                  Your document is processed securely by AI and never stored or shared. I only keep your email address to send you your results.
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
                <p className="field__hint">Be specific - not just 'manager' but 'People &amp; Culture Manager at a scaling startup'.</p>
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
                <p className="field__hint">Don't have a specific company? Enter the type of company you're targeting - e.g. 'Series B tech startup' or 'large hospitality group'.</p>
              </div>

              {(formError || error) && <div className="error-msg">{formError || error}</div>}

              <p className="form-disclaimer">
                This analysis is generated by AI based on the information you provide. Results are designed to give you useful career insights and starting points - not guaranteed outcomes. Always use your own judgement and seek professional advice where needed.
              </p>

              <button type="submit" className="btn btn--primary" style={{ marginTop: '1rem' }}>
                Roast My Resume <span className="btn-arrow">→</span>
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
