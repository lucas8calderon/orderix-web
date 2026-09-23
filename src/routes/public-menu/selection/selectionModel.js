/**
 * API pura da seleção do cardápio digital.
 * Sem requests — só estado local. Shape pensado para evoluir a carrinho/pedido depois
 * (productId + quantity; extras/observações podem ser adicionados sem mudar a tela).
 */

export function selectProduct(items, productId) {
  if (productId == null || productId === '') return items;
  if (isSelected(items, productId)) return items;
  return [...items, { productId, quantity: 1 }];
}

export function removeProduct(items, productId) {
  if (productId == null || productId === '') return items;
  return items.filter((item) => String(item.productId) !== String(productId));
}

export function increaseQuantity(items, productId) {
  if (productId == null || productId === '') return items;
  if (!isSelected(items, productId)) {
    return selectProduct(items, productId);
  }
  return items.map((item) => (
    String(item.productId) === String(productId)
      ? { ...item, quantity: item.quantity + 1 }
      : item
  ));
}

export function decreaseQuantity(items, productId) {
  if (productId == null || productId === '') return items;
  return items.flatMap((item) => {
    if (String(item.productId) !== String(productId)) return [item];
    if (item.quantity <= 1) return [];
    return [{ ...item, quantity: item.quantity - 1 }];
  });
}

export function clearSelection() {
  return [];
}

export function isSelected(items, productId) {
  if (productId == null || productId === '') return false;
  return items.some((item) => String(item.productId) === String(productId));
}

/** Quantidade total de itens (2 X-Bacon + 1 Coca = 3). */
export function selectedCount(items) {
  return (items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function getQuantity(items, productId) {
  const found = (items || []).find((item) => String(item.productId) === String(productId));
  return found ? found.quantity : 0;
}

/** Remove produtos que sumiram do catálogo (órfãos). */
export function pruneMissingProducts(items, catalogProductIds) {
  const allowed = new Set((catalogProductIds || []).map((id) => String(id)));
  return (items || []).filter((item) => allowed.has(String(item.productId)));
}

/**
 * Total estimado só com preço unitário simples e confiável.
 * Retorna null se algum item não tiver valor numérico (ex.: futuras variações).
 */
export function computeEstimatedTotal(items, productById) {
  if (!items?.length || !productById) return null;
  let total = 0;
  for (const item of items) {
    const product = productById.get(String(item.productId))
      ?? productById.get(item.productId);
    const unit = Number(product?.value);
    if (!product || !Number.isFinite(unit)) return null;
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
