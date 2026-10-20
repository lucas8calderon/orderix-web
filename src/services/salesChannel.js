export const SALES_CHANNELS = [
  { id: 'garcom', label: 'Garçom' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'mesa', label: 'Mesas' },
  { id: 'comanda', label: 'Comandas' },
  { id: 'balcao', label: 'Balcão' },
  { id: 'pedido_cliente', label: 'Pedido por Cliente' },
];

export const SALES_CHANNEL_FILTERS = [
  { id: 'todos', label: 'Todos' },
  ...SALES_CHANNELS,
];

const CHANNEL_IDS = new Set(SALES_CHANNELS.map((item) => item.id));

export function isSalesChannel(value) {
  return CHANNEL_IDS.has(value);
}

export function salesChannelLabel(channel) {
  const match = SALES_CHANNELS.find((item) => item.id === channel);
  return match ? match.label : 'Balcão';
}

export function resolveSalesChannel(order) {
  if (!order) {
    return 'balcao';
  }
  if (isSalesChannel(order.salesChannel)) {
    return order.salesChannel;
  }
  if (isSalesChannel(order.channel)) {
    return order.channel;
  }
  if (isSalesChannel(order.orderType)) {
    return order.orderType;
  }
  const source = order.orderSource;
  if (source === 'CUSTOMER_ORDER') {
    return 'pedido_cliente';
  }
  if (source === 'DELIVERY' || source === 'PICKUP') {
    return 'delivery';
  }
  if (order.comandaId) {
    return 'comanda';
  }
  const waiterId = Number(order.waiterId);
  if (source === 'WAITER' || (waiterId > 0 && waiterId !== 999)) {
    return 'garcom';
  }
  const tableId = Number(order.tableId);
  if (order.fromTable || order.isFromTable || (tableId > 0 && tableId !== 999)) {
    return 'mesa';
  }
  return 'balcao';
}

export function formatOrderDisplayCode(order) {
  if (order?.displayCode) {
    return String(order.displayCode);
  }
  const id = Number(order?.id);
  if (!Number.isFinite(id)) {
    return '';
  }
  if (id >= 0 && id < 10000) {
    return String(id).padStart(4, '0');
  }
  return String(id);
}

export function kitchenLocationLabel(order) {
  const channel = resolveSalesChannel(order);
  if (channel === 'pedido_cliente') {
    const code = formatOrderDisplayCode(order);
    return code ? `#${code}` : 'Cliente';
  }
  if (channel === 'delivery') {
    return 'Delivery';
  }
  if (channel === 'comanda') {
    const number = order?.comandaNumber ?? order?.tableNumber;
    return number != null && number !== '' ? `Comanda ${number}` : 'Comanda';
  }
  if (channel === 'balcao') {
    return order?.id != null ? `Pedido ${order.id}` : 'Balcão';
  }
  const number = order?.tableNumber;
  return number != null && number !== '' ? `Mesa ${number}` : 'Mesa';
}
