import { canAccessRoute, PATHS } from '../../../services/accessControl';

export const SHOW_OPEN_ORDERS_EVENT = 'weper-show-open-orders';
export const FOCUS_NEW_ORDER_EVENT = 'weper-focus-new-order';

let pendingOpenOrders = false;
let pendingKitchenFocusId = null;

export function requestOpenOrders() {
  pendingOpenOrders = true;
  window.dispatchEvent(new CustomEvent(SHOW_OPEN_ORDERS_EVENT));
}

export function takeOpenOrdersRequest() {
  if (!pendingOpenOrders) return false;
  pendingOpenOrders = false;
  return true;
}

export function queueKitchenFocus(orderId) {
  pendingKitchenFocusId = orderId == null || orderId === '' ? null : String(orderId);
  window.dispatchEvent(new CustomEvent(FOCUS_NEW_ORDER_EVENT, {
    detail: { orderId: pendingKitchenFocusId },
  }));
}

export function peekKitchenFocusId() {
  return pendingKitchenFocusId;
}

export function clearKitchenFocusId(orderId) {
  if (pendingKitchenFocusId == null) return;
  if (orderId == null || String(orderId) === pendingKitchenFocusId) {
    pendingKitchenFocusId = null;
  }
}

export function openNewOrderDestination({ pathname, user, newestOrderId, navigate }) {
  const path = pathname || '';
  if (path === PATHS.APP_COZINHA || path.startsWith(`${PATHS.APP_COZINHA}/`)) {
    queueKitchenFocus(newestOrderId);
    return 'kitchen-focus';
  }
  if (canAccessRoute(user, PATHS.APP_ATENDIMENTO)) {
    if (typeof navigate === 'function') {
      navigate(PATHS.APP_ATENDIMENTO);
    }
    requestOpenOrders();
    return 'open-orders';
  }
  if (canAccessRoute(user, PATHS.APP_COZINHA)) {
    queueKitchenFocus(newestOrderId);
    if (typeof navigate === 'function') {
      navigate(PATHS.APP_COZINHA);
    }
    return 'kitchen';
  }
  return 'stay';
}
