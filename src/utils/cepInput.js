/**
 * Helpers for Brazilian CEP text inputs.
 * UI shows 00000-000; API payloads should use digits only.
 */

export function cepDigits(raw) {
  return String(raw ?? '').replace(/\D/g, '').slice(0, 8);
}

export function formatCepInput(raw) {
  const digits = cepDigits(raw);
  if (!digits) return '';
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isValidCep(raw) {
  return cepDigits(raw).length === 8;
}
