import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import MultiStepForm from './components/MultiStepForm'
import EmailGate from './components/EmailGate'
import LoadingScreen from './components/LoadingScreen'
import Results from './components/results/Results'
import RewriteModal from './components/RewriteModal'
import PaywallModal from './components/PaywallModal'

export default function App() {
  const [view, setView] = useState('home') // 'home' | 'loading' | 'results'
  const [emailGateOpen, setEmailGateOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [pendingData, setPendingData] = useState(null)
  const [results, setResults] = useState(null)
  const [rewriteTarget, setRewriteTarget] = useState(null)
  const [globalError, setGlobalError] = useState('')
  const [isPaid, setIsPaid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Handle payment redirect back from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const sessionId = params.get('session_id')
    const email = params.get('email')

    if (payment === 'success' && sessionId) {
      // Clean up URL
      window.history.replaceState({}, '', '/')
      // Verify payment server-side and mark paid
      fetch(`/api/verify-payment?session_id=${sessionId}&email=${encodeURIComponent(email || '')}`)
        .then(r => r.json())
        .then(data => {
          if (data.paid) {
            setIsPaid(true)
            setUserEmail(data.email || email || '')
          }
        })
        .catch(() => {})
    } else if (payment === 'cancelled') {
      window.history.replaceState({}, '', '/')
    }
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
      fd.append('roleCategory', pendingData.roleCategory)
      fd.append('company', pendingData.company || '')
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
      setView('results')
      window.scrollTo({ top: 0 })
    } catch (err) {
      setGlobalError(err.message)
      setView('home')
    }
  }

  const handleUpgrade = async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        alert(json.error || 'Could not start checkout. Please try again.')
        setCheckoutLoading(false)
      }
    } catch {
      alert('Could not connect to payment service. Please try again.')
      setCheckoutLoading(false)
    }
  }

  const handleReset = () => {
    setView('home')
    setResults(null)
    setPendingData(null)
    setGlobalError('')
    setIsPaid(false)
    setUserEmail('')
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <Header />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <>
            <Hero />
            <div className="container--narrow" style={{ paddingBottom: '6rem' }}>
              <MultiStepForm onSubmit={handleFormSubmit} error={globalError} />
            </div>
          </>
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

      {view !== 'results' && (
        <footer className="footer">
          <p>not ur regular hr &copy; 2025. On your side, not lying to you about it.</p>
        </footer>
      )}
    </>
  )
}
