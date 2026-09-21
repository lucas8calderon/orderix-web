import { resolveMandatorySelections } from '../atendimento/utils/accountTotals';
import { resolveSalesChannel, salesChannelLabel } from '../../../services/salesChannel';

const KITCHEN_TO_UI = {
  NEW: 'novo',
  IN_PREPARATION: 'em_producao',
  READY: 'feito',
  DELIVERED: 'entregue',
  FINALIZED: 'entregue',
};

export function resolveUiStatus(order) {
  if (order.status === 'CLOSED') {
    return 'finalizado';
  }
  return KITCHEN_TO_UI[order.kitchenStatus] || 'novo';
}

export function orderTypeLabel(orderType) {
  return salesChannelLabel(orderType);
}

export function mapKitchenOrder(order) {
  const products = order.products || [];
  const items = products.map((product) => {
    const quantity = Number(product.quantity) > 0 ? Number(product.quantity) : 1;
    const extras = (product.extras || [])
      .map((extra) => {
        const extraQty = Number(extra.quantity) > 1 ? ` x${extra.quantity}` : '';
        return extra.name ? `${extra.name}${extraQty}` : '';
      })
      .filter(Boolean);
    const selections = resolveMandatorySelections(product).map(
      (selection) => `${selection.groupName}: ${selection.itemName}`
    );
    return {
      label: `${quantity}x ${product.name}`,
      observation: (product.observation || '').trim(),
      extras,
      selections,
    };
  });
  const orderType = resolveSalesChannel(order);
  const address = [
    order.deliveryStreet,
    order.deliveryNumber,
    order.deliveryNeighborhood,
    order.deliveryCity,
    order.deliveryState,
  ].filter(Boolean).join(', ');
  const deliveryNotes = [
    order.orderSource === 'PICKUP' ? 'Retirada no local' : '',
    order.customerPhone ? `Tel: ${order.customerPhone}` : '',
    address,
    order.paymentMethod ? `Pagamento: ${order.paymentMethod}` : '',
    order.deliveryChangeFor ? `Troco para R$ ${Number(order.deliveryChangeFor).toFixed(2)}` : '',
  ].filter(Boolean).join(' · ');
  return {
    id: order.id,
    orderNumber: `#${order.id}`,
    customerName: order.customerName || 'Cliente',
    items,
    status: resolveUiStatus(order),
    createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
    tableNumber: order.tableNumber || order.comandaNumber || (orderType === 'delivery' ? 'Delivery' : '—'),
    waiter: order.waiterName || '—',
    notes: [(order.observation || '').trim(), deliveryNotes].filter(Boolean).join('\n'),
    orderType,
    orderStatus: order.status || 'ACTIVE',
  };
}
