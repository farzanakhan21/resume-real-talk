import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const MESSAGES = [
  'Reading between the lines of your resume…',
  'Analysing what recruiters actually see…',
  'Scanning for ATS compatibility issues…',
  'Assessing executive presence signals…',
  'Finding your hidden competitive advantages…',
  'Mapping industry translation gaps…',
  'Crafting your positioning strategy…',
]

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 2400)
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
      <div className="loading__spinner" />
      <motion.p
        key={msgIndex}
        className="loading__msg"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {MESSAGES[msgIndex]}
      </motion.p>
    </motion.div>
  )
}
