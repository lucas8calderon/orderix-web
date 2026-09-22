const STORAGE_KEY = 'weper.delivery.customer.session';

export function readDeliveryCustomerSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getDeliveryCustomerToken() {
  return readDeliveryCustomerSession()?.token || null;
}

export function saveDeliveryCustomerSession(session) {
  if (typeof window === 'undefined' || !session?.token) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    token: session.token,
    id: session.id,
    name: session.name,
    email: session.email,
    phone: session.phone,
  }));
  window.dispatchEvent(new Event('weper-delivery-customer-changed'));
}

export function clearDeliveryCustomerSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('weper-delivery-customer-changed'));
}
