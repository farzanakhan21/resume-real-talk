import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import TermsPage from './components/TermsPage'
import LandingNav from './components/landing/LandingNav'
import LandingHero from './components/landing/LandingHero'
import LandingWho from './components/landing/LandingWho'
import LandingWhat from './components/landing/LandingWhat'
import LandingProof from './components/landing/LandingProof'
import LandingAbout from './components/landing/LandingAbout'
import LandingCTA from './components/landing/LandingCTA'
import LandingFooter from './components/landing/LandingFooter'
import FAQPage from './components/FAQPage'
import MultiStepForm from './components/MultiStepForm'
import EmailGate from './components/EmailGate'
import LoadingScreen from './components/LoadingScreen'
import Results from './components/results/Results'
import RewriteModal from './components/RewriteModal'
import PaywallModal from './components/PaywallModal'

export default function App() {
  const [view, setView] = useState('home') // 'home' | 'loading' | 'results' | 'about' | 'faq'
  const [emailGateOpen, setEmailGateOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [pendingData, setPendingData] = useState(null)
  const [results, setResults] = useState(null)
  const [resultId, setResultId] = useState(null)
  const [rewriteTarget, setRewriteTarget] = useState(null)
  const [globalError, setGlobalError] = useState('')
  const [isPaid, setIsPaid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const trackPageView = (path) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: path })
    }
  }

  const navigateTo = (path) => {
    if (path === '/about') {
      // About is now a section on the homepage, not a separate page
      window.history.pushState({}, '', '/')
      setView('home')
      window.scrollTo({ top: 0 })
      setTimeout(() => {
        const el = document.getElementById('lp-about')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
      trackPageView('/about')
      return
    }
    window.history.pushState({}, '', path)
    if (path === '/faq') setView('faq')
    else if (path === '/terms') setView('terms')
    else setView('home')
    window.scrollTo({ top: 0 })
    trackPageView(path)
  }

  // Handle payment redirect, /about direct load, session restore, and back/forward
  useEffect(() => {
    // Fire initial page view
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', { page_path: window.location.pathname })
    }

    // Direct load of /faq or /terms
    if (window.location.pathname === '/faq') { setView('faq'); return }
    if (window.location.pathname === '/terms') { setView('terms'); return }
    // /about is now a homepage section — redirect home and scroll
    if (window.location.pathname === '/about') {
      window.history.replaceState({}, '', '/')
      setView('home')
      setTimeout(() => {
        const el = document.getElementById('lp-about')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 500)
      return
    }
    // Deep link: /results/:id — fetch persistent results from the API
    const resultsMatch = window.location.pathname.match(/^\/results\/([0-9a-f-]{36})$/i)
    if (resultsMatch) {
      const id = resultsMatch[1]
      fetch(`/api/results/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.results) {
            setResults(data.results)
            setIsPaid(data.isPaid || false)
            setUserEmail(data.email || '')
            setResultId(id)
            setView('results')
            window.scrollTo({ top: 0 })
          } else {
            // Results not found or expired — go home
            window.history.replaceState({}, '', '/')
            setView('home')
          }
        })
        .catch(() => {
          window.history.replaceState({}, '', '/')
          setView('home')
        })
      return
    }

    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const sessionId = params.get('session_id')
    const email = params.get('email')

    if (payment === 'success' && sessionId) {
      window.history.replaceState({}, '', '/')
      fetch(`/api/verify-payment?session_id=${sessionId}&email=${encodeURIComponent(email || '')}`)
        .then(r => r.json())
        .then(data => {
          if (data.paid) {
            const resolvedEmail = data.email || email || ''
            setIsPaid(true)
            setUserEmail(resolvedEmail)
            const saved = sessionStorage.getItem('nrhr_session')
            if (saved) {
              try {
                const { results: savedResults, jobTitle: savedJobTitle } = JSON.parse(saved)
                if (savedResults) {
                  setResults(savedResults)
                  sessionStorage.setItem('nrhr_session', JSON.stringify({ results: savedResults, isPaid: true, userEmail: resolvedEmail, jobTitle: savedJobTitle || '' }))
                  setView('results')
                  // Send paid email with PDF - fire and forget
                  fetch('/api/resend-results', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: resolvedEmail, jobTitle: savedJobTitle || '', data: savedResults, sessionId }),
                  }).catch(() => {})
                } else {
                  // No saved results (e.g. different tab/browser) - show confirmation banner
                  setPaymentConfirmed(true)
                }
              } catch {
                setPaymentConfirmed(true)
              }
            } else {
              setPaymentConfirmed(true)
            }
          }
        })
        .catch(() => {})
    } else if (payment === 'cancelled') {
      window.history.replaceState({}, '', '/')
    } else {
      // Restore results from sessionStorage (handles browser back button)
      const saved = sessionStorage.getItem('nrhr_session')
      if (saved) {
        try {
          const { results: savedResults, isPaid: savedPaid, userEmail: savedEmail, resultId: savedResultId } = JSON.parse(saved)
          if (savedResults) {
            setResults(savedResults)
            setIsPaid(savedPaid || false)
            setUserEmail(savedEmail || '')
            if (savedResultId) setResultId(savedResultId)
            setView('results')
          }
          // Note: jobTitle is also stored in the session but only needed for resend-results
        } catch {}
      }
    }

    const handlePopState = () => {
      const p = window.location.pathname
      if (p === '/faq') setView('faq')
      else if (p === '/terms') setView('terms')
      else setView('home')
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleFormSubmit = (formData) => {
    setPendingData(formData)
    setEmailGateOpen(true)
  }

  const handleEmailSubmit = async (email) => {
    setEmailGateOpen(false)
    setUserEmail(email)
    setView('loading')
    setGlobalError('')

    try {
      const fd = new FormData()
      fd.append('resume', pendingData.file)
      fd.append('jobTitle', pendingData.jobTitle)
      if (new URLSearchParams(window.location.search).get('test') === 'paid') {
        fd.append('testPaid', 'true')
      }
      fd.append('careerSituation', pendingData.careerSituation || '')
      fd.append('timeframe', pendingData.timeframe || '')
      fd.append('roleCategory', pendingData.roleCategory)
      fd.append('industry', pendingData.industry || '')
      fd.append('department', pendingData.department || '')
      fd.append('company', pendingData.company || '')
      fd.append('previousIndustry', pendingData.previousIndustry || '')
      fd.append('email', email)

      const res = await fetch('/api/analyze', { method: 'POST', body: fd })
      const json = await res.json()

      if (json.paywalled) {
        setView('home')
        setPaywallOpen(true)
        return
      }

      if (!res.ok || !json.success) throw new Error(json.error || 'Analysis failed.')

      setResults(json.data)
      setIsPaid(json.isPaid || false)
      if (json.resultId) setResultId(json.resultId)
      sessionStorage.setItem('nrhr_session', JSON.stringify({ results: json.data, isPaid: json.isPaid || false, userEmail: email, jobTitle: pendingData.jobTitle || '', resultId: json.resultId || null }))
      setView('results')
      window.scrollTo({ top: 0 })
    } catch (err) {
      setGlobalError(err.message)
      setView('home')
    }
  }

  const handleUpgrade = async (promoCode = '') => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, promoCode: promoCode.trim() }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
        return null
      } else {
        setCheckoutLoading(false)
        return json.error || 'Could not start checkout. Please try again.'
      }
    } catch {
      setCheckoutLoading(false)
      return 'Could not connect to payment service. Please try again.'
    }
  }

  const handleReset = () => {
    sessionStorage.removeItem('nrhr_session')
    setView('home')
    setResults(null)
    setResultId(null)
    setPendingData(null)
    setGlobalError('')
    setIsPaid(false)
    setUserEmail('')
    setPaymentConfirmed(false)
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      {view !== 'home' && view !== 'faq' && view !== 'about' && view !== 'terms' && <Header view={view} onNavigate={navigateTo} />}

      <AnimatePresence>
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LandingNav onNavigate={navigateTo} />
            <LandingHero />
            <LandingWho />
            <LandingCTA />
            <LandingWhat />
            <LandingAbout />
            <LandingProof />

            {/* ── Form section: purple header + cream body ── */}
            <div id="roast-form" className="lp-form-hero">
              <div className="lp-form-hero__inner">
                <span className="lp-section-tag lp-section-tag--gold">✦ roast my resume</span>
                <h2 className="lp-form-hero__title">Let's find out what's really going on.</h2>
              </div>
            </div>
            <div className="lp-form-body">
              <div className="lp-form-body__inner">
                {paymentConfirmed && (
                  <div className="lp-form-confirmed">
                    <span className="lp-form-confirmed__icon">✓</span>
                    <div>
                      <p className="lp-form-confirmed__title">Payment confirmed - you're in.</p>
                      <p className="lp-form-confirmed__sub">Re-upload your resume below to get your full paid report with PDF attached. Your email is already unlocked.</p>
                    </div>
                  </div>
                )}
                <div className="lp-form-wrap">
                  <MultiStepForm onSubmit={handleFormSubmit} error={globalError} />
                </div>
              </div>
            </div>
            <LandingFooter onNavigate={navigateTo} />
          </motion.div>
        )}

        {view === 'faq' && (
          <FAQPage key="faq" onNavigate={navigateTo} />
        )}

        {view === 'terms' && (
          <TermsPage key="terms" onNavigate={navigateTo} />
        )}

        {view === 'loading' && <LoadingScreen key="loading" />}

        {view === 'results' && results && (
          <Results
            key="results"
            data={results}
            isPaid={isPaid}
            userEmail={userEmail}
            onRewrite={setRewriteTarget}
            onReset={handleReset}
            onUpgrade={handleUpgrade}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {emailGateOpen && (
          <EmailGate
            onSubmit={handleEmailSubmit}
            onClose={() => setEmailGateOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {paywallOpen && (
          <PaywallModal
            email={userEmail}
            loading={checkoutLoading}
            onUpgrade={handleUpgrade}
            onClose={() => setPaywallOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rewriteTarget && (
          <RewriteModal
            target={rewriteTarget}
            onClose={() => setRewriteTarget(null)}
          />
        )}
      </AnimatePresence>

      {view !== 'results' && view !== 'home' && view !== 'faq' && view !== 'terms' && (
        <footer className="footer">
          <p>not ur regular hr - est. 2016 &copy; 2026 · built different. because you deserve better than a template.</p>
          <p className="footer__links">
            <button className="footer__link" onClick={() => navigateTo('/faq')}>FAQs</button>
            <button className="footer__link" onClick={() => navigateTo('/about')}>About</button>
          </p>
        </footer>
      )}
    </>
  )
}
