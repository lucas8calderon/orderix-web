import { buildCategoryChips, filterCatalogProducts, productMatchesQuery, productNeedsCustomization } from './catalogView';

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
});
