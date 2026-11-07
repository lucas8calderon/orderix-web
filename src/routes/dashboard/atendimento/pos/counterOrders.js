import { normalizeSearch } from './catalogView';

export function isOpenCounterOrder(order) {
  const status = String(order?.status || 'ACTIVE').toUpperCase();
  if (status === 'CLOSED') return false;
  if (status !== 'CANCELLED') return true;
  const cancelledAt = order?.cancelledAt ? new Date(order.cancelledAt) : null;
  if (!cancelledAt || Number.isNaN(cancelledAt.getTime())) return true;
  return Date.now() - cancelledAt.getTime() < 24 * 60 * 60 * 1000;
}

export function isActiveCounterSale(order) {
  const status = String(order?.status || 'ACTIVE').toUpperCase();
  return status !== 'CLOSED' && status !== 'CANCELLED';
}

function recencyMillis(order) {
  const time = Date.parse(order?.createdAt);
  return Number.isFinite(time) ? time : null;
}

/** Mais novo no topo. Empate de createdAt (ou data ausente) desempata pelo id maior. */
export function compareCounterOrdersNewestFirst(left, right) {
  const leftTime = recencyMillis(left);
  const rightTime = recencyMillis(right);
  if (leftTime !== rightTime) {
    if (leftTime == null) return 1;
    if (rightTime == null) return -1;
    return rightTime - leftTime;
  }
  const leftId = Number(left?.id);
  const rightId = Number(right?.id);
  const safeLeft = Number.isFinite(leftId) ? leftId : Number.NEGATIVE_INFINITY;
  const safeRight = Number.isFinite(rightId) ? rightId : Number.NEGATIVE_INFINITY;
  return safeRight - safeLeft;
}

export function sortCounterOrdersNewestFirst(orders) {
  return [...(Array.isArray(orders) ? orders : [])].sort(compareCounterOrdersNewestFirst);
}

export function counterOrderMatches(order, query) {
  const needle = normalizeSearch(query).replace(/^#/, '');
  if (!needle) return true;
  const name = normalizeSearch(order?.customerName);
  const id = normalizeSearch(order?.id);
  return name.includes(needle) || id.includes(needle);
}

export function elapsedLabel(value, now = Date.now()) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.max(0, Math.floor((now - date.getTime()) / 60000));
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

export function counterStatusLabel(order) {
  const status = String(order?.status || 'ACTIVE').toUpperCase();
  if (status === 'CANCELLED') return { label: 'Cancelado', tone: 'danger' };
  if (status === 'CLOSED') return { label: 'Finalizado', tone: 'neutral' };
  if (status === 'HELD') return { label: 'Aguardando pagamento', tone: 'warning' };
  return { label: 'Em aberto', tone: 'info' };
}

const SETTLED_PAYMENT_STATUSES = new Set(['APPROVED', 'PAID', 'PAID_EXTERNALLY']);

export function isCounterOrderPaid(order) {
  return SETTLED_PAYMENT_STATUSES.has(String(order?.paymentStatus || '').toUpperCase());
}

export function counterPaymentLabel(order) {
  if (isCounterOrderPaid(order)) return { label: 'Pago', tone: 'success' };
  return { label: 'Não pago', tone: 'warning' };
}

export function matchesCounterPaymentFilter(order, paymentFilter) {
  if (paymentFilter !== 'paid' && paymentFilter !== 'unpaid') return true;
  const paid = isCounterOrderPaid(order);
  return paymentFilter === 'paid' ? paid : !paid;
}
