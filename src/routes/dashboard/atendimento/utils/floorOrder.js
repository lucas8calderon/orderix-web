export const COUNTER_SENTINEL_ID = 999;

export function defaultCustomerName(target) {
  if (target?.kind === 'counter') return 'Balcão';
  if (target?.kind === 'comanda') return `Comanda ${target.number ?? ''}`.trim();
  return `Mesa ${target?.number ?? ''}`.trim();
}

export function isSellableProduct(product) {
  if (!product || product.isAvailable === false) return false;
  if (product.sellable === false) return false;
  return true;
}

export function buildFloorOrderBody({
  target,
  customerName,
  observation,
  lines,
  waiterId,
}) {
  const name = String(customerName || '').trim();
  if (!name) {
    return { error: 'Informe o nome do cliente.' };
  }
  const chosen = (lines || []).filter((line) => Number(line.quantity) > 0);
  if (chosen.length === 0) {
    return { error: 'Escolha ao menos um produto.' };
  }

  const products = [];
  for (const line of chosen) {
    const groups = line.product?.mandatoryGroups || [];
    const selections = [];
    for (const group of groups) {
      const itemId = line.selections?.[group.id];
      if (!itemId) {
        return { error: `Escolha ${group.name} em ${line.product?.name || 'o produto'}.` };
      }
      selections.push({
        productId: line.product.id,
        mandatoryGroupId: group.id,
        selectedItemId: itemId,
      });
    }
    const extras = (line.extraIds || []).map((productExtraId) => ({
      productExtraId,
      quantity: 1,
    }));
    products.push({
      id: line.product.id,
      quantity: Number(line.quantity),
      categoryId: line.product.categoryId,
      mandatorySelections: selections,
      extras,
    });
  }

  const counter = target?.kind === 'counter';
  const comanda = target?.kind === 'comanda';
  if (!counter && !waiterId) {
    return { error: 'Este login não lança pedido em mesa ou comanda. Entre com o usuário de caixa.' };
  }

  const body = {
    tableId: counter || comanda ? COUNTER_SENTINEL_ID : target.id,
    waiterId: counter ? COUNTER_SENTINEL_ID : waiterId,
    customerName: name,
    observation: String(observation || '').trim() || null,
    products,
  };
  if (comanda) {
    body.comandaId = target.id;
  }
  return { body, tableId: body.tableId };
}
