export default function LandingFooter({ onNavigate }) {
  const scrollToAbout = () => {
    if (window.location.pathname === '/') {
      const el = document.getElementById('lp-about')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      onNavigate('/')
      setTimeout(() => {
        const el = document.getElementById('lp-about')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    }
  }

  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__logo">
          <span>N</span>URHR
        </div>
        <div className="lp-footer__links">
          <button onClick={() => onNavigate('/faq')}>FAQs</button>
          <button onClick={scrollToAbout}>About</button>
          <button onClick={() => onNavigate('/faq')}>Privacy</button>
          <button onClick={() => onNavigate('/terms')}>Terms</button>
        </div>
        <div className="lp-footer__tag">
          Built <span>different.</span>
        </div>
      </div>
    </footer>
  )
}
