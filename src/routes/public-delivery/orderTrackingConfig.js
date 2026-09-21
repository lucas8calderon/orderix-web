/**
 * Configuração central do acompanhamento público de pedidos Delivery.
 * Fonte de verdade de textos/passos: trackingStatus do backend (não inventar avanço no client).
 */

export const TRACKING_STATUS = {
  RECEIVED: 'RECEIVED',
  IN_PREPARATION: 'IN_PREPARATION',
  READY: 'READY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const FULFILLMENT = {
  PICKUP: 'PICKUP',
  DELIVERY: 'DELIVERY',
};

export const STEP_STATE = {
  COMPLETED: 'COMPLETED',
  CURRENT: 'CURRENT',
  PENDING: 'PENDING',
};

/** Status em que o polling para. */
export const FINAL_TRACKING_STATUSES = new Set([
  TRACKING_STATUS.DELIVERED,
  TRACKING_STATUS.CANCELLED,
]);

export const POLL_INTERVAL_MS = 10000;
export const POLL_HIDDEN_INTERVAL_MS = 45000;

const PAYMENT_LABELS = {
  PIX: 'PIX',
  CREDIT: 'Crédito',
  DEBIT: 'Débito',
  CASH: 'Dinheiro',
  VOUCHER: 'Vale',
  OTHER: 'Outro',
};

const PICKUP_STEPS = [
  TRACKING_STATUS.RECEIVED,
  TRACKING_STATUS.IN_PREPARATION,
  TRACKING_STATUS.READY,
  TRACKING_STATUS.DELIVERED,
];

const DELIVERY_STEPS = [
  TRACKING_STATUS.RECEIVED,
  TRACKING_STATUS.IN_PREPARATION,
  TRACKING_STATUS.READY,
  TRACKING_STATUS.OUT_FOR_DELIVERY,
  TRACKING_STATUS.DELIVERED,
];

const STEP_COPY = {
  [FULFILLMENT.PICKUP]: {
    [TRACKING_STATUS.RECEIVED]: {
      label: 'Pedido recebido',
      description: 'Seu pedido foi confirmado.',
      icon: 'check',
    },
    [TRACKING_STATUS.IN_PREPARATION]: {
      label: 'Em preparação',
      description: 'Nossa equipe está preparando seu pedido.',
      icon: 'chef',
    },
    [TRACKING_STATUS.READY]: {
      label: 'Pronto para retirada',
      description: 'Assim que estiver pronto, avisaremos aqui.',
      icon: 'chef',
    },
    [TRACKING_STATUS.DELIVERED]: {
      label: 'Retirado',
      description: 'Você receberá a confirmação quando o pedido for retirado.',
      icon: 'store',
    },
  },
  [FULFILLMENT.DELIVERY]: {
    [TRACKING_STATUS.RECEIVED]: {
      label: 'Pedido recebido',
      description: 'Seu pedido foi confirmado.',
      icon: 'check',
    },
    [TRACKING_STATUS.IN_PREPARATION]: {
      label: 'Em preparação',
      description: 'Nossa equipe está preparando seu pedido.',
      icon: 'chef',
    },
    [TRACKING_STATUS.READY]: {
      label: 'Pronto',
      description: 'Seu pedido está pronto e logo sairá para entrega.',
      icon: 'check',
    },
    [TRACKING_STATUS.OUT_FOR_DELIVERY]: {
      label: 'Saiu para entrega',
      description: 'Seu pedido saiu do estabelecimento e está a caminho.',
      icon: 'delivery',
    },
    [TRACKING_STATUS.DELIVERED]: {
      label: 'Entregue',
      description: 'Pedido entregue. Esperamos que aproveite!',
      icon: 'check',
    },
  },
};

/**
 * Card de status atual (destaque).
 */
export function getCurrentStatusCard(order) {
  const fulfillment = normalizeFulfillment(order?.fulfillment);
  const status = normalizeTrackingStatus(order?.trackingStatus);
  const storeName = (order?.storeName || 'o estabelecimento').trim();

  if (status === TRACKING_STATUS.CANCELLED) {
    return {
      status,
      eyebrow: 'STATUS ATUAL',
      title: 'Pedido cancelado',
      description: order?.cancelReason
        ? String(order.cancelReason)
        : 'Este pedido foi cancelado. Em caso de dúvidas, fale com o estabelecimento.',
      tone: 'cancelled',
      icon: 'cancel',
      emphasize: true,
    };
  }

  if (status === TRACKING_STATUS.READY && fulfillment === FULFILLMENT.PICKUP) {
    return {
      status,
      eyebrow: 'STATUS ATUAL',
      title: 'Seu pedido está pronto!',
      description: `Você já pode retirá-lo no estabelecimento${storeName !== 'o estabelecimento' ? ` (${storeName})` : ''}.`,
      tone: 'ready',
      icon: 'ready',
      emphasize: true,
    };
  }

  if (status === TRACKING_STATUS.OUT_FOR_DELIVERY) {
    return {
      status,
      eyebrow: 'STATUS ATUAL',
      title: 'Seu pedido está a caminho!',
      description: 'Seu pedido já saiu do estabelecimento e está indo até você.',
      tone: 'transit',
      icon: 'delivery',
      emphasize: true,
    };
  }

  if (status === TRACKING_STATUS.DELIVERED) {
    const pickup = fulfillment === FULFILLMENT.PICKUP;
    return {
      status,
      eyebrow: 'STATUS ATUAL',
      title: pickup ? 'Pedido retirado' : 'Pedido entregue',
      description: pickup
        ? 'A retirada foi confirmada. Obrigado pela preferência!'
        : 'Pedido entregue. Esperamos que aproveite!',
      tone: 'done',
      icon: 'check',
      emphasize: true,
    };
  }

  const map = {
    [TRACKING_STATUS.RECEIVED]: {
      title: 'Pedido recebido',
      description: 'Recebemos seu pedido e ele já foi enviado para o estabelecimento.',
      icon: 'received',
      tone: 'default',
    },
    [TRACKING_STATUS.IN_PREPARATION]: {
      title: 'Em preparação',
      description: `Seu pedido está sendo preparado pela equipe do ${storeName}.`,
      icon: 'chef',
      tone: 'default',
    },
    [TRACKING_STATUS.READY]: {
      title: 'Pronto',
      description: 'Seu pedido está pronto e logo sairá para entrega.',
      icon: 'ready',
      tone: 'ready',
    },
  };

  const entry = map[status] || map[TRACKING_STATUS.RECEIVED];
  return {
    status,
    eyebrow: 'STATUS ATUAL',
    title: entry.title,
    description: entry.description,
    tone: entry.tone,
    icon: entry.icon,
    emphasize: false,
  };
}

