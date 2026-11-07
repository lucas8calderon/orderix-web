const ORDER_CREATED = 'ORDER_CREATED';

function readCursor(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function createdOrderId(event) {
  if (!event || event.type !== ORDER_CREATED) return null;
  if (event.entityType && event.entityType !== 'ORDER') return null;
  if (event.entityId == null || event.entityId === '') return null;
  return String(event.entityId);
}

/**
 * Conta pedidos criados depois da base inicial.
 * A primeira carga (prime ou o primeiro lote) só avança o cursor: sem som e sem badge.
 */
export function createNewOrderTracker() {
  let primed = false;
  let cursor = 0;
  let newestId = null;
  const known = new Set();
  const unseen = new Set();

  function view(playSound) {
    return {
      primed,
      cursor,
      newestId,
      count: unseen.size,
      playSound: Boolean(playSound),
    };
  }

  return {
    prime(nextCursor) {
      primed = true;
      const parsed = readCursor(nextCursor);
      if (parsed != null) cursor = parsed;
      return view(false);
    },

    applyEvents(payload) {
      const parsed = readCursor(payload?.cursor);
      const events = Array.isArray(payload?.events) ? payload.events : [];
      if (!primed) {
        primed = true;
        if (parsed != null) cursor = parsed;
        events.forEach((event) => {
          const id = createdOrderId(event);
          if (id != null) known.add(id);
        });
        return view(false);
      }

      let added = 0;
      events.forEach((event) => {
        const id = createdOrderId(event);
        if (id == null || known.has(id)) return;
        known.add(id);
        unseen.add(id);
        newestId = id;
        added += 1;
      });
      if (parsed != null && parsed >= cursor) cursor = parsed;
      return view(added > 0);
    },

    acknowledge() {
      const acknowledgedId = newestId;
      unseen.clear();
      newestId = null;
      return { ...view(false), acknowledgedId };
    },

    snapshot() {
      return view(false);
    },
  };
}
