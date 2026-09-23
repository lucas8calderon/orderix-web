import { SELECTION_TTL_MS, selectionStorageKey } from './selectionConstants';

function emptyPayload(storeId) {
  return {
    storeId: storeId || null,
    updatedAt: null,
    items: [],
  };
}

function normalizeItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];
  const seen = new Set();
  const items = [];
  for (const entry of rawItems) {
    const productId = entry?.productId ?? entry?.id;
    const quantity = Number(entry?.quantity);
    if (productId == null || productId === '') continue;
    const key = String(productId);
    if (seen.has(key)) continue;
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    seen.add(key);
    items.push({
      productId,
      quantity: Math.floor(quantity),
    });
  }
  return items;
}

/**
 * Lê a seleção persistida. Expira após SELECTION_TTL_MS e descarta payload inválido.
 * Preparado para evoluir depois para carrinho → mesa/comanda → pedido (mesmo shape de itens).
 */
export function readSelection(storeId) {
  if (typeof window === 'undefined' || !storeId) return emptyPayload(storeId);
  const key = selectionStorageKey(storeId);
  if (!key) return emptyPayload(storeId);

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return emptyPayload(storeId);
    const parsed = JSON.parse(raw);
    const updatedAt = parsed?.updatedAt ? Date.parse(parsed.updatedAt) : NaN;
    if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > SELECTION_TTL_MS) {
      window.localStorage.removeItem(key);
      return emptyPayload(storeId);
    }
    return {
      storeId: parsed.storeId ?? storeId,
      updatedAt: parsed.updatedAt,
      items: normalizeItems(parsed.items),
    };
  } catch {
    return emptyPayload(storeId);
  }
}

export function writeSelection(storeId, items) {
  if (typeof window === 'undefined' || !storeId) return;
  const key = selectionStorageKey(storeId);
  if (!key) return;

  const normalized = normalizeItems(items);
  if (normalized.length === 0) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify({
      storeId,
      updatedAt: new Date().toISOString(),
      items: normalized,
    })
  );
}

export function clearSelectionStorage(storeId) {
  if (typeof window === 'undefined' || !storeId) return;
  const key = selectionStorageKey(storeId);
  if (!key) return;
  window.localStorage.removeItem(key);
}
