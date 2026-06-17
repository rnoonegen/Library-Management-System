import { useState } from 'react';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  required,
  readOnly,
  placeholder,
  hint,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const inputProps = {
    id,
    type: inputType,
    value,
    onChange,
    required,
    readOnly,
    placeholder,
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {isPassword ? (
        <div className="password-field">
          <input {...inputProps} />
          <button
            type="button"
            className="password-toggle"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            <span className="password-toggle-icon" aria-hidden="true">
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </button>
        </div>
      ) : (
        <input {...inputProps} />
      )}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

