/**
 * Helpers for Brazilian phone text inputs.
 * UI shows masked value; API payloads should use digits only.
 */

export function phoneDigits(raw, { maxDigits = 11 } = {}) {
  return String(raw ?? '').replace(/\D/g, '').slice(0, maxDigits);
}

/**
 * Formats digits as (11) 3333-3333 (10) or (11) 98888-8888 (11).
 * Progressive while typing; switches to 11-digit layout only at 11 digits.
 */
export function formatPhoneInput(raw) {
  const digits = phoneDigits(raw);
  if (!digits) return '';

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const local = digits.slice(2);

  if (digits.length <= 6) {
    return `(${ddd}) ${local}`;
  }

  if (digits.length <= 10) {
    return `(${ddd}) ${local.slice(0, 4)}-${local.slice(4)}`;
  }

  return `(${ddd}) ${local.slice(0, 5)}-${local.slice(5)}`;
}

export function isValidBrazilianPhone(raw) {
  return /^\d{10,11}$/.test(phoneDigits(raw));
}
