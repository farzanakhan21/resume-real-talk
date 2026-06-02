import { motion } from 'framer-motion'

const quotes = [
  { text: 'omg it made me want to cry', initial: 'S.' },
  { text: 'I made immediate changes to my profile', initial: 'M.' },
  { text: 'I was so curious from the roast, I deffs would pay for the full report', initial: 'D.' },
]

export default function Testimonials() {
  return (
    <motion.section
      className="testimonials"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className="testimonials__inner">
        <p className="testimonials__label">✦ what people said</p>
        <div className="testimonials__grid">
          {quotes.map(({ text, initial }) => (
            <div key={initial} className="testimonials__card">
              <p className="testimonials__quote">"{text}"</p>
              <span className="testimonials__initial">- {initial}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
