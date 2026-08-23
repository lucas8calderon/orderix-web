export function normalizeCategory(category) {
  if (!category) return category;
  const parentId = category.parentId ?? category.parent_id ?? category.parent?.id ?? null;
  return {
    ...category,
    parentId: parentId == null || parentId === '' ? null : parentId,
  };
}

export function isRootCategory(category) {
  return category?.parentId == null;
}

export function buildCategoryTree(categories = []) {
  const list = (Array.isArray(categories) ? categories : []).map(normalizeCategory);
  const childrenByParent = new Map();

  list.forEach((category) => {
    if (category?.parentId == null) return;
    const key = String(category.parentId);
    const bucket = childrenByParent.get(key) || [];
    bucket.push(category);
    childrenByParent.set(key, bucket);
  });

  return list.filter(isRootCategory).map((root) => ({
    ...root,
    children: childrenByParent.get(String(root.id)) || [],
  }));
}

export function getRootCategories(categories = []) {
  return (Array.isArray(categories) ? categories : [])
    .map(normalizeCategory)
    .filter(isRootCategory);
}

export function categoryPathLabel(category, categories = []) {
  if (!category) return '—';
  if (category.parentId == null) return category.name || '—';
  const parent = categories.find((item) => String(item.id) === String(category.parentId));
  if (!parent?.name) return category.name || '—';
  return `${parent.name} › ${category.name}`;
}

export function collectCategoryAndDescendantIds(categoryId, categories = []) {
  const ids = new Set([String(categoryId)]);
  (Array.isArray(categories) ? categories : []).forEach((category) => {
    if (String(category.parentId) === String(categoryId)) {
      ids.add(String(category.id));
    }
  });
  return ids;
}

export function productCountForCategory(category, productCounts = {}, categories = []) {
  const hasLiveCounts = Boolean(productCounts && Object.keys(productCounts).length > 0);
  if (!hasLiveCounts) {
    return Number(category.productCount) || 0;
  }
  if (!isRootCategory(category)) {
    return Number(productCounts[String(category.id)]) || 0;
  }
  const ownOnly = Number(productCounts[String(category.id)]) || 0;
  const childSum = (Array.isArray(categories) ? categories : [])
    .filter((item) => String(item.parentId) === String(category.id))
    .reduce((sum, item) => sum + (Number(productCounts[String(item.id)]) || 0), 0);
  return ownOnly + childSum;
}
