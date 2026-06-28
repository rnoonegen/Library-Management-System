import { useEffect, useRef, useState } from 'react';

function getOptionMeta(item) {
  if (typeof item === 'object' && item !== null) {
    return { value: item.value, label: item.label };
  }
  return { value: item, label: item };
}

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
  const normalizedOptions = options.map(getOptionMeta);

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

  const selectedOption = normalizedOptions.find((item) => item.value === value);
  const displayValue = selectedOption?.label || placeholder;

  return (
    <div className="books-filter filter-select" ref={rootRef}>
      <span className="books-filter-label">{label}</span>
      <button
        type="button"
        className={`filter-select-trigger${open ? ' is-open' : ''}${value ? ' has-value' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className={`filter-select-value${!value ? ' is-placeholder' : ''}`}>{displayValue}</span>
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
          {normalizedOptions.map((item) => (
            <li key={item.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === item.value}
                className={`filter-select-option${value === item.value ? ' is-active' : ''}`}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
