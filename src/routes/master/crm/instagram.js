/** Perfil e Direct do Instagram. O link não carrega texto da mensagem. */

const RESERVED = new Set([
  'p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'direct',
  'about', 'legal', 'developer', 'privacy', 'directory', 'tv', 'emails', 'share',
  'www', 'instagram',
]);

export const INSTAGRAM_DIRECT_HINT = 'O link do Direct não leva o texto. Copie a mensagem e cole no Instagram. No computador, ig.me abre o Instagram Web (é preciso estar logado) e não preenche a mensagem. No Android e no iPhone, o mesmo link abre a conversa no aplicativo, se ele estiver instalado, também sem preencher o texto. Se a conversa não abrir, use o perfil.';

export function instagramHandle(value) {
  const identity = parseInstagram(value);
  return identity ? identity.username : '';
}

export function parseInstagram(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const username = extract(raw);
  if (!username) return null;
  return {
    username,
    profileUrl: buildInstagramProfileUrl(username),
    directUrl: buildInstagramDirectUrl(username),
  };
}

export function buildInstagramUrl(value) {
  const handle = instagramHandle(value);
  if (!handle) return null;
  return buildInstagramProfileUrl(handle);
}

export function buildInstagramProfileUrl(username) {
  return `https://www.instagram.com/${username}/`;
}

/** Link público estável. Não aceita texto pré-preenchido. */
export function buildInstagramDirectUrl(username) {
  if (!username) return null;
  return `https://ig.me/m/${username}`;
}

export function openInstagram(value) {
  const url = buildInstagramUrl(value);
  if (!url || typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function extract(raw) {
  if (raw.startsWith('@') && !raw.includes('/') && !raw.includes(' ') && !raw.includes('://')) {
    return username(raw.slice(1));
  }
  if (looksLikeUrl(raw)) return fromUrl(raw);
  return username(raw);
}

function looksLikeUrl(value) {
  const lower = value.toLowerCase();
  return lower.includes('://')
    || lower.startsWith('www.')
    || lower.includes('instagram.')
    || lower.includes('/')
    || lower.startsWith('instagram.com');
}

function fromUrl(value) {
  let candidate = value;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) candidate = `https://${candidate}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return '';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
  if (url.username || url.password) return '';
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host !== 'instagram.com' && host !== 'www.instagram.com') return '';
  const first = url.pathname.split('/').filter(Boolean)[0] || '';
  return username(first.replace(/^@/, ''));
}

function username(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(value)) return '';
  if (value.startsWith('.') || value.endsWith('.') || value.includes('..')) return '';
  if (RESERVED.has(value)) return '';
  if (!/[a-z0-9]/.test(value)) return '';
  return value;
}
