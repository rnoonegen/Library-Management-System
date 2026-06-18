export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
    message: 'Password must be at least 8 characters',
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A–Z)',
    test: (password) => /[A-Z]/.test(password),
    message: 'Password must include an uppercase letter',
  },
  {
    id: 'number',
    label: 'One number (0–9)',
    test: (password) => /[0-9]/.test(password),
    message: 'Password must include a number',
  },
];

export function validatePassword(password) {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return rule.message;
    }
  }
  return null;
}

export function isPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
