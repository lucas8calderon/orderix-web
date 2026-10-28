import { getRestaurantId } from '../../../../services/accessControl';
import { getCurrentUser } from '../../../../services/session';

export function draftStorageKey(user = getCurrentUser()) {
  const storeId = getRestaurantId(user);
  return `weper.counter-draft.${storeId || 'local'}`;
}

export function readCounterDraft(storage = sessionStorage, user = getCurrentUser()) {
  try {
    const raw = storage.getItem(draftStorageKey(user));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.lines)) return null;
    return {
      customerName: String(parsed.customerName || ''),
      observation: String(parsed.observation || ''),
      lines: parsed.lines.filter((line) => line?.product?.id != null && line?.key),
    };
  } catch {
    return null;
  }
}

export function writeCounterDraft(draft, storage = sessionStorage, user = getCurrentUser()) {
  storage.setItem(draftStorageKey(user), JSON.stringify({
    customerName: draft?.customerName || '',
    observation: draft?.observation || '',
    lines: draft?.lines || [],
  }));
}

export function clearCounterDraft(storage = sessionStorage, user = getCurrentUser()) {
  storage.removeItem(draftStorageKey(user));
}
