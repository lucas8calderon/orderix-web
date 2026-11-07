import { createNewOrderTracker } from './newOrderTracker';

describe('pedidos novos ainda não vistos', () => {
  it('na primeira carga não conta eventos nem pede som', () => {
    const tracker = createNewOrderTracker();
    const primed = tracker.prime(40);
    expect(primed).toMatchObject({ primed: true, cursor: 40, count: 0, playSound: false });

    const baseline = createNewOrderTracker().applyEvents({
      cursor: 12,
      events: [
        { type: 'ORDER_CREATED', entityType: 'ORDER', entityId: 1 },
        { type: 'ORDER_CREATED', entityType: 'ORDER', entityId: 2 },
      ],
    });
    expect(baseline).toMatchObject({ primed: true, cursor: 12, count: 0, playSound: false, newestId: null });
  });

  it('um pedido criado depois da base aumenta o badge e toca uma vez', () => {
    const tracker = createNewOrderTracker();
    tracker.prime(10);
    const next = tracker.applyEvents({
      cursor: 11,
      events: [{ type: 'ORDER_CREATED', entityType: 'ORDER', entityId: 90 }],
    });
    expect(next).toMatchObject({ count: 1, playSound: true, newestId: '90' });
  });

  it('três pedidos no mesmo lote contam 3 e pedem um único som', () => {
    const tracker = createNewOrderTracker();
    tracker.prime(1);
    const next = tracker.applyEvents({
      cursor: 4,
      events: [
        { type: 'ORDER_CREATED', entityId: 1 },
        { type: 'ORDER_UPDATED', entityId: 1 },
        { type: 'ORDER_CREATED', entityId: 2 },
        { type: 'ORDER_CREATED', entityId: 2 },
        { type: 'KITCHEN_STATUS', entityId: 8 },
        { type: 'ORDER_CREATED', entityId: 3 },
      ],
    });
    expect(next).toMatchObject({ count: 3, playSound: true, newestId: '3' });
  });

  it('não conta de novo o mesmo pedido nem atualização', () => {
    const tracker = createNewOrderTracker();
    tracker.prime(1);
    tracker.applyEvents({
      cursor: 2,
      events: [{ type: 'ORDER_CREATED', entityId: 7 }],
    });
    const again = tracker.applyEvents({
      cursor: 3,
      events: [
        { type: 'ORDER_CREATED', entityId: 7 },
        { type: 'ORDER_UPDATED', entityId: 8 },
      ],
    });
    expect(again).toMatchObject({ count: 1, playSound: false, newestId: '7' });
  });

  it('o clique zera o badge e devolve o pedido mais novo', () => {
    const tracker = createNewOrderTracker();
    tracker.prime(1);
    tracker.applyEvents({
      cursor: 3,
      events: [
        { type: 'ORDER_CREATED', entityId: 4 },
        { type: 'ORDER_CREATED', entityId: 9 },
      ],
    });
    expect(tracker.acknowledge()).toMatchObject({
      count: 0,
      playSound: false,
      newestId: null,
      acknowledgedId: '9',
    });
    const repeated = tracker.applyEvents({
      cursor: 4,
      events: [{ type: 'ORDER_CREATED', entityId: 9 }],
    });
    expect(repeated).toMatchObject({ count: 0, playSound: false });
    const fresh = tracker.applyEvents({
      cursor: 5,
      events: [{ type: 'ORDER_CREATED', entityId: 10 }],
    });
    expect(fresh).toMatchObject({ count: 1, playSound: true, newestId: '10' });
  });
});
