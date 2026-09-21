const storageKey = (slug) => `weper.delivery.cart.${slug || 'unknown'}`;

export function emptyCart() {
  return { items: [] };
}

export function readCart(slug) {
  if (typeof window === 'undefined' || !slug) return emptyCart();
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return emptyCart();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();
    return { items: parsed.items };
  } catch {
    return emptyCart();
  }
}

export function writeCart(slug, cart) {
  if (typeof window === 'undefined' || !slug) return;
  window.localStorage.setItem(storageKey(slug), JSON.stringify(cart || emptyCart()));
}

export function clearCart(slug) {
  writeCart(slug, emptyCart());
}

export function itemKey(item) {
  const extras = (item.extras || [])
    .map((extra) => `${extra.productExtraId}:${extra.quantity || 1}`)
    .sort()
    .join(',');
  const selections = (item.mandatorySelections || [])
    .map((selection) => `${selection.mandatoryGroupId}:${selection.selectedItemId}`)
    .sort()
    .join(',');
  return [item.productId, item.observation || '', extras, selections].join('|');
}

export function addCartItem(cart, incoming) {
  const items = [...(cart?.items || [])];
  const key = itemKey(incoming);
  const index = items.findIndex((item) => itemKey(item) === key);
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

export function updateCartQuantity(cart, key, quantity) {
  const nextQty = Number(quantity);
  const items = (cart?.items || [])
    .map((item) => (itemKey(item) === key ? { ...item, quantity: nextQty } : item))
    .filter((item) => Number(item.quantity) > 0);
  return { items };
}

export function removeCartItem(cart, key) {
  return { items: (cart?.items || []).filter((item) => itemKey(item) !== key) };
}

export function cartTotals(cart, { deliveryFee = 0, fulfillment = 'DELIVERY' } = {}) {
  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const fee = fulfillment === 'PICKUP' ? 0 : Number(deliveryFee || 0);
  return {
    itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    subtotal,
    deliveryFee: fee,
    total: subtotal + fee,
  };
}

export function lineTotal(item) {
  const qty = Number(item.quantity || 0);
  const extras = (item.extras || []).reduce((sum, extra) => {
    return sum + Number(extra.price || 0) * Number(extra.quantity || 1);
  }, 0);
  const selections = (item.mandatorySelections || []).reduce((sum, selection) => {
    return sum + Number(selection.price || 0);
  }, 0);
  return (Number(item.unitPrice || 0) + extras + selections) * qty;
}
