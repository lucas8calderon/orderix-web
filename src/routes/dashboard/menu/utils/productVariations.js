export function activeVariations(product) {
  return (product?.variations || []).filter(
    (variation) => variation && variation.available !== false && String(variation.name || '').trim()
  );
}

export function variationPriceBounds(product) {
  const prices = activeVariations(product)
    .map((variation) => Number(variation.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function formatProductPrice(product, format) {
  const bounds = variationPriceBounds(product);
  if (!bounds) return format(product?.value);
  if (bounds.min === bounds.max) return format(bounds.min);
  return `${format(bounds.min)} – ${format(bounds.max)}`;
}

export function variationSummary(product, format) {
  return activeVariations(product)
    .map((variation) => `${variation.name} ${format(variation.price)}`)
    .join(' · ');
}

export function variationUnitPrice(product, variationId) {
  const chosen = activeVariations(product).find(
    (variation) => String(variation.id) === String(variationId)
  );
  if (chosen) return Number(chosen.price);
  const bounds = variationPriceBounds(product);
  if (bounds) return bounds.min;
  return Number(product?.value || 0);
}
