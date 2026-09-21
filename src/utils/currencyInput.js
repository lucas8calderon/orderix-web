/**
 * Helpers for BRL currency text inputs (digit-as-cents mask, pt-BR display).
 * State/API values stay as numbers (e.g. 5.5); only the UI string is masked.
 */

export function formatCurrencyInput(value) {
  if (value === '' || value == null || Number.isNaN(Number(value))) return '';
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyInput(raw, { maxDigits = 8 } = {}) {
  const digits = String(raw ?? '').replace(/\D/g, '').slice(0, maxDigits);
  if (!digits) return '';
  return Number(digits) / 100;
}
