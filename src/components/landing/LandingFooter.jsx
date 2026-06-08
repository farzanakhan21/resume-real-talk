export default function LandingFooter({ onNavigate }) {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__logo">
        <span>N</span>URHR - Roast My Resume
      </div>
      <ul className="lp-footer__links">
        <li><button onClick={() => onNavigate('/faq')}>FAQs</button></li>
        <li><button onClick={() => onNavigate('/about')}>About</button></li>
        <li><button onClick={() => onNavigate('/faq')}>Privacy</button></li>
      </ul>
      <span className="lp-footer__copy">© 2026 NURHR. Built different.</span>
    </footer>
  )
}
