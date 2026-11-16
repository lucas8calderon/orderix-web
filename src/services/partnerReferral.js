/**
 * Captura do código de indicação (?ref=CODIGO) vindo do link do parceiro.
 *
 * Persistência dual (sessionStorage + cookie first-party) para sobreviver a
 * navegação entre Home → Checkout. O ref da URL desta visita prevalece sobre
 * um código já gravado; sem ref na URL, o código gravado permanece.
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
  const trimmed = value.trim().replace(/\s+/g, '');
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
 * Código desta visita: o `ref` da URL, se for válido; senão o que já está gravado.
 * Não persiste. Query inválida cai no código gravado.
 * @param {string} [search] query string (ex.: location.search)
 * @returns {string|null}
 */
export function resolvePartnerRef(search) {
  try {
    const source = typeof search === 'string'
      ? search
      : (typeof window !== 'undefined' ? window.location.search : '');
    const incoming = normalizePartnerRef(new URLSearchParams(source).get('ref'));
    if (incoming) return incoming;
  } catch {
    // query inválida
  }
  return getStoredPartnerRef();
}

/**
 * Lê `ref` da query string. Um ref válido desta visita substitui o código gravado.
 * Sem ref na URL, reidrata a sessão a partir do que já estava salvo.
 * @param {string} [search] query string (ex.: location.search)
 * @returns {string|null} código efetivo, ou null
 */
export function capturePartnerRef(search) {
  try {
    const source = typeof search === 'string' ? search : window.location.search;
    const incoming = normalizePartnerRef(new URLSearchParams(source).get('ref'));
    if (incoming) {
      persistPartnerRef(incoming);
      return incoming;
    }
    const existing = getStoredPartnerRef();
    if (!existing) return null;
    persistPartnerRef(existing);
    return existing;
  } catch {
    return null;
  }
}

/**
 * Acrescenta o código da visita em params de checkout já preenchidos (plan, lead).
 * Não remove os demais parâmetros. Sem código, a query fica como estava.
 * @param {URLSearchParams} params
 * @param {string} [search]
 * @returns {URLSearchParams}
 */
export function withPartnerRef(params, search) {
  const code = resolvePartnerRef(search);
  if (code) params.set('ref', code);
  return params;
}

export function clearStoredPartnerRef() {
  try {
    window.sessionStorage.removeItem(PARTNER_REF_STORAGE_KEY);
  } catch {
    // modo privado / storage indisponível
  }
  clearPartnerRefCookie();
}

/**
 * Link público de indicação no host atual (staging → staging, prod → prod).
 * Preferir origin do browser no portal; não reutilizar URL hardcodada do backend.
 */
export function buildPublicReferralLink(code, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  const normalized = normalizePartnerRef(code);
  const base = typeof origin === 'string' ? origin.trim().replace(/\/$/, '') : '';
  if (!normalized || !base) return '';
  return `${base}/?ref=${encodeURIComponent(normalized)}`;
}
