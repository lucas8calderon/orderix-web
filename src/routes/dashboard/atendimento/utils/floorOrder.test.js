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
    expect(counter.body.tableId).toBe(999);
    expect(counter.body.waiterId).toBe(999);
    expect(counter.body.comandaId).toBeUndefined();
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
});

describe('isSellableProduct', () => {
  it('esconde produto indisponível ou sem saldo', () => {
    expect(isSellableProduct({ isAvailable: true, sellable: true })).toBe(true);
    expect(isSellableProduct({ isAvailable: false, sellable: true })).toBe(false);
    expect(isSellableProduct({ isAvailable: true, sellable: false })).toBe(false);
  });
});
