const PII_KEYS = new Set(['customerName', 'name', 'phone', 'customerPhone', 'email', 'address']);

export const DEMO_EVENTS = {
  VIEW: 'demo_view',
  STORE_SELECTED: 'demo_store_selected',
  PRODUCT_VIEW: 'demo_product_view',
  ADD_TO_CART: 'demo_add_to_cart',
  CART_VIEW: 'demo_cart_view',
  CHECKOUT_STARTED: 'demo_checkout_started',
  ORDER_SIMULATED: 'demo_order_simulated',
  CTA_CLICKED: 'demo_cta_clicked',
};

function sanitizePayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => (
      !PII_KEYS.has(key) && value !== undefined && value !== null
    ))
  );
}

/**
 * Dispara eventos de demo sem instalar analytics novo.
 * Usa gtag/dataLayer só se já existirem na página.
 */
export function trackDemoEvent(name, payload = {}) {
  if (typeof window === 'undefined' || !name) return;
  const params = sanitizePayload(payload);

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params });
  }
}
