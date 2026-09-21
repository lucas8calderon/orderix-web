const KEY_PREFIX = 'weper.delivery.lastOrder.';

const storageKey = (slug) => `${KEY_PREFIX}${slug || 'unknown'}`;

/**
 * Último pedido de delivery acompanhável por loja.
 * Formato: { token, orderId?, createdAt }
 */
export function readLastOrder(slug) {
  if (typeof window === 'undefined' || !slug) return null;
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const token = typeof parsed?.token === 'string' ? parsed.token.trim() : '';
    if (!token) return null;
    return {
      token,
      orderId: parsed.orderId ?? null,
      createdAt: parsed.createdAt || null,
    };
  } catch {
    return null;
  }
}

export function writeLastOrder(slug, entry) {
  if (typeof window === 'undefined' || !slug) return;
  const token = typeof entry?.token === 'string' ? entry.token.trim() : '';
  if (!token) return;
  window.localStorage.setItem(
    storageKey(slug),
    JSON.stringify({
      token,
      orderId: entry.orderId ?? null,
      createdAt: entry.createdAt || new Date().toISOString(),
    })
  );
}

export function clearLastOrder(slug) {
  if (typeof window === 'undefined' || !slug) return;
  window.localStorage.removeItem(storageKey(slug));
}

/** Remove qualquer lastOrder cujo token coincida (ex.: tracking 404). */
export function clearLastOrderByToken(token) {
  if (typeof window === 'undefined') return;
  const normalized = typeof token === 'string' ? token.trim() : '';
  if (!normalized) return;

  const keysToRemove = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(KEY_PREFIX)) continue;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key));
      if (parsed?.token === normalized) keysToRemove.push(key);
    } catch {
      /* ignore corrupt entries */
    }
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}
