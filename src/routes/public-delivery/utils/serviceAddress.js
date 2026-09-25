const storageKey = (slug) => `weper.delivery.address.${slug || 'unknown'}`;

export function readServiceAddress(slug) {
  if (typeof window === 'undefined' || !slug) return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.neighborhoodId) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Guarda o bairro escolhido. A taxa aqui é só a prévia da tela e é recalculada no pedido. */
export function writeServiceAddress(slug, address) {
  if (typeof window === 'undefined' || !slug) return;
  window.sessionStorage.setItem(storageKey(slug), JSON.stringify(address || null));
}

export function clearServiceAddress(slug) {
  if (typeof window === 'undefined' || !slug) return;
  window.sessionStorage.removeItem(storageKey(slug));
}
