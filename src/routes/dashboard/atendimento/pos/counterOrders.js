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
