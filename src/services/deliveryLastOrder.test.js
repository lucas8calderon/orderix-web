import {
  clearLastOrder,
  clearLastOrderByToken,
  readLastOrder,
  writeLastOrder,
} from './deliveryLastOrder';

describe('deliveryLastOrder', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('grava e lê por slug', () => {
    writeLastOrder('padaria', {
      token: 'tok-1',
      orderId: 42,
      createdAt: '2026-09-20T12:00:00.000Z',
    });
    expect(readLastOrder('padaria')).toEqual({
      token: 'tok-1',
      orderId: 42,
      createdAt: '2026-09-20T12:00:00.000Z',
    });
    expect(window.localStorage.getItem('weper.delivery.lastOrder.padaria')).toContain('tok-1');
    expect(readLastOrder('outra')).toBeNull();
  });

  it('ignora entrada sem token e JSON inválido', () => {
    writeLastOrder('padaria', { token: '  ' });
    expect(readLastOrder('padaria')).toBeNull();

    window.localStorage.setItem('weper.delivery.lastOrder.padaria', '{broken');
    expect(readLastOrder('padaria')).toBeNull();
  });

  it('limpa por slug e por token', () => {
    writeLastOrder('padaria', { token: 'tok-a', orderId: 1 });
    writeLastOrder('burger', { token: 'tok-b', orderId: 2 });

    clearLastOrder('padaria');
    expect(readLastOrder('padaria')).toBeNull();
    expect(readLastOrder('burger')?.token).toBe('tok-b');

    clearLastOrderByToken('tok-b');
    expect(readLastOrder('burger')).toBeNull();
  });
});
