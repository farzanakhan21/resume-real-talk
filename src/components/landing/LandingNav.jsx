import { useState } from 'react'

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingNav({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const close = () => setMenuOpen(false)

  return (
    <nav className="lp-nav">
      <div className="lp-nav__logo">
        <span>N</span>URHR
      </div>

      <ul className={`lp-nav__links${menuOpen ? ' lp-nav__links--open' : ''}`}>
        <li>
          <a href="#lp-what" onClick={(e) => { e.preventDefault(); close(); scrollTo('lp-what') }}>
            What you get
          </a>
        </li>
        <li>
          <a href="#lp-about" onClick={(e) => { e.preventDefault(); close(); scrollTo('lp-about') }}>
            About
          </a>
        </li>
        <li>
          <button onClick={() => { close(); onNavigate('/faq') }}>FAQs</button>
        </li>
      </ul>

      <div className="lp-nav__right">
        <button className="lp-nav__cta" onClick={() => { close(); scrollTo('roast-form') }}>
          Roast my resume
        </button>
        <button
          className="lp-nav__burger"
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={menuOpen ? 'lp-burger--open' : ''} />
          <span className={menuOpen ? 'lp-burger--open' : ''} />
          <span className={menuOpen ? 'lp-burger--open' : ''} />
        </button>
      </div>
    </nav>
  )
}
