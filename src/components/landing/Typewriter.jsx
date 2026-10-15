import { useState, useEffect } from 'react'

const PHRASES = ['not ur regular hr.', 'roast my resume.', 'real talk only.']
const TYPE_MS = 60
const DELETE_MS = 30
const PAUSE_FULL = 1800
const PAUSE_EMPTY = 300

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Typewriter() {
  const [display, setDisplay] = useState(prefersReducedMotion ? PHRASES[0] : '')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return
    const phrase = PHRASES[index]
    let timeout

    if (!deleting && display === phrase) {
      // fully typed → hold, then start deleting
      timeout = setTimeout(() => setDeleting(true), PAUSE_FULL)
    } else if (deleting && display === '') {
      // fully deleted → brief pause, then advance to next phrase
      timeout = setTimeout(() => {
        setDeleting(false)
        setIndex(i => (i + 1) % PHRASES.length)
      }, PAUSE_EMPTY)
    } else {
      // type or delete one character
      const next = deleting
        ? phrase.slice(0, display.length - 1)
        : phrase.slice(0, display.length + 1)
      timeout = setTimeout(() => setDisplay(next), deleting ? DELETE_MS : TYPE_MS)
    }

    return () => clearTimeout(timeout)
  }, [display, deleting, index])

  return (
    <span className="typewriter" aria-hidden="true">
      <span className="typewriter__text">{display}</span>
      <span className="typewriter__cursor" />
    </span>
  )
}
