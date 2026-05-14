export default function Header({ view, onNavigate }) {
  const isAbout = view === 'about'
  const isFaq = view === 'faq'

  return (
    <header className="header">
      <div className="header__inner">
        <button className="header__logo" onClick={() => onNavigate('/')}>
          not ur regular hr
        </button>
        <nav className="header__nav">
          <button
            className={`header__nav-link${isFaq ? ' header__nav-link--active' : ''}`}
            onClick={() => onNavigate('/faq')}
          >
            FAQs
          </button>
          <button
            className={`header__nav-link${isAbout ? ' header__nav-link--active' : ''}`}
            onClick={() => onNavigate('/about')}
          >
            About
          </button>
        </nav>
      </div>
    </header>
  )
}
