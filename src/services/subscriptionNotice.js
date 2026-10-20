const listeners = new Set();
let notice = '';

export function publishSubscriptionNotice(value) {
  const next = typeof value === 'string' ? value.trim() : '';
  if (next === notice) {
    return;
  }
  notice = next;
  listeners.forEach((listener) => listener(notice));
}

export function getSubscriptionNotice() {
  return notice;
}

export function subscribeSubscriptionNotice(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
