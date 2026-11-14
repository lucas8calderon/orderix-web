import {
  formatOrderDisplayCode,
  kitchenLocationLabel,
  orderNumberLabel,
  resolveSalesChannel,
  salesChannelLabel,
  isSalesChannel,
} from './salesChannel';

describe('salesChannel', () => {
  it('prioriza salesChannel da API', () => {
    expect(resolveSalesChannel({ salesChannel: 'garcom', orderSource: 'DELIVERY' })).toBe('garcom');
  });

  it('classifica delivery, comanda, garçom, mesa, balcão e pedido por cliente', () => {
    expect(resolveSalesChannel({ orderSource: 'PICKUP' })).toBe('delivery');
    expect(resolveSalesChannel({ comandaId: 12, waiterId: 4 })).toBe('comanda');
    expect(resolveSalesChannel({ orderSource: 'WAITER', waiterId: 4, tableId: 8, fromTable: true })).toBe('garcom');
    expect(resolveSalesChannel({ orderSource: 'TABLET_SELF_SERVICE', tableId: 3, fromTable: true })).toBe('mesa');
    expect(resolveSalesChannel({ tableId: 999, waiterId: 999 })).toBe('balcao');
    expect(resolveSalesChannel({ orderSource: 'CUSTOMER_ORDER', customerName: 'Rafael', id: 42 })).toBe('pedido_cliente');
  });

  it('expõe rótulos e valida ids', () => {
    expect(salesChannelLabel('garcom')).toBe('Garçom');
    expect(salesChannelLabel('pedido_cliente')).toBe('Pedido por Cliente');
    expect(isSalesChannel('delivery')).toBe(true);
    expect(isSalesChannel('pedido_cliente')).toBe(true);
    expect(isSalesChannel('atrasados')).toBe(false);
  });

  it('formata código e local do KDS para pedido por cliente', () => {
    expect(formatOrderDisplayCode({ id: 42 })).toBe('0042');
    expect(kitchenLocationLabel({ orderSource: 'CUSTOMER_ORDER', id: 42, customerName: 'Rafael' })).toBe('#0042');
  });

  it('mostra o número diário da loja no lugar do id interno do sistema', () => {
    const lojaNova = { id: 166, displayCode: '1', tableId: 999, waiterId: 999 };
    expect(orderNumberLabel(lojaNova)).toBe('1');
    expect(formatOrderDisplayCode(lojaNova)).toBe('1');
    expect(kitchenLocationLabel(lojaNova)).toBe('Pedido 1');
    expect(kitchenLocationLabel({ ...lojaNova, orderSource: 'CUSTOMER_ORDER' })).toBe('#1');
  });

  it('pedido sem número diário continua mostrando o id', () => {
    expect(orderNumberLabel({ id: 166 })).toBe('166');
    expect(orderNumberLabel({})).toBe('');
  });
});
