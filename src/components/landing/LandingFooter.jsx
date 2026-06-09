export default function LandingFooter({ onNavigate }) {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__logo">
        <span>N</span>URHR - Roast My Resume
      </div>
      <ul className="lp-footer__links">
        <li><button onClick={() => onNavigate('/faq')}>FAQs</button></li>
        <li>
          <button onClick={() => {
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
          }}>About</button>
        </li>
        <li><button onClick={() => onNavigate('/faq')}>Privacy</button></li>
        <li><button onClick={() => onNavigate('/terms')}>Terms</button></li>
      </ul>
      <span className="lp-footer__copy">© 2026 NURHR. Built different.</span>
    </footer>
  )
}
