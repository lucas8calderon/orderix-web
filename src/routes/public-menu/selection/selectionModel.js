import { chargeableUnit } from '../../dashboard/menu/utils/mandatoryChoices';

/**
 * API pura da seleção do cardápio digital.
 * Cada linha é um produto e, quando existe, a variação escolhida (tamanho).
 */

function variationKey(value) {
  return value == null || value === '' ? '' : String(value);
}

function selectionKey(selections) {
  if (!selections || typeof selections !== 'object') return '';
  return Object.keys(selections).sort().map((key) => {
    const value = selections[key];
    const ids = Array.isArray(value) ? value : (value ? [value] : []);
    return `${key}:${ids.map(String).filter(Boolean).sort().join(',')}`;
  }).filter((entry) => !entry.endsWith(':')).join('|');
}

function sameLine(item, productId, variationId, selections) {
  return String(item.productId) === String(productId)
    && variationKey(item.variationId) === variationKey(variationId)
    && selectionKey(item.selections) === selectionKey(selections);
}

function hasLine(items, productId, variationId, selections) {
  return (items || []).some((item) => sameLine(item, productId, variationId, selections));
}

export function selectProduct(items, productId, variationId = null, selections = null, quantity = 1) {
  if (productId == null || productId === '') return items;
  const qty = Math.max(1, Number(quantity) || 1);
  if (hasLine(items, productId, variationId, selections)) {
    return items.map((item) => (
      sameLine(item, productId, variationId, selections)
        ? { ...item, quantity: item.quantity + qty }
        : item
    ));
  }
  const line = {
    productId,
    variationId: variationId || null,
    quantity: qty,
  };
  if (selections && Object.keys(selections).length) {
    line.selections = selections;
  }
  return [...items, line];
}

export function removeProduct(items, productId, variationId = null, selections = null) {
  if (productId == null || productId === '') return items;
  return items.filter((item) => !sameLine(item, productId, variationId, selections));
}

export function increaseQuantity(items, productId, variationId = null, selections = null) {
  if (productId == null || productId === '') return items;
  if (!hasLine(items, productId, variationId, selections)) {
    return selectProduct(items, productId, variationId, selections);
  }
  return items.map((item) => (
    sameLine(item, productId, variationId, selections)
      ? { ...item, quantity: item.quantity + 1 }
      : item
  ));
}

export function decreaseQuantity(items, productId, variationId = null, selections = null) {
  if (productId == null || productId === '') return items;
  return items.flatMap((item) => {
    if (!sameLine(item, productId, variationId, selections)) return [item];
    if (item.quantity <= 1) return [];
    return [{ ...item, quantity: item.quantity - 1 }];
  });
}

export function clearSelection() {
  return [];
}

export function isSelected(items, productId, variationId) {
  if (productId == null || productId === '') return false;
  if (variationId === undefined) {
    return (items || []).some((item) => String(item.productId) === String(productId));
  }
  return hasLine(items, productId, variationId, undefined);
}

/** Quantidade total de itens (2 X-Bacon + 1 Coca = 3). */
export function selectedCount(items) {
  return (items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function getQuantity(items, productId, variationId = null, selections = null) {
  const found = (items || []).find((item) => sameLine(item, productId, variationId, selections));
  return found ? found.quantity : 0;
}

/** Remove produtos que sumiram do catálogo (órfãos). */
export function pruneMissingProducts(items, catalogProductIds) {
  const allowed = new Set((catalogProductIds || []).map((id) => String(id)));
  return (items || []).filter((item) => allowed.has(String(item.productId)));
}

function unitPrice(product, item) {
  if (!product) return null;
  let base = Number(product.value);
  if (item?.variationId != null && item.variationId !== '') {
    const variation = (product.variations || []).find(
      (entry) => String(entry.id) === String(item.variationId) && entry.available !== false
    );
    base = Number(variation?.price);
  }
  if (!Number.isFinite(base)) return null;
  return chargeableUnit(base, product, item?.selections);
}

/**
 * Total estimado com o preço da variação escolhida, ou o preço único.
 * Retorna null se algum item não tiver valor numérico.
 */
export function computeEstimatedTotal(items, productById) {
  if (!items?.length || !productById) return null;
  let total = 0;
  for (const item of items) {
    const product = productById.get(String(item.productId))
      ?? productById.get(item.productId);
    const unit = unitPrice(product, item);
    if (unit == null) return null;
    total += unit * item.quantity;
  }
  return total;
}

export function flattenCatalogProducts(categories = []) {
  const list = [];
  const byId = new Map();
  for (const category of categories) {
    for (const product of category.products || []) {
      if (product?.id == null) continue;
      const enriched = {
        ...product,
        categoryId: category.id,
        categoryName: category.name,
      };
      list.push(enriched);
      byId.set(String(product.id), enriched);
      byId.set(product.id, enriched);
    }
  }
  return { list, byId };
}
