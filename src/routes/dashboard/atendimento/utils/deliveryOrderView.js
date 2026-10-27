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

export function fulfillmentLabel(order) {
  return isPickupOrder(order) ? 'Retirada' : 'Entrega';
}

export function isOpenDeliveryOrder(order) {
  return String(order?.status || '').toUpperCase() === 'ACTIVE';
}

export function isPendingStoreCharge(order) {
  if (!isOpenDeliveryOrder(order)) return false;
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
