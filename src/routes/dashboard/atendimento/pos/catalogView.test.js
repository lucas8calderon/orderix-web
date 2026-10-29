import {
  buildCategoryChips,
  countProductsByCategory,
  filterCatalogProducts,
  groupProductsByCategory,
  productMatchesQuery,
  productNeedsCustomization,
} from './catalogView';

const cafe = { id: 4, name: 'Café', sku: 'CAF-1', value: 5, categoryId: 1, categoryName: 'Bebidas' };
const batata = { id: 1, name: 'Barca de Batata', value: 50, categoryId: 10, categoryName: 'Porções' };

describe('catálogo do PDV', () => {
  it('ordena as categorias do cardápio e encontra produto pelo SKU', () => {
    const chips = buildCategoryChips([batata, cafe], [
      { id: 10, name: 'Porções', sortOrder: 2 },
      { id: 20, name: 'Doces', sortOrder: 0 },
      { id: 1, name: 'Bebidas', sortOrder: 1 },
    ]);
    expect(chips.chips.map((chip) => chip.name)).toEqual(['Bebidas', 'Porções']);
    expect(productMatchesQuery(cafe, 'caf-1')).toBe(true);
    expect(filterCatalogProducts([cafe, batata], { query: 'porc' }).map((item) => item.id)).toEqual([1]);
  });

  it('pede personalização só quando há variação, grupo ou adicional', () => {
    expect(productNeedsCustomization({ extras: [], mandatoryGroups: [], variations: [] })).toBe(false);
    expect(productNeedsCustomization({ extras: [{ productExtraId: 1 }], mandatoryGroups: [], variations: [] })).toBe(true);
    expect(productNeedsCustomization({
      extras: [],
      mandatoryGroups: [],
      variations: [{ id: 2, name: 'Grande', price: 12, available: false }],
    })).toBe(false);
  });

  it('busca em todas as categorias mesmo com uma categoria escolhida', () => {
    expect(filterCatalogProducts([cafe, batata], { categoryFilter: '10' }).map((item) => item.id)).toEqual([1]);
    expect(filterCatalogProducts([cafe, batata], { query: 'cafe', categoryFilter: '10' }).map((item) => item.id)).toEqual([4]);
  });

  it('agrupa e conta produtos na ordem das categorias', () => {
    const avulso = { id: 7, name: 'Avulso', value: 1 };
    const chips = [{ id: '1', name: 'Bebidas' }, { id: '10', name: 'Porções' }];
    expect(groupProductsByCategory([batata, avulso, cafe], chips).map((group) => [group.name, group.products.length]))
      .toEqual([['Bebidas', 1], ['Porções', 1], ['Outros', 1]]);
    expect(countProductsByCategory([batata, avulso, cafe])).toEqual({ all: 3, others: 1, 1: 1, 10: 1 });
  });
});
