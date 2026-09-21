import { resolveSalesChannel, salesChannelLabel, isSalesChannel } from './salesChannel';

describe('salesChannel', () => {
  it('prioriza salesChannel da API', () => {
    expect(resolveSalesChannel({ salesChannel: 'garcom', orderSource: 'DELIVERY' })).toBe('garcom');
  });

  it('classifica delivery, comanda, garçom, mesa e balcão', () => {
    expect(resolveSalesChannel({ orderSource: 'PICKUP' })).toBe('delivery');
    expect(resolveSalesChannel({ comandaId: 12, waiterId: 4 })).toBe('comanda');
    expect(resolveSalesChannel({ orderSource: 'WAITER', waiterId: 4, tableId: 8, fromTable: true })).toBe('garcom');
    expect(resolveSalesChannel({ orderSource: 'TABLET_SELF_SERVICE', tableId: 3, fromTable: true })).toBe('mesa');
    expect(resolveSalesChannel({ tableId: 999, waiterId: 999 })).toBe('balcao');
  });

  it('expõe rótulos e valida ids', () => {
    expect(salesChannelLabel('garcom')).toBe('Garçom');
    expect(isSalesChannel('delivery')).toBe(true);
    expect(isSalesChannel('atrasados')).toBe(false);
  });
});
