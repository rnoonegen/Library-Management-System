import { useEffect, useRef, useState } from 'react';
import { isAllFilterSelection } from 'utils/bookFilterParams';

function formatSelection(values, options, placeholder) {
  if (!values.length || isAllFilterSelection(values, options)) return placeholder;
  if (values.length === 1) return values[0];
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
  const allSelected = isAllFilterSelection(values, options);

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

  function selectAll() {
    onChange([...options]);
  }

  function clearAll() {
    onChange([]);
  }

  const displayValue = formatSelection(values, options, placeholder);
  const showChips = values.length > 0 && !allSelected;

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

      {showChips && (
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
            <button
              type="button"
              className={`filter-multi-action${allSelected ? ' is-active' : ''}`}
              onClick={selectAll}
              disabled={!options.length || allSelected}
            >
              Select all
            </button>
            <button
              type="button"
              className={`filter-multi-action${!values.length ? ' is-active' : ''}`}
              onClick={clearAll}
              disabled={!values.length}
            >
              Deselect all
            </button>
            <button type="button" className="filter-multi-action filter-multi-action-done" onClick={() => setOpen(false)}>
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
