// Hand-drawn margin annotation: a Caveat string in gold, slightly rotated,
// optionally with a small wobbly hand-drawn arrow.
// Decorative only (aria-hidden) — never carries information the user needs
// to complete a task, and never sits on a button/input/field.
// Under 768px it renders as a static block above its referent (see CSS),
// so it never overlaps content on mobile.

function HandArrow({ dir = 'down-left' }) {
  // wobbly cubic path + arrowhead, no straight lines
  return (
    <svg
      className={`annotation__arrow annotation__arrow--${dir}`}
      viewBox="0 0 64 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M54,6 C40,4 20,10 12,26 C10,30 9,36 10,42"
        stroke="var(--gold)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M4,34 C7,37 9,40 10,43 C13,40 16,38 20,37"
        stroke="var(--gold)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Annotation({
  children,
  rotate = -3,
  arrow = false,
  arrowDir = 'down-left',
  onPlum = false,
  className = '',
}) {
  return (
    <span
      className={`annotation${onPlum ? ' annotation--on-plum' : ''} ${className}`}
      style={{ '--annotation-rot': `${rotate}deg` }}
      aria-hidden="true"
    >
      <span className="annotation__text">{children}</span>
      {arrow && <HandArrow dir={arrowDir} />}
    </span>
  )
}
