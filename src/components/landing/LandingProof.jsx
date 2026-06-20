import { useState, useEffect, useRef, useCallback } from 'react'

const QUOTES = [
  { quote: 'omg it made me want to cry', meta: 'S.' },
  { quote: 'I made immediate changes to my profile', meta: 'M.' },
  { quote: 'I was so curious from the roast, I deffs would pay for the full report', meta: 'D.' },
  { quote: 'The market needs something more refreshingly honest and actionable.', meta: 'S.' },
  { quote: 'Unintentional signal is spot on.', meta: 'M.' },
]

const CARD_GAP = 20
const INTERVAL_MS = 4500
const RESUME_AFTER_MANUAL_MS = 2500

export default function LandingProof() {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef(null)
  const outerRef = useRef(null)
  const cardRefs = useRef([])
  const isProgrammaticRef = useRef(false)
  const count = QUOTES.length

  // Scroll the carousel container to a specific card index
  const scrollToCard = useCallback((i) => {
    const outer = outerRef.current
    const card = cardRefs.current[i]
    if (!outer || !card) return
    isProgrammaticRef.current = true
    outer.scrollTo({ left: i * (card.offsetWidth + CARD_GAP), behavior: 'smooth' })
    // Clear the flag after smooth scroll settles (~600ms)
    setTimeout(() => { isProgrammaticRef.current = false }, 600)
  }, [])

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % count
        scrollToCard(next)
        return next
      })
    }, INTERVAL_MS)
  }, [count, scrollToCard])

  // Start auto-advance on mount
  useEffect(() => {
    startInterval()
    return () => clearInterval(intervalRef.current)
  }, [startInterval])

  // Pause on manual swipe, resume after RESUME_AFTER_MANUAL_MS
  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    let resumeTimeout = null

    const handleScroll = () => {
      if (isProgrammaticRef.current) return
      clearInterval(intervalRef.current)
      clearTimeout(resumeTimeout)
      resumeTimeout = setTimeout(startInterval, RESUME_AFTER_MANUAL_MS)
    }

    outer.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      outer.removeEventListener('scroll', handleScroll)
      clearTimeout(resumeTimeout)
    }
  }, [startInterval])

  const goTo = useCallback((i) => {
    setCurrent(i)
    scrollToCard(i)
    startInterval()
  }, [scrollToCard, startInterval])

  return (
    <section className="lp-proof">
      <div className="lp-proof__inner">
        <div className="lp-section-header">
          <span className="lp-section-tag">In Their Words</span>
          <h2 className="lp-section-title">The early feedback says it best.</h2>
        </div>
      </div>

      <div className="lp-proof__carousel-outer" ref={outerRef}>
        <div className="lp-proof__carousel-track">
          {QUOTES.map(({ quote, meta }, i) => (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el }}
              className="lp-proof__card"
            >
              <p className="lp-proof__quote">"{quote}"</p>
              <div className="lp-proof__meta">
                <span className="lp-proof__name">{meta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-proof__dots">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            className={`lp-proof__dot${i === current ? ' lp-proof__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
