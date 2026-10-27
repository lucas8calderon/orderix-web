import { compareMenuOrder, groupMenuCategories } from './categoryGroups';

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

  it('respeita a ordem gravada mesmo quando o nome viria antes', () => {
    const groups = groupMenuCategories([
      { id: 1, name: 'Bebidas', parentId: null, sortOrder: 1, products: [{ id: 9 }] },
      { id: 2, name: 'Pratos', parentId: null, sortOrder: 0, products: [{ id: 8 }] },
      { id: 3, name: 'Sucos', parentId: 1, sortOrder: 1, products: [{ id: 11 }] },
      { id: 4, name: 'Refrigerantes', parentId: 1, sortOrder: 0, products: [{ id: 10 }] },
    ]);

    expect(groups.map((group) => group.name)).toEqual(['Bebidas', 'Pratos']);
    expect(groups[0].children.map((child) => child.name)).toEqual(['Refrigerantes', 'Sucos']);
    expect(compareMenuOrder({ sortOrder: 2 }, { sortOrder: 0 })).toBeGreaterThan(0);
  });
});
