/** Agrupa o cardápio em categorias principais e subcategorias. */
export function groupMenuCategories(categories = []) {
  const list = categories || [];
  const ids = new Set(list.map((category) => category?.id));
  const childrenOf = (parentId) => list.filter(
    (category) => category?.parentId != null && String(category.parentId) === String(parentId)
  );

  return list
    .filter((category) => category?.parentId == null || !ids.has(category.parentId))
    .map((category) => ({
      ...category,
      children: childrenOf(category.id)
        .filter((child) => (child.products || []).length > 0)
        .sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), 'pt-BR')),
    }))
    .filter((category) => (category.products || []).length > 0 || category.children.length > 0);
}
