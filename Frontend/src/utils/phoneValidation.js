export const PHONE_LENGTH = 10;

export function sanitizePhoneInput(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, PHONE_LENGTH);
}

export function validatePhone(phone) {
  const trimmed = String(phone ?? '').trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) {
    return 'Phone number must contain only numbers';
  }
  if (trimmed.length !== PHONE_LENGTH) {
    return `Phone number must be exactly ${PHONE_LENGTH} digits`;
  }
  return null;
}