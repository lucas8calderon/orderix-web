import { isSalesChannel } from '../../../services/salesChannel';

export const KITCHEN_ALL_FILTER = 'todos';
export const KITCHEN_LATE_FILTER = 'atrasados';

/** Pedido em Novo ou Em Produção há pelo menos 20 minutos. */
export const KITCHEN_LATE_AFTER_MS = 20 * 60 * 1000;

export function createKitchenFilterState(initialFilter) {
  if (initialFilter === KITCHEN_LATE_FILTER) {
    return { channels: [], lateOnly: true };
  }
  if (isSalesChannel(initialFilter)) {
    return { channels: [initialFilter], lateOnly: false };
  }
  return { channels: [], lateOnly: false };
}

export function kitchenFilterSelection(state) {
  const channels = state?.channels || [];
  const lateOnly = Boolean(state?.lateOnly);
  if (!lateOnly && channels.length === 0) {
    return [KITCHEN_ALL_FILTER];
  }
  return lateOnly ? [...channels, KITCHEN_LATE_FILTER] : [...channels];
}

/**
 * "Todos" zera canais e também "Atrasados": ver tudo é nenhum filtro ativo.
 * Desmarcar o último canal só volta para Todos se o atraso também estiver desligado.
 * Com o atraso ligado e sem canais, a tela fica só em "Atrasados" (atrasados de todos).
 */
export function toggleKitchenFilter(state, filterId) {
  const channels = state?.channels || [];
  const lateOnly = Boolean(state?.lateOnly);

  if (!filterId || filterId === KITCHEN_ALL_FILTER) {
    return { channels: [], lateOnly: false };
  }

  if (filterId === KITCHEN_LATE_FILTER) {
    return { channels: [...channels], lateOnly: !lateOnly };
  }

  if (!isSalesChannel(filterId)) {
    return { channels: [...channels], lateOnly };
  }

  const channelsNext = channels.includes(filterId)
    ? channels.filter((id) => id !== filterId)
    : [...channels, filterId];

  return { channels: channelsNext, lateOnly };
}

export function clickedFilterId(currentIds, nextIds) {
  const current = Array.isArray(currentIds) ? currentIds : [];
  const next = Array.isArray(nextIds) ? nextIds : [];
  const added = next.find((id) => !current.includes(id));
  if (added) {
    return added;
  }
  return current.find((id) => !next.includes(id)) || null;
}

export function applyKitchenFilterClick(state, nextValue) {
  const clicked = clickedFilterId(kitchenFilterSelection(state), nextValue);
  if (!clicked) {
    return state;
  }
  return toggleKitchenFilter(state, clicked);
}

export function isLateKitchenOrder(order, now = Date.now()) {
  if (!order || (order.status !== 'novo' && order.status !== 'em_producao')) {
    return false;
  }
  const createdAt = order.createdAt;
  if (!createdAt || typeof createdAt.getTime !== 'function') {
    return false;
  }
  const time = createdAt.getTime();
  if (!Number.isFinite(time)) {
    return false;
  }
  return time <= now - KITCHEN_LATE_AFTER_MS;
}

export function filterKitchenOrders(orders, state, now = Date.now()) {
  const list = Array.isArray(orders) ? orders : [];
  const channels = state?.channels || [];
  const lateOnly = Boolean(state?.lateOnly);
  return list.filter((order) => {
    if (channels.length > 0 && !channels.includes(order.orderType)) {
      return false;
    }
    if (lateOnly && !isLateKitchenOrder(order, now)) {
      return false;
    }
    return true;
  });
}
