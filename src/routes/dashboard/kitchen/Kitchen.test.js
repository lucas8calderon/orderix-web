jest.mock('../atendimento/utils/accountTotals', () => ({
  resolveMandatorySelections: () => [],
}));

import { canRefundOnlinePayment, mapKitchenOrder } from './kitchenOrderMap';
import { SALES_CHANNEL_FILTERS } from '../../../services/salesChannel';

describe('Kitchen channel filters', () => {
  it('expõe todos os canais de venda nos filtros', () => {
    const ids = SALES_CHANNEL_FILTERS.map((item) => item.id);
    expect(ids).toEqual(['todos', 'garcom', 'delivery', 'mesa', 'comanda', 'balcao']);
  });

  it('classifica pedido de garçom mesmo com mesa', () => {
    const mapped = mapKitchenOrder({
      id: 1,
      orderSource: 'WAITER',
      waiterId: 4,
      waiterName: 'Ana',
      tableId: 8,
      fromTable: true,
      kitchenStatus: 'NEW',
      products: [],
    });
    expect(mapped.orderType).toBe('garcom');
  });

  it('prioriza salesChannel da API e classifica delivery', () => {
    expect(mapKitchenOrder({
      id: 2,
      salesChannel: 'comanda',
      orderSource: 'DELIVERY',
      kitchenStatus: 'NEW',
      products: [],
    }).orderType).toBe('comanda');

    expect(mapKitchenOrder({
      id: 3,
      orderSource: 'PICKUP',
      kitchenStatus: 'NEW',
      products: [],
    }).orderType).toBe('delivery');
  });

  it('mostra estorno para Pix e cartão do delivery mesmo sem a marca online', () => {
    const pix = mapKitchenOrder({
      id: 28,
      orderSource: 'PICKUP',
      paymentMethod: 'PIX',
      kitchenStatus: 'NEW',
      products: [],
    });
    expect(canRefundOnlinePayment(pix)).toBe(true);
    expect(canRefundOnlinePayment(mapKitchenOrder({
      id: 26,
      orderSource: 'DELIVERY',
      paymentMethod: 'CREDIT',
      onlinePayment: true,
      kitchenStatus: 'NEW',
      products: [],
    }))).toBe(true);
    expect(canRefundOnlinePayment(mapKitchenOrder({
      id: 4,
      orderSource: 'WAITER',
      paymentMethod: 'CASH',
      kitchenStatus: 'NEW',
      products: [],
    }))).toBe(false);
  });
});
