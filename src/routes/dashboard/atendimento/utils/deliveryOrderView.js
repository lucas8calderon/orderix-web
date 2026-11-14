import { accountSubtotal } from './accountTotals';

const KITCHEN_STATUS_LABELS = {
  NEW: 'Novo',
  IN_PREPARATION: 'Em produção',
  READY: 'Feito',
  DELIVERED: 'Entregue',
  FINALIZED: 'Finalizado',
};

export function isPickupOrder(order) {
  const fulfillment = String(order?.deliveryFulfillment || '').toUpperCase();
  if (fulfillment === 'PICKUP') return true;
  if (fulfillment === 'DELIVERY') return false;
  return String(order?.orderSource || '').toUpperCase() === 'PICKUP';
}

const ROUTE_KITCHEN_STATUSES = new Set(['NEW', 'IN_PREPARATION', 'READY']);

function isDeliveryFulfillment(order) {
  const fulfillment = String(order?.deliveryFulfillment || '').toUpperCase();
  const source = String(order?.orderSource || '').toUpperCase();
  return fulfillment === 'DELIVERY' || (!fulfillment && source === 'DELIVERY');
}

function routeKitchenStatus(order) {
  return String(order?.kitchenStatus || 'NEW').toUpperCase();
}

function hasStreetAndNumber(order) {
  return Boolean(String(order?.deliveryStreet || '').trim() && String(order?.deliveryNumber || '').trim());
}

/** Entrega em aberto, ainda na loja (novo, em produção ou feito), com rua e número. */
export function isDeliveryRouteEligible(order) {
  if (!isDeliveryFulfillment(order)) return false;
  if (String(order?.status || '').toUpperCase() !== 'ACTIVE') return false;
  if (!ROUTE_KITCHEN_STATUSES.has(routeKitchenStatus(order))) return false;
  if (!hasStreetAndNumber(order)) return false;
  return true;
}

/** Entrega que entraria na rota se tivesse rua e número. */
export function needsDeliveryRouteAddress(order) {
  if (!isDeliveryFulfillment(order)) return false;
  if (String(order?.status || '').toUpperCase() !== 'ACTIVE') return false;
  if (!ROUTE_KITCHEN_STATUSES.has(routeKitchenStatus(order))) return false;
  return !hasStreetAndNumber(order);
}

export function deliveryAddressParts(order) {
  const street = [order?.deliveryStreet, order?.deliveryNumber]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ');
  const neighborhood = String(order?.deliveryNeighborhood || '').trim();
  const complement = String(order?.deliveryComplement || '').trim();
  const city = [order?.deliveryCity, order?.deliveryState]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join('/');
  return {
    street,
    neighborhood,
    complement,
    line: [street, neighborhood, city].filter(Boolean).join(' — '),
  };
}

export function fulfillmentLabel(order) {
  return isPickupOrder(order) ? 'Retirada' : 'Entrega';
}

export function isOpenDeliveryOrder(order) {
  const status = String(order?.status || '').toUpperCase();
  return status === 'ACTIVE' || status === 'HELD';
}

export function isPendingStoreCharge(order) {
  if (!isOpenDeliveryOrder(order)) return false;
  if (String(order?.status || '').toUpperCase() === 'HELD') return true;
  return order?.onlinePayment !== true;
}

export function deliveryPaymentLabel(order) {
  const status = String(order?.status || '').toUpperCase();
  if (status === 'CANCELLED') return 'Cancelado';
  if (status === 'CLOSED') return 'Pago';
  if (order?.onlinePayment === true) {
    return status === 'HELD' ? 'Aguardando pagamento online' : 'Pago online';
  }
  if (status === 'HELD') return 'Aguardando pagamento';
  return isPickupOrder(order) ? 'A receber na retirada' : 'A receber na entrega';
}

export function kitchenStatusLabel(order) {
  const status = String(order?.kitchenStatus || 'NEW').toUpperCase();
  return KITCHEN_STATUS_LABELS[status] || 'Novo';
}

export function deliveryFeeAmount(order) {
  const fee = Number(order?.deliveryFee);
  return Number.isFinite(fee) && fee > 0 ? fee : 0;
}

export function deliveryChargeParts(order) {
  const fee = deliveryFeeAmount(order);
  const products = order?.products || [];
  if (products.length) {
    return { items: accountSubtotal({ orders: [order] }), fee };
  }
  const stored = Number(order?.totalAmount);
  const total = Number.isFinite(stored) ? stored : 0;
  return { items: Math.max(0, total - fee), fee: total > 0 ? fee : 0 };
}

export function deliveryOrderTotal(order) {
  const parts = deliveryChargeParts(order);
  return parts.items + parts.fee;
}

export function summarizeOrderItems(order, limit = 3) {
  const lines = (order?.products || []).map((product) => {
    const quantity = Number(product.quantity) > 0 ? Number(product.quantity) : 1;
    const name = product.name || 'Item';
    return `${quantity}x ${name}`;
  });
  if (lines.length <= limit) return lines;
  const hidden = lines.length - limit;
  return [...lines.slice(0, limit), `+${hidden} ${hidden === 1 ? 'item' : 'itens'}`];
}
