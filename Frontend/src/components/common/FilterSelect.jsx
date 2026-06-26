import { useEffect, useRef, useState } from 'react';

export default function FilterSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const displayValue = value || placeholder;

  return (
    <div className="books-filter filter-select" ref={rootRef}>
      <span className="books-filter-label">{label}</span>
      <button
        type="button"
        className={`filter-select-trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="filter-select-value">{displayValue}</span>
        <span className="filter-select-chevron" aria-hidden="true" />
      </button>

      {open && (
        <ul className="filter-select-menu" role="listbox" aria-label={ariaLabel}>
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={`filter-select-option${!value ? ' is-active' : ''}`}
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              {placeholder}
            </button>
          </li>
          {options.map((item) => (
            <li key={item} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === item}
                className={`filter-select-option${value === item ? ' is-active' : ''}`}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
