import { elapsedLabel, isActiveCounterSale, isOpenCounterOrder } from './counterOrders';

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

  it('formata o tempo de atendimento', () => {
    const now = Date.parse('2026-10-28T15:00:00');
    expect(elapsedLabel('2026-10-28T14:40:00', now)).toBe('20 min');
    expect(elapsedLabel('', now)).toBe('');
  });
});
