import { useState, useRef } from 'react'

export default function SearchableSelect({ value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef()

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  const handleFocus = () => {
    if (!disabled) {
      setOpen(true)
      setQuery('')
    }
  }

  const handleBlur = () => {
    // Delay close so onMouseDown on options fires first
    setTimeout(() => setOpen(false), 150)
  }

  const handleSelect = (opt) => {
    onChange(opt)
    setOpen(false)
    setQuery('')
  }

  const handleInputChange = (e) => {
    if (open) setQuery(e.target.value)
  }

  const displayValue = open ? query : (value || '')

  return (
    <div className={`ss${disabled ? ' ss--disabled' : ''}`} ref={containerRef}>
      <input
        className="input ss__input"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={disabled ? 'Select department first' : (placeholder || 'Search or select…')}
        disabled={disabled}
        autoComplete="off"
        aria-haspopup="listbox"
        aria-expanded={open}
      />
      {open && !disabled && (
        <ul className="ss__list" role="listbox">
          {filtered.length > 0 ? (
            filtered.map(opt => (
              <li
                key={opt}
                className={`ss__option${opt === value ? ' ss__option--active' : ''}`}
                onMouseDown={() => handleSelect(opt)}
                role="option"
                aria-selected={opt === value}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="ss__empty">No matches - try a different search</li>
          )}
        </ul>
      )}
    </div>
  )
}
