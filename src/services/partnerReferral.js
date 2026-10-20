/**
 * Captura do código de indicação (?ref=CODIGO) vindo do link do parceiro.
 *
 * Apenas guarda o código em sessionStorage (weper.partnerRef). Não existe
 * atribuição de conversão aqui: a decisão de vincular uma contratação a um
 * parceiro é do backend/equipe, não do navegador.
 */
export const PARTNER_REF_STORAGE_KEY = 'weper.partnerRef';

const PARTNER_REF_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;

/** Devolve o código em maiúsculas ou null se o formato não for aceitável. */
export function normalizePartnerRef(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!PARTNER_REF_PATTERN.test(trimmed)) return null;
  return trimmed.toUpperCase();
}

export function getStoredPartnerRef() {
  try {
    return window.sessionStorage.getItem(PARTNER_REF_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Lê `ref` da query string e persiste se válido.
 * @param {string} [search] query string (ex.: location.search)
 * @returns {string|null} código salvo agora, ou null quando não havia ref válido
 */
export function capturePartnerRef(search) {
  try {
    const source = typeof search === 'string' ? search : window.location.search;
    const code = normalizePartnerRef(new URLSearchParams(source).get('ref'));
    if (!code) return null;
    window.sessionStorage.setItem(PARTNER_REF_STORAGE_KEY, code);
    return code;
  } catch {
    return null;
  }
}

export function clearStoredPartnerRef() {
  try {
    window.sessionStorage.removeItem(PARTNER_REF_STORAGE_KEY);
  } catch {
    // modo privado / storage indisponível
  }
}
