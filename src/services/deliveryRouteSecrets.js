const KEY = 'weper.deliveryRouteSecrets';

function readAll() {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function rememberRouteSecret(routeId, secret) {
  if (!routeId || !secret?.token) return;
  const all = readAll();
  all[String(routeId)] = {
    token: secret.token,
    pin: secret.pin || '',
    publicUrl: absolutePublicUrl(secret.publicUrl),
  };
  sessionStorage.setItem(KEY, JSON.stringify(all));
}

export function readRouteSecret(routeId) {
  if (!routeId) return null;
  const secret = readAll()[String(routeId)];
  return secret?.token ? secret : null;
}

export function absolutePublicUrl(publicUrl) {
  if (!publicUrl) return '';
  if (/^https?:\/\//i.test(publicUrl)) return publicUrl;
  const path = publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}
