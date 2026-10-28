import { buildFloorOrderBody, isSellableProduct } from './floorOrder';

const cafe = { id: 4, name: 'Café', categoryId: 1, value: 5, mandatoryGroups: [], extras: [] };

describe('buildFloorOrderBody', () => {
  it('manda o pedido da mesa com o garçom do caixa', () => {
    const result = buildFloorOrderBody({
      target: { kind: 'table', id: 8, number: 3 },
      customerName: 'Mesa 3',
      observation: 'sem açúcar',
      waiterId: 7,
      lines: [{ product: cafe, quantity: 2, selections: {}, extraIds: [] }],
    });

    expect(result.tableId).toBe(8);
    expect(result.body).toEqual(expect.objectContaining({
      tableId: 8,
      waiterId: 7,
      customerName: 'Mesa 3',
      observation: 'sem açúcar',
    }));
    expect(result.body.products[0]).toEqual(expect.objectContaining({ id: 4, quantity: 2 }));
    expect(result.body.comandaId).toBeUndefined();
  });

  it('manda a comanda no canal 999 e o balcão sem garçom real', () => {
    const comanda = buildFloorOrderBody({
      target: { kind: 'comanda', id: 12, number: 2 },
      customerName: 'Comanda 2',
      waiterId: 7,
      lines: [{ product: cafe, quantity: 1, selections: {}, extraIds: [9] }],
    });
    expect(comanda.body).toEqual(expect.objectContaining({
      tableId: 999,
      waiterId: 7,
      comandaId: 12,
    }));
    expect(comanda.body.products[0].extras).toEqual([{ productExtraId: 9, quantity: 1 }]);

    const counter = buildFloorOrderBody({
      target: { kind: 'counter' },
      customerName: 'Balcão',
      waiterId: null,
      lines: [{ product: cafe, quantity: 1, selections: {}, extraIds: [] }],
    });
    expect(counter.mode).toBe('floor');
    expect(counter.body.tableId).toBe(999);
    expect(counter.body.waiterId).toBe(999);
    expect(counter.body.comandaId).toBeUndefined();

    const customer = buildFloorOrderBody({
      target: { kind: 'customer' },
      customerName: 'Rafael',
      customerIdentificationNote: 'Camiseta vermelha',
      waiterId: null,
      lines: [{ product: cafe, quantity: 2, selections: {}, extraIds: [] }],
    });
    expect(customer.mode).toBe('customer-create');
    expect(customer.body.customerName).toBe('Rafael');
    expect(customer.body.customerIdentificationNote).toBe('Camiseta vermelha');
    expect(customer.body.products).toHaveLength(1);

    const shell = buildFloorOrderBody({
      target: { kind: 'customer' },
      customerName: 'Rafael',
      customerIdentificationNote: 'Óculos',
      waiterId: null,
      lines: [],
    });
    expect(shell.mode).toBe('customer-create');
    expect(shell.body.products).toHaveLength(0);
    expect(shell.body.customerIdentificationNote).toBe('Óculos');

    const addItems = buildFloorOrderBody({
      target: { kind: 'customer', id: 42 },
      customerName: 'Rafael',
      waiterId: null,
      lines: [],
    });
    expect(addItems.error).toMatch(/produto/);
  });

  it('exige a escolha obrigatória', () => {
    const sized = {
      ...cafe,
      mandatoryGroups: [{ id: 3, name: 'Tamanho', items: [{ id: 11, name: 'Médio' }] }],
    };
    const missing = buildFloorOrderBody({
      target: { kind: 'table', id: 8, number: 3 },
      customerName: 'Mesa 3',
      waiterId: 7,
      lines: [{ product: sized, quantity: 1, selections: {}, extraIds: [] }],
    });
    expect(missing.error).toMatch(/Tamanho/);

    const chosen = buildFloorOrderBody({
      target: { kind: 'table', id: 8, number: 3 },
      customerName: 'Mesa 3',
      waiterId: 7,
      lines: [{ product: sized, quantity: 1, selections: { 3: 11 }, extraIds: [] }],
    });
    expect(chosen.body.products[0].mandatorySelections).toEqual([{
      productId: 4,
      mandatoryGroupId: 3,
      selectedItemId: 11,
    }]);
  });

  it('cobra o preço da variação escolhida', () => {
    const marmita = {
      id: 9,
      name: 'Strogonoff de Frango',
      categoryId: 2,
      value: 14,
      variations: [
        { id: 1, name: 'Pequeno', price: 14, available: true },
        { id: 2, name: 'Grande', price: 22, available: true },
      ],
      mandatoryGroups: [],
      extras: [],
    };
    const missing = buildFloorOrderBody({
      target: { kind: 'counter' },
      customerName: 'Balcão',
      waiterId: null,
      lines: [{ product: marmita, quantity: 1, selections: {}, extraIds: [] }],
    });
    expect(missing.error).toMatch(/Strogonoff/);

    const chosen = buildFloorOrderBody({
      target: { kind: 'counter' },
      customerName: 'Balcão',
      waiterId: null,
      lines: [{ product: marmita, quantity: 1, variationId: 2, selections: {}, extraIds: [] }],
    });
    expect(chosen.body.products[0]).toEqual(expect.objectContaining({
      id: 9,
      quantity: 1,
      variationId: 2,
      observation: null,
    }));

    const noted = buildFloorOrderBody({
      target: { kind: 'counter' },
      customerName: 'Balcão',
      waiterId: null,
      lines: [{
        product: marmita,
        quantity: 1,
        variationId: 2,
        selections: {},
        extraIds: [],
        observation: ' sem molho ',
      }],
    });
    expect(noted.body.products[0].observation).toBe('sem molho');
  });
});

describe('isSellableProduct', () => {
  it('esconde produto indisponível ou sem saldo', () => {
    expect(isSellableProduct({ isAvailable: true, sellable: true })).toBe(true);
    expect(isSellableProduct({ isAvailable: false, sellable: true })).toBe(false);
    expect(isSellableProduct({ isAvailable: true, sellable: false })).toBe(false);
  });
});
