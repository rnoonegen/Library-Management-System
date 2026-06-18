import { PASSWORD_RULES } from 'utils/passwordValidation';

export default function PasswordRequirements({ password }) {
  return (
    <ul className="password-requirements" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.id} className={met ? 'password-requirement met' : 'password-requirement'}>
            <span className="password-requirement-icon" aria-hidden="true">
              {met ? '✓' : '○'}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
