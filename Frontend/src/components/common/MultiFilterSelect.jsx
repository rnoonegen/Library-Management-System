import { useEffect, useRef, useState } from 'react';

export default function MultiFilterSelect({
  label,
  values = [],
  options,
  placeholder,
  onChange,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = new Set(values);

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

  function toggleOption(item) {
    const next = selected.has(item)
      ? values.filter((value) => value !== item)
      : [...values, item];
    onChange(next);
  }

  function removeChip(item, event) {
    event.stopPropagation();
    onChange(values.filter((value) => value !== item));
  }

  return (
    <div className="books-filter filter-select" ref={rootRef}>
      <span className="books-filter-label">{label}</span>
      <button
        type="button"
        className={`filter-select-trigger${open ? ' is-open' : ''}${values.length ? ' has-value' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className={`filter-select-value${values.length ? ' is-placeholder' : ''}`}>
          {values.length ? `Add ${label.toLowerCase()}` : placeholder}
        </span>
        <span className="filter-select-chevron" aria-hidden="true" />
      </button>

      {values.length > 0 && (
        <div className="books-filter-chips" aria-label={`Selected ${label.toLowerCase()} filters`}>
          {values.map((item) => (
            <span key={item} className="books-filter-chip">
              {item}
              <button
                type="button"
                className="books-filter-chip-remove"
                onClick={(event) => removeChip(item, event)}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="filter-select-menu filter-multi-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((item) => {
            const isSelected = selected.has(item);
            return (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`filter-select-option filter-multi-option${isSelected ? ' is-active' : ''}`}
                onClick={() => toggleOption(item)}
              >
                <span className={`filter-multi-check${isSelected ? ' is-checked' : ''}`} aria-hidden="true">
                  {isSelected ? '✓' : ''}
                </span>
                {item}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
