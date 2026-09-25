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

/**
 * O usuário apagou o WhatsApp de propósito. Campo vazio sem esta marca
 * não entra no PUT, para um reload ou a máscara não apagarem o número salvo.
 */
export const CLEARED_STORE_PHONE = '__cleared_store_phone__';

/**
 * Dígitos do WhatsApp da loja. Remove máscara, 55 e o 0 de tronco
 * quando o número já está completo. Não corta um número longo em um válido.
 */
export function normalizeStoreWhatsApp(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && (digits.length === 11 || digits.length === 12)) {
    digits = digits.slice(1);
  }
  return digits;
}

/** Máscara enquanto o número cabe em DDD + telefone. Acima disso, deixa os dígitos para a validação rejeitar. */
export function formatStoreWhatsAppInput(raw) {
  const digits = normalizeStoreWhatsApp(raw);
  if (!digits || digits.length > 11) return digits;
  return formatPhoneInput(digits);
}
