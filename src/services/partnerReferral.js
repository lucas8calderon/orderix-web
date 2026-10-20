/**
 * Captura do código de indicação (?ref=CODIGO) vindo do link do parceiro.
 *
 * Persistência dual (sessionStorage + cookie first-party) para sobreviver a
 * navegação entre Home → Checkout. First-touch: o primeiro ref válido ganha;
 * refs posteriores não sobrescrevem (anti-fraude / hijack de atribuição).
 * A decisão de vincular a contratação continua no backend.
 */
export const PARTNER_REF_STORAGE_KEY = 'weper.partnerRef';
export const PARTNER_REF_COOKIE = 'weper_partner_ref';

/** 30 dias — janela típica de decisão comercial; backend valida o código no signup. */
const PARTNER_REF_COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60;

const PARTNER_REF_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;

/** Devolve o código em maiúsculas ou null se o formato não for aceitável. */
export function normalizePartnerRef(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!PARTNER_REF_PATTERN.test(trimmed)) return null;
  return trimmed.toUpperCase();
}

function readPartnerRefCookie() {
  try {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const prefix = `${PARTNER_REF_COOKIE}=`;
    const hit = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
    if (!hit) return null;
    return normalizePartnerRef(decodeURIComponent(hit.slice(prefix.length)));
  } catch {
    return null;
  }
}

function writePartnerRefCookie(code) {
  try {
    if (typeof document === 'undefined') return;
    const secure = typeof window !== 'undefined' && window.location?.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${PARTNER_REF_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${PARTNER_REF_COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
  } catch {
    // cookie bloqueado / modo restrito
  }
}

function clearPartnerRefCookie() {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${PARTNER_REF_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function getStoredPartnerRef() {
  try {
    const fromSession = window.sessionStorage.getItem(PARTNER_REF_STORAGE_KEY);
    const sessionCode = normalizePartnerRef(fromSession);
    if (sessionCode) return sessionCode;
  } catch {
    // sessionStorage indisponível
  }
  return readPartnerRefCookie();
}

function persistPartnerRef(code) {
  try {
    window.sessionStorage.setItem(PARTNER_REF_STORAGE_KEY, code);
  } catch {
    // ignore
  }
  writePartnerRefCookie(code);
}

/**
 * Lê `ref` da query string e persiste se válido (first-touch).
 * @param {string} [search] query string (ex.: location.search)
 * @returns {string|null} código efetivo (novo ou já armazenado), ou null
 */
export function capturePartnerRef(search) {
  try {
    const source = typeof search === 'string' ? search : window.location.search;
    const incoming = normalizePartnerRef(new URLSearchParams(source).get('ref'));
    const existing = getStoredPartnerRef();
    if (existing) {
      // Re-hidrata session a partir do cookie se necessário.
      persistPartnerRef(existing);
      return existing;
    }
    if (!incoming) return null;
    persistPartnerRef(incoming);
    return incoming;
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
  clearPartnerRefCookie();
}
