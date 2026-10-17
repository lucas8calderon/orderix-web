import { groupMenuCategories } from './categoryGroups';

describe('groupMenuCategories', () => {
  it('coloca subcategorias dentro da categoria principal', () => {
    const groups = groupMenuCategories([
      { id: 1, name: 'Bebidas', parentId: null, products: [] },
      { id: 2, name: 'Refrigerantes', parentId: 1, products: [{ id: 10 }] },
      { id: 3, name: 'Sucos', parentId: 1, products: [{ id: 11 }] },
      { id: 4, name: 'Esfihas salgadas', parentId: null, products: [{ id: 12 }] },
    ]);

    expect(groups.map((group) => group.name)).toEqual(['Bebidas', 'Esfihas salgadas']);
    expect(groups[0].children.map((child) => child.name)).toEqual(['Refrigerantes', 'Sucos']);
  });
});
