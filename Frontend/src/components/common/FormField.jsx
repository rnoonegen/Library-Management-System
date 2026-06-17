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
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
      />
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

