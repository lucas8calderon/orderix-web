import { isSellableProduct } from '../utils/floorOrder';
import { activeVariations } from '../../menu/utils/productVariations';

export const ALL_CATEGORIES = 'all';
export const OTHER_CATEGORY = 'others';

export function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .trim();
}

export function categoryKey(product) {
  if (product?.categoryId == null || product.categoryId === '') return null;
  return String(product.categoryId);
}

function categoryOrderValue(category) {
  const raw = category?.sortOrder ?? category?.displayOrder ?? category?.position ?? category?.order;
  if (raw == null || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function categoriesInMenuOrder(categories) {
  const list = (Array.isArray(categories) ? categories : []).filter((category) => category?.id != null);
  if (!list.some((category) => categoryOrderValue(category) != null)) return list;
  return [...list].sort((left, right) => {
    const leftOrder = categoryOrderValue(left);
    const rightOrder = categoryOrderValue(right);
    if (leftOrder == null && rightOrder == null) return 0;
    if (leftOrder == null) return 1;
    if (rightOrder == null) return -1;
    return leftOrder - rightOrder;
  });
}

export function buildCategoryChips(products, categories) {
  const usedIds = new Set();
  let hasOthers = false;
  (products || []).forEach((product) => {
    const key = categoryKey(product);
    if (key == null) hasOthers = true;
    else usedIds.add(key);
  });

  const chips = [];
  const seen = new Set();
  categoriesInMenuOrder(categories).forEach((category) => {
    const id = String(category.id);
    if (!usedIds.has(id) || seen.has(id)) return;
    seen.add(id);
    chips.push({ id, name: category.name || 'Sem nome' });
  });

  const missing = [];
  (products || []).forEach((product) => {
    const id = categoryKey(product);
    if (id == null || seen.has(id)) return;
    seen.add(id);
    missing.push({ id, name: product.categoryName || 'Sem nome' });
  });
  missing.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' }));

  return { chips: [...chips, ...missing], hasOthers };
}

export function countProductsByCategory(products) {
  const counts = { [ALL_CATEGORIES]: 0, [OTHER_CATEGORY]: 0 };
  (products || []).forEach((product) => {
    counts[ALL_CATEGORIES] += 1;
    const key = categoryKey(product) ?? OTHER_CATEGORY;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

// Agrupa na ordem dos chips; produtos sem categoria vão para "Outros", no fim.
export function groupProductsByCategory(products, chips) {
  const groups = (chips || []).map((chip) => ({ id: chip.id, name: chip.name, products: [] }));
  const byId = new Map(groups.map((group) => [group.id, group]));
  const others = { id: OTHER_CATEGORY, name: 'Outros', products: [] };
  (products || []).forEach((product) => {
    const group = byId.get(categoryKey(product)) || others;
    group.products.push(product);
  });
  return [...groups, others].filter((group) => group.products.length > 0);
}

export function productCode(product) {
  return String(product?.sku || product?.code || product?.barcode || '').trim();
}

export function productMatchesQuery(product, query) {
  const term = normalizeSearch(query);
  if (!term) return true;
  const name = normalizeSearch(product?.name);
  const code = normalizeSearch(productCode(product));
  const category = normalizeSearch(product?.categoryName);
  const id = String(product?.id ?? '');
  return name.includes(term)
    || (code && code.includes(term))
    || (category && category.includes(term))
    || id === term;
}

// A busca procura em todo o cardápio: com termo digitado, a categoria escolhida não restringe.
export function filterCatalogProducts(products, { query = '', categoryFilter = ALL_CATEGORIES } = {}) {
  const searching = Boolean(normalizeSearch(query));
  return (products || []).filter((product) => {
    if (!productMatchesQuery(product, query)) return false;
    if (searching || categoryFilter === ALL_CATEGORIES) return true;
    if (categoryFilter === OTHER_CATEGORY) return categoryKey(product) == null;
    return categoryKey(product) === String(categoryFilter);
  });
}

export function productNeedsCustomization(product) {
  if (!product) return false;
  if (activeVariations(product).length > 0) return true;
  if ((product.mandatoryGroups || []).length > 0) return true;
  if ((product.extras || []).length > 0) return true;
  return false;
}

export function canAddProduct(product) {
  return isSellableProduct(product);
}
