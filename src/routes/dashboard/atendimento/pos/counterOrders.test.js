import {
  counterPaymentLabel,
  elapsedLabel,
  isActiveCounterSale,
  isCounterOrderPaid,
  isOpenCounterOrder,
  sortCounterOrdersNewestFirst,
} from './counterOrders';

describe('pedidos de balcão', () => {
  it('tira cancelado e finalizado da venda ativa', () => {
    expect(isActiveCounterSale({ status: 'ACTIVE' })).toBe(true);
    expect(isActiveCounterSale({ status: 'HELD' })).toBe(true);
    expect(isActiveCounterSale({ status: 'CANCELLED' })).toBe(false);
    expect(isActiveCounterSale({ status: 'CLOSED' })).toBe(false);
    expect(isOpenCounterOrder({ status: 'CLOSED' })).toBe(false);
    expect(isOpenCounterOrder({
      status: 'CANCELLED',
      cancelledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    })).toBe(true);
    expect(isOpenCounterOrder({
      status: 'CANCELLED',
      cancelledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    })).toBe(false);
  });

  it('só considera pago quando o backend devolve status quitado', () => {
    expect(isCounterOrderPaid({ paymentStatus: 'APPROVED' })).toBe(true);
    expect(isCounterOrderPaid({ paymentStatus: 'PAID' })).toBe(true);
    expect(isCounterOrderPaid({ paymentStatus: 'PAID_EXTERNALLY' })).toBe(true);
    expect(isCounterOrderPaid({ paymentStatus: 'PENDING' })).toBe(false);
    expect(isCounterOrderPaid({ paymentStatus: 'FAILED' })).toBe(false);
    expect(isCounterOrderPaid({ paymentStatus: 'PENDING_CONFIRMATION' })).toBe(false);
    expect(isCounterOrderPaid({})).toBe(false);
    expect(counterPaymentLabel({ paymentStatus: 'PAID' }).label).toBe('Pago');
    expect(counterPaymentLabel({ status: 'ACTIVE' }).label).toBe('Não pago');
  });

  it('ordena do pedido mais novo para o mais velho', () => {
    const sorted = sortCounterOrdersNewestFirst([
      { id: 139, createdAt: '2026-11-07T10:00:00' },
      { id: 140, createdAt: '2026-11-07T13:27:00' },
      { id: 138, createdAt: '2026-11-07T13:27:00' },
      { id: 200 },
    ]);
    expect(sorted.map((order) => order.id)).toEqual([140, 138, 139, 200]);
  });

  it('formata o tempo de atendimento', () => {
    const now = Date.parse('2026-10-28T15:00:00');
    expect(elapsedLabel('2026-10-28T14:40:00', now)).toBe('20 min');
    expect(elapsedLabel('', now)).toBe('');
  });
});
