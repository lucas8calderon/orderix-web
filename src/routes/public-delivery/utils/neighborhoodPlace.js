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

export function servesAllNeighborhoods(catalogOrMode) {
  const mode = catalogOrMode && typeof catalogOrMode === 'object'
    ? catalogOrMode.feeMode
    : catalogOrMode;
  return mode === 'ALL_NEIGHBORHOODS';
}

export function allNeighborhoodsFee(catalog) {
  return Number(catalog?.allNeighborhoodsFee || 0);
}

export function hasServiceNeighborhood(catalog, address) {
  if (!address) return false;
  if (servesAllNeighborhoods(catalog)) return Boolean(String(address.neighborhood || '').trim());
  return Boolean(address.neighborhoodId);
}

/** Taxa efetiva. Trocar o modo não altera a taxa cadastrada nem a marca de grátis. */
export function effectiveNeighborhoodFee(mode, registeredFee, freeDelivery, openFee) {
  const registered = moneyCents(registeredFee);
  if (mode === 'ALL_NEIGHBORHOODS') return moneyCents(openFee) / 100;
  if (mode === 'FREE_ALL') return 0;
  if (mode === 'FREE_SELECTED' && freeDelivery) return 0;
  return registered / 100;
}

export function allNeighborhoodsFeeLabel(fee, formatCurrency) {
  if (moneyCents(fee) === 0) {
    return 'Entregamos em qualquer bairro. A entrega é grátis.';
  }
  const formatted = typeof formatCurrency === 'function' ? formatCurrency(fee) : fee;
  return `Entregamos em qualquer bairro. Taxa de entrega: ${formatted}.`;
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
