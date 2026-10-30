import {
  buildCategoryChips,
  countProductsByCategory,
  filterCatalogProducts,
  markUnavailableCategoryProducts,
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

  it('conta produtos por categoria e escolhe a imagem do card', () => {
    const avulso = { id: 7, name: 'Avulso', value: 1, image: 'avulso.png' };
    expect(countProductsByCategory([batata, avulso, cafe])).toEqual({ all: 3, others: 1, 1: 1, 10: 1 });
    const result = buildCategoryChips(
      [{ ...batata, image: 'batata.png' }, avulso, cafe],
      [{ id: 10, name: 'Porções' }, { id: 1, name: 'Bebidas', image: 'bebidas.png' }],
    );
    expect(result.chips.map((chip) => [chip.name, chip.image])).toEqual([['Porções', 'batata.png'], ['Bebidas', 'bebidas.png']]);
    expect(result.othersImage).toBe('avulso.png');
  });

  it('mantém a categoria inativa visível e tira os produtos dela da venda', () => {
    const caldo = { id: 3, name: 'Sopa', value: 12, categoryId: 7, categoryName: 'Caldos', sellable: true };
    const chips = buildCategoryChips([caldo, cafe], [
      { id: 7, name: 'Caldos', active: false, sortOrder: 0 },
      { id: 8, name: 'Cremes', parentId: 7, active: true, sortOrder: 1 },
      { id: 1, name: 'Bebidas', active: true, sortOrder: 2 },
    ]);
    expect(chips.chips.map((chip) => [chip.name, chip.available])).toEqual([
      ['Caldos', false],
      ['Bebidas', true],
    ]);

    const creme = { id: 11, name: 'Creme', value: 9, categoryId: 8, sellable: true };
    const marked = markUnavailableCategoryProducts([caldo, creme, cafe], [
      { id: 7, name: 'Caldos', active: false },
      { id: 8, name: 'Cremes', parentId: 7, active: true },
      { id: 1, name: 'Bebidas', active: true },
    ]);
    expect(marked.find((item) => item.id === 3).sellable).toBe(false);
    expect(marked.find((item) => item.id === 11).sellable).toBe(false);
    expect(marked.find((item) => item.id === 4)).toEqual(cafe);
    expect(buildCategoryChips([creme], [
      { id: 7, name: 'Caldos', active: false },
      { id: 8, name: 'Cremes', parentId: 7, active: true },
    ]).chips).toEqual([
      expect.objectContaining({ name: 'Cremes', available: false }),
    ]);
  });
});
