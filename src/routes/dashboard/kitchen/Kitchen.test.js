jest.mock('../atendimento/utils/accountTotals', () => ({
  resolveMandatorySelections: () => [],
}));

import { mapKitchenOrder } from './kitchenOrderMap';
import { SALES_CHANNEL_FILTERS } from '../../../services/salesChannel';

describe('Kitchen channel filters', () => {
  it('expõe todos os canais de venda nos filtros', () => {
    const ids = SALES_CHANNEL_FILTERS.map((item) => item.id);
    expect(ids).toEqual(['todos', 'garcom', 'delivery', 'mesa', 'comanda', 'balcao', 'pedido_cliente']);
  });

  it('mapeia pedido por cliente com código e identificação', () => {
    const mapped = mapKitchenOrder({
      id: 42,
      orderSource: 'CUSTOMER_ORDER',
      customerName: 'Rafael',
      customerIdentificationNote: 'Camiseta vermelha',
      kitchenStatus: 'IN_PREPARATION',
      products: [{ id: 1, name: 'Café', quantity: 1 }],
    });
    expect(mapped.orderType).toBe('pedido_cliente');
    expect(mapped.orderNumber).toBe('#0042');
    expect(mapped.locationLabel).toBe('#0042');
    expect(mapped.notes).toContain('ID: Camiseta vermelha');
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
});
