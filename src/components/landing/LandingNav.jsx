import { useState } from 'react'

// Scroll directly if already on the homepage; otherwise navigate home first
// then scroll once the home sections have had time to render.
function scrollToSection(sectionId, onNavigate) {
  const isHome = window.location.pathname === '/'
  if (isHome) {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    onNavigate('/')
    setTimeout(() => {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 400)
  }
}

export default function LandingNav({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const close = () => setMenuOpen(false)

  return (
    <nav className="lp-nav">
      <button className="lp-nav__logo" onClick={() => { close(); onNavigate('/') }}>
        <span>N</span>URHR
      </button>

      <ul className={`lp-nav__links${menuOpen ? ' lp-nav__links--open' : ''}`}>
        <li>
          <a
            href="#lp-what"
            onClick={(e) => { e.preventDefault(); close(); scrollToSection('lp-what', onNavigate) }}
          >
            What you get
          </a>
        </li>
        <li>
          <a
            href="#lp-about"
            onClick={(e) => { e.preventDefault(); close(); scrollToSection('lp-about', onNavigate) }}
          >
            About
          </a>
        </li>
        <li>
          <button onClick={() => { close(); onNavigate('/faq') }}>FAQs</button>
        </li>
      </ul>

      <div className="lp-nav__right">
        <button
          className="lp-nav__cta"
          onClick={() => { close(); scrollToSection('roast-form', onNavigate) }}
        >
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
