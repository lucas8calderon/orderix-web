import {
  SELECTION_TTL_MS,
  selectionStorageKey,
} from './selectionConstants';
import {
  clearSelection,
  computeEstimatedTotal,
  decreaseQuantity,
  increaseQuantity,
  isSelected,
  pruneMissingProducts,
  removeProduct,
  selectProduct,
  selectedCount,
} from './selectionModel';
import {
  clearSelectionStorage,
  readSelection,
  writeSelection,
} from './selectionStorage';

describe('selectionStorageKey', () => {
  it('usa chave por storeId, nunca global', () => {
    expect(selectionStorageKey('loja-a')).toBe('weper:digital-menu:loja-a:selection');
    expect(selectionStorageKey('loja-b')).toBe('weper:digital-menu:loja-b:selection');
    expect(selectionStorageKey('loja-a')).not.toBe(selectionStorageKey('loja-b'));
  });
});

describe('selectionModel', () => {
  it('seleciona, altera quantidade e remove', () => {
    let items = [];
    items = selectProduct(items, 10);
    expect(isSelected(items, 10)).toBe(true);
    expect(selectedCount(items)).toBe(1);

    items = increaseQuantity(items, 10);
    items = increaseQuantity(items, 10);
    expect(selectedCount(items)).toBe(3);

    items = decreaseQuantity(items, 10);
    expect(selectedCount(items)).toBe(2);

    items = decreaseQuantity(items, 10);
    items = decreaseQuantity(items, 10);
    expect(isSelected(items, 10)).toBe(false);
    expect(selectedCount(items)).toBe(0);

    items = selectProduct(items, 10);
    items = removeProduct(items, 10);
    expect(items).toEqual([]);
  });

  it('conta total de itens, não só produtos distintos', () => {
    let items = selectProduct([], 1);
    items = increaseQuantity(items, 1);
    items = selectProduct(items, 2);
    // 2 X-Bacon + 1 Coca = 3
    expect(selectedCount(items)).toBe(3);
  });

  it('clearSelection esvazia a lista', () => {
    expect(clearSelection()).toEqual([]);
  });

  it('remove produtos que sumiram do catálogo', () => {
    const items = [
      { productId: 1, quantity: 2 },
      { productId: 99, quantity: 1 },
    ];
    expect(pruneMissingProducts(items, [1, 2])).toEqual([{ productId: 1, quantity: 2 }]);
  });

  it('calcula valor estimado só com preço simples confiável', () => {
    const byId = new Map([
      ['1', { id: 1, value: 10 }],
      ['2', { id: 2, value: 5 }],
    ]);
    expect(computeEstimatedTotal(
      [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }],
      byId
    )).toBe(25);

    const incomplete = new Map([['1', { id: 1, value: 10 }]]);
    expect(computeEstimatedTotal(
      [{ productId: 1, quantity: 1 }, { productId: 9, quantity: 1 }],
      incomplete
    )).toBeNull();
  });
});

describe('selectionStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-23T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    window.localStorage.clear();
  });

  it('persiste por storeId e isola lojas', () => {
    writeSelection('store-a', [{ productId: 1, quantity: 2 }]);
    writeSelection('store-b', [{ productId: 7, quantity: 1 }]);

    expect(readSelection('store-a').items).toEqual([{ productId: 1, quantity: 2 }]);
    expect(readSelection('store-b').items).toEqual([{ productId: 7, quantity: 1 }]);
    expect(window.localStorage.getItem('selectedProducts')).toBeNull();
  });

  it('expira após 12 horas', () => {
    writeSelection('padaria', [{ productId: 3, quantity: 1 }]);
    expect(readSelection('padaria').items).toHaveLength(1);

    jest.setSystemTime(new Date(Date.now() + SELECTION_TTL_MS + 1));
    expect(readSelection('padaria').items).toEqual([]);
    expect(window.localStorage.getItem(selectionStorageKey('padaria'))).toBeNull();
  });

  it('clearSelectionStorage remove a chave', () => {
    writeSelection('padaria', [{ productId: 3, quantity: 1 }]);
    clearSelectionStorage('padaria');
    expect(readSelection('padaria').items).toEqual([]);
  });
});
