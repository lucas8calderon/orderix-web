export const COUNTER_SENTINEL_ID = 999;

export function defaultCustomerName(target) {
  if (target?.kind === 'customer') return target.customerName || '';
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
  customerIdentificationNote,
  observation,
  lines,
  waiterId,
}) {
  const name = String(customerName || '').trim();
  if (!name) {
    return { error: 'Informe o nome do cliente.' };
  }
  const noteRaw = customerIdentificationNote ?? target?.customerIdentificationNote ?? '';
  const note = String(noteRaw).trim().slice(0, 120) || null;
  const customer = target?.kind === 'customer';
  const customerCreate = customer && !target?.id;
  const chosen = (lines || []).filter((line) => Number(line.quantity) > 0);
  // Shell sem itens é permitido só na criação de Pedido por Cliente (alinha com a API).
  if (chosen.length === 0 && !customerCreate) {
    return { error: 'Escolha ao menos um produto.' };
  }

  const products = [];
  for (const line of chosen) {
    const groups = line.product?.mandatoryGroups || [];
    const selections = [];
    for (const group of groups) {
      const raw = line.selections?.[group.id];
      const ids = Array.isArray(raw) ? raw.filter(Boolean) : (raw ? [raw] : []);
      const min = group.minSelections == null ? 1 : Number(group.minSelections);
      const max = group.maxSelections == null ? Math.max(min, 1) : Number(group.maxSelections);
      if (ids.length < min) {
        return { error: `Escolha ${group.name} em ${line.product?.name || 'o produto'}.` };
      }
      if (ids.length > max) {
        return { error: `Escolha no máximo ${max} em ${group.name}.` };
      }
      ids.forEach((itemId) => {
        selections.push({
          productId: line.product.id,
          mandatoryGroupId: group.id,
          selectedItemId: itemId,
        });
      });
    }
    const extras = (line.extraIds || []).map((productExtraId) => ({
      productExtraId,
      quantity: 1,
    }));
    const variations = line.product?.variations || [];
    const sellableVariations = variations.filter((variation) => variation?.available !== false);
    if (sellableVariations.length > 0 && !line.variationId) {
      return { error: `Escolha uma variação de ${line.product?.name || 'o produto'}.` };
    }
    products.push({
      id: line.product.id,
      quantity: Number(line.quantity),
      categoryId: line.product.categoryId,
      variationId: line.variationId || null,
      observation: String(line.observation || '').trim() || null,
      mandatorySelections: selections,
      extras,
    });
  }

  const counter = target?.kind === 'counter';
  const comanda = target?.kind === 'comanda';
  if (!counter && !customer && !waiterId) {
    return { error: 'Este login não lança pedido em mesa ou comanda. Entre com o usuário de caixa.' };
  }

  if (customer) {
    if (target?.id && products.length === 0) {
      return { error: 'Escolha ao menos um produto.' };
    }
    return {
      mode: target?.id ? 'customer-items' : 'customer-create',
      orderId: target?.id || null,
      body: {
        customerName: name,
        customerIdentificationNote: note,
        observation: String(observation || '').trim() || null,
        products,
      },
    };
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
  return { mode: 'floor', body, tableId: body.tableId };
}
