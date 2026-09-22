export const DEMO_CART_KEY_PREFIX = 'weper_demo_cart_';

export function demoCartKey(slug) {
  return `${DEMO_CART_KEY_PREFIX}${slug || 'unknown'}`;
}

export function emptyDemoCart() {
  return { items: [] };
}

export function readDemoCart(slug) {
  if (typeof window === 'undefined' || !slug) return emptyDemoCart();
  try {
    const raw = window.localStorage.getItem(demoCartKey(slug));
    if (!raw) return emptyDemoCart();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return emptyDemoCart();
    return { items: parsed.items };
  } catch {
    return emptyDemoCart();
  }
}

export function writeDemoCart(slug, cart) {
  if (typeof window === 'undefined' || !slug) return;
  const next = cart || emptyDemoCart();
  if (!next.items?.length) {
    window.localStorage.removeItem(demoCartKey(slug));
    return;
  }
  window.localStorage.setItem(demoCartKey(slug), JSON.stringify(next));
}

export function clearDemoCart(slug) {
  if (typeof window === 'undefined' || !slug) return;
  window.localStorage.removeItem(demoCartKey(slug));
}

export function demoItemKey(item) {
  const extras = (item.extras || [])
    .map((extra) => `${extra.id}:${extra.quantity || 1}`)
    .sort()
    .join(',');
  const selections = (item.mandatorySelections || [])
    .map((selection) => `${selection.groupId}:${selection.selectedItemId}`)
    .sort()
    .join(',');
  return [item.productId, item.observation || '', extras, selections].join('|');
}

export function addDemoCartItem(cart, incoming) {
  const items = [...(cart?.items || [])];
  const key = demoItemKey(incoming);
  const index = items.findIndex((item) => demoItemKey(item) === key);
  if (index >= 0) {
    items[index] = {
      ...items[index],
      quantity: Number(items[index].quantity || 0) + Number(incoming.quantity || 1),
    };
  } else {
    items.push({ ...incoming, quantity: Number(incoming.quantity || 1) });
  }
  return { items };
}

export function updateDemoCartQuantity(cart, key, quantity) {
  const nextQty = Number(quantity);
  const items = (cart?.items || [])
    .map((item) => (demoItemKey(item) === key ? { ...item, quantity: nextQty } : item))
    .filter((item) => Number(item.quantity) > 0);
  return { items };
}

export function removeDemoCartItem(cart, key) {
  return { items: (cart?.items || []).filter((item) => demoItemKey(item) !== key) };
}

export function demoLineTotal(item) {
  const qty = Number(item.quantity || 0);
  const extras = (item.extras || []).reduce((sum, extra) => (
    sum + Number(extra.price || 0) * Number(extra.quantity || 1)
  ), 0);
  const selections = (item.mandatorySelections || []).reduce((sum, selection) => (
    sum + Number(selection.price || 0)
  ), 0);
  return (Number(item.unitPrice || 0) + extras + selections) * qty;
}

export function demoCartTotals(cart, { deliveryFee = 0, fulfillment = 'PICKUP' } = {}) {
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + demoLineTotal(item), 0);
  const fee = fulfillment === 'DELIVERY' ? Number(deliveryFee || 0) : 0;
  return {
    itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    subtotal,
    deliveryFee: fee,
    total: subtotal + fee,
  };
}
