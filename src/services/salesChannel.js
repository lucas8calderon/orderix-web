export const SALES_CHANNELS = [
  { id: 'garcom', label: 'Garçom' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'mesa', label: 'Mesas' },
  { id: 'comanda', label: 'Comandas' },
  { id: 'balcao', label: 'Balcão' },
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
