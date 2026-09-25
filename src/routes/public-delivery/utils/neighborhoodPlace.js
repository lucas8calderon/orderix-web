/**
 * Chave de cidade/bairro igual à do backend: sem acento, sem diferença de caixa e com espaços colapsados.
 */
export function placeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchNeighborhood(neighborhoods, viaCepName) {
  const key = placeKey(viaCepName);
  if (!key) return null;
  return (neighborhoods || []).find((item) => placeKey(item.name) === key) || null;
}

export function selectionStillValid(neighborhoods, neighborhoodId) {
  if (neighborhoodId == null || neighborhoodId === '') return false;
  return (neighborhoods || []).some((item) => String(item.id) === String(neighborhoodId));
}

export function moneyCents(value) {
  return Math.round(Number(value || 0) * 100);
}

/** Taxa efetiva. Trocar o modo não altera a taxa cadastrada nem a marca de grátis. */
export function effectiveNeighborhoodFee(mode, registeredFee, freeDelivery) {
  const registered = moneyCents(registeredFee);
  if (mode === 'FREE_ALL') return 0;
  if (mode === 'FREE_SELECTED' && freeDelivery) return 0;
  return registered / 100;
}

export function deliveryCoverageLabel(neighborhood, fee, formatCurrency) {
  const name = String(neighborhood || '').trim();
  if (!name) return '';
  if (moneyCents(fee) === 0) {
    return `Entregamos em ${name} • Entrega grátis`;
  }
  const formatted = typeof formatCurrency === 'function' ? formatCurrency(fee) : fee;
  return `Entregamos em ${name} • Taxa de entrega: ${formatted}`;
}
