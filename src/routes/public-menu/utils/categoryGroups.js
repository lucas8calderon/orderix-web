function menuRank(category) {
  const value = Number(category?.sortOrder);
  return Number.isFinite(value) ? value : null;
}

/** Mantém a ordem gravada pela loja. Sem posição, conserva a ordem recebida. */
export function compareMenuOrder(left, right) {
  const leftRank = menuRank(left);
  const rightRank = menuRank(right);
  if (leftRank == null && rightRank == null) return 0;
  if (leftRank == null) return 1;
  if (rightRank == null) return -1;
  return leftRank - rightRank;
}

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
        .sort(compareMenuOrder),
    }))
    .filter((category) => (category.products || []).length > 0 || category.children.length > 0);
}
