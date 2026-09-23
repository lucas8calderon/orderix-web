const VALID_MODES = new Set(['DELIVERY', 'PICKUP']);

export function resolveFulfillmentModes(catalog) {
  const raw = catalog?.fulfillmentModes;
  if (Array.isArray(raw)) {
    const modes = raw
      .map((mode) => String(mode || '').toUpperCase())
      .filter((mode) => VALID_MODES.has(mode));
    if (modes.length) return Array.from(new Set(modes));
  }
  return ['DELIVERY', 'PICKUP'];
}

export function defaultFulfillment(modes) {
  if (modes.includes('DELIVERY')) return 'DELIVERY';
  if (modes.includes('PICKUP')) return 'PICKUP';
  return 'DELIVERY';
}

export function offersDelivery(modes) {
  return modes.includes('DELIVERY');
}

export function offersPickup(modes) {
  return modes.includes('PICKUP');
}
