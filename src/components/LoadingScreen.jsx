import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  "Doing what your last recruiter wouldn't...",
  "Reading between the lines...",
  "Separating the buzzwords from the results...",
  "Finding out what hiring managers actually see...",
  "Checking for ATS landmines...",
  "Spotting your hidden competitive advantages...",
  "Translating career story into positioning strategy...",
]

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      className="loading"
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading__eyebrow">not ur regular hr</div>
      <h2 className="loading__title">
        Working on your<br />reality check.
      </h2>
      <div className="loading__spinner" />
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          className="loading__msg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          {MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}
