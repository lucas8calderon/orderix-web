/** Abre o perfil do Instagram quando o lead tem @, usuário ou URL. */
export function instagramHandle(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  let candidate = raw;
  if (/^https?:\/\//i.test(raw) || /^(www\.)?instagram\.com\//i.test(raw)) {
    try {
      const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
      if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return '';
      candidate = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || '';
    } catch {
      return '';
    }
  }

  const handle = candidate.replace(/^@/, '').split(/[/?#]/)[0];
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) return '';
  return handle;
}

export function buildInstagramUrl(value) {
  const handle = instagramHandle(value);
  if (!handle) return null;
  return `https://www.instagram.com/${handle}/`;
}

export function openInstagram(value) {
  const url = buildInstagramUrl(value);
  if (!url || typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
