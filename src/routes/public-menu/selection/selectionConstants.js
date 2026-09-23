/** TTL da seleção do cardápio digital (12 horas). */
export const SELECTION_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Chave por loja/cardápio. No cardápio público usamos o slug como storeId
 * (a API pública não expõe o id numérico da loja).
 */
export function selectionStorageKey(storeId) {
  if (!storeId) return null;
  return `weper:digital-menu:${storeId}:selection`;
}
