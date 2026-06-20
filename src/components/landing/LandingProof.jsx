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
const RESUME_DELAY = 2500

export default function LandingProof() {
  const [current, setCurrent] = useState(0)
  const outerRef = useRef(null)
  const cardRefs = useRef([])
  const intervalRef = useRef(null)
  const programmaticRef = useRef(false)
  const count = QUOTES.length

  // Scroll the container to a card index — never call this inside a state updater
  const scrollToCard = useCallback((i) => {
    const outer = outerRef.current
    const card = cardRefs.current[i]
    if (!outer || !card) return
    programmaticRef.current = true
    outer.scrollTo({ left: i * (card.offsetWidth + CARD_GAP), behavior: 'smooth' })
    setTimeout(() => { programmaticRef.current = false }, 800)
  }, [])

  // Interval updates state only — scroll is handled by the effect below
  const startAutoplay = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % count)
    }, INTERVAL_MS)
  }, [count])

  // Whenever current changes (from timer or dot click), scroll to that card
  useEffect(() => {
    scrollToCard(current)
  }, [current, scrollToCard])

  // Start autoplay on mount
  useEffect(() => {
    startAutoplay()
    return () => clearInterval(intervalRef.current)
  }, [startAutoplay])

  // Detect manual swipe — pause timer, resume after RESUME_DELAY
  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    let resumeTimer = null
    const onScroll = () => {
      if (programmaticRef.current) return
      clearInterval(intervalRef.current)
      clearTimeout(resumeTimer)
      resumeTimer = setTimeout(startAutoplay, RESUME_DELAY)
    }
    outer.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      outer.removeEventListener('scroll', onScroll)
      clearTimeout(resumeTimer)
    }
  }, [startAutoplay])

  // Dot click: setCurrent triggers the scroll effect; restart timer
  const goTo = useCallback((i) => {
    setCurrent(i)
    startAutoplay()
  }, [startAutoplay])

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