export function getFulfillmentBadge(fulfillment) {
  const type = normalizeFulfillment(fulfillment);
  if (type === FULFILLMENT.PICKUP) {
    return {
      type,
      label: 'Retirada no estabelecimento',
      shortLabel: 'Retirada',
      icon: 'store',
    };
  }
  return {
    type,
    label: 'Entrega',
    shortLabel: 'Entrega',
    icon: 'delivery',
  };
}

export function getEstimateCopy(fulfillment) {
  return normalizeFulfillment(fulfillment) === FULFILLMENT.PICKUP
    ? 'Previsão para retirada'
    : 'Previsão de entrega';
}

export function formatPaymentLabel(paymentMethod, fulfillment) {
  const method = PAYMENT_LABELS[paymentMethod] || paymentMethod || 'Pagamento';
  const when = normalizeFulfillment(fulfillment) === FULFILLMENT.PICKUP ? 'na retirada' : 'na entrega';
  return `${method} ${when}`;
}

export function formatDeliveryAddressSummary(order) {
  if (!order) return 'Endereço informado';
  const street = (order.street || '').trim();
  const number = (order.number || '').trim();
  if (!street) return 'Endereço informado';
  const neighborhood = (order.neighborhood || '').trim();
  const parts = [`${street}${number ? `, ${number}` : ''}`];
  if (neighborhood) parts.push(neighborhood);
  return parts.join(' — ');
}

export function formatTime(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatEstimateWindow(from, to) {
  const start = formatTime(from);
  const end = formatTime(to);
  if (start && end) return `${start} – ${end}`;
  if (end) return end;
  if (start) return start;
  return null;
}

export function historyTimestampMap(statusHistory = []) {
  const map = {};
  (statusHistory || []).forEach((entry) => {
    if (!entry?.status || !entry?.at) return;
    map[entry.status] = entry.at;
  });
  return map;
}

/**
 * Monta timeline PICKUP/DELIVERY com COMPLETED | CURRENT | PENDING.
 */
export function getTrackingSteps(order) {
  const fulfillment = normalizeFulfillment(order?.fulfillment);
  const status = normalizeTrackingStatus(order?.trackingStatus);
  const stepIds = fulfillment === FULFILLMENT.PICKUP ? PICKUP_STEPS : DELIVERY_STEPS;
  const copy = STEP_COPY[fulfillment];
  const timestamps = historyTimestampMap(order?.statusHistory);

  if (status === TRACKING_STATUS.CANCELLED) {
    return [];
  }

  let currentIndex = stepIds.indexOf(status);
  if (currentIndex < 0) currentIndex = 0;

  return stepIds.map((id, index) => {
    const meta = copy[id];
    let state = STEP_STATE.PENDING;
    if (index < currentIndex) state = STEP_STATE.COMPLETED;
    else if (index === currentIndex) state = STEP_STATE.CURRENT;
    // Estado final: todos COMPLETED
    if (status === TRACKING_STATUS.DELIVERED) {
      state = STEP_STATE.COMPLETED;
    }
    return {
      id,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
      state,
      timestamp: formatTime(timestamps[id]),
      at: timestamps[id] || null,
    };
  });
}

export function isFinalTrackingStatus(status) {
  return FINAL_TRACKING_STATUSES.has(normalizeTrackingStatus(status));
}

export function normalizeFulfillment(value) {
  return value === FULFILLMENT.PICKUP ? FULFILLMENT.PICKUP : FULFILLMENT.DELIVERY;
}

export function normalizeTrackingStatus(value) {
  const raw = String(value || TRACKING_STATUS.RECEIVED).toUpperCase();
  if (Object.prototype.hasOwnProperty.call(TRACKING_STATUS, raw) || Object.values(TRACKING_STATUS).includes(raw)) {
    return raw;
  }
  return TRACKING_STATUS.RECEIVED;
}

export function buildWhatsAppUrl(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits || digits.length < 10) return null;
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountry}`;
}

export function buildTelUrl(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits || digits.length < 10) return null;
  return `tel:+${digits.length <= 11 ? `55${digits}` : digits}`;
}

export function itemCount(items = []) {
  return (items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}
