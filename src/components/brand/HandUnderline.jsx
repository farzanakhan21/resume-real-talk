// Hand-drawn underline for a single word/phrase in a headline.
// Two overlapping wobbly strokes (never a straight CSS underline).
export default function HandUnderline({ children, className = '' }) {
  return (
    <span className={`hand-underline ${className}`}>
      {children}
      <svg
        className="hand-underline__svg"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M3,7.5 C38,4 72,10.5 104,6.5 C134,3 168,10 197,6"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M6,9.5 C42,6.5 74,11.5 108,8 C140,5 172,11 195,8.5"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.7"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
