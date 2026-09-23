/**
 * Analytics opcional do cardápio digital.
 * Melhoria futura: se o app passar a ter um tracker central, redirecionar estes eventos
 * para ele. Hoje só usa gtag/dataLayer se já existirem — sem PII.
 */
export const DIGITAL_MENU_EVENTS = {
  PRODUCT_SELECTED: 'digital_menu_product_selected',
  PRODUCT_UNSELECTED: 'digital_menu_product_unselected',
  SELECTION_OPENED: 'digital_menu_selection_opened',
  SELECTION_CLEARED: 'digital_menu_selection_cleared',
};

export function trackDigitalMenuEvent(name, payload = {}) {
  if (typeof window === 'undefined' || !name) return;
  const params = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  );

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params });
  }
}
