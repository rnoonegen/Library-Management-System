import { useEffect, useRef, useState } from 'react';

function formatSelection(values, placeholder) {
  if (!values.length) return placeholder;
  if (values.length === 1) return '1 selected';
  return `${values.length} selected`;
}

function FilterChip({ label, chipType, onRemove }) {
  return (
    <button
      type="button"
      className={`filter-chip filter-chip-${chipType}`}
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
    >
      <span>{label}</span>
      <span className="filter-chip-remove" aria-hidden="true">×</span>
    </button>
  );
}

export default function MultiFilterSelect({
  label,
  values = [],
  options,
  placeholder,
  onChange,
  ariaLabel,
  chipType = 'subject',
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

  function toggleOption(option) {
    if (values.includes(option)) {
      onChange(values.filter((item) => item !== option));
      return;
    }
    onChange([...values, option]);
  }

  function clearAll() {
    onChange([]);
  }

  const displayValue = formatSelection(values, placeholder);

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

      {values.length > 0 && (
        <div className="books-filter-chips-row" aria-label={`Selected ${label.toLowerCase()} filters`}>
          <span className="books-filter-chips-heading">{label}</span>
          <div className="books-filter-chips-list">
            {values.map((item) => (
              <FilterChip
                key={item}
                label={item}
                chipType={chipType}
                onRemove={() => toggleOption(item)}
              />
            ))}
          </div>
        </div>
      )}

      {open && (
        <div className="filter-select-menu filter-multi-menu" role="listbox" aria-label={ariaLabel}>
          <div className="filter-multi-actions">
            <button type="button" className="filter-multi-action" onClick={clearAll}>
              Clear
            </button>
            <button type="button" className="filter-multi-action" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
          <ul className="filter-multi-list">
            {options.map((item) => {
              const checked = values.includes(item);
              return (
                <li key={item} role="presentation">
                  <label className={`filter-multi-option${checked ? ' is-active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOption(item)}
                    />
                    <span>{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
