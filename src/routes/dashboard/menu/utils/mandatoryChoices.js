/** Escolhas do cliente: quantidade mínima/máxima e preço somado ou pelo maior valor. */

export function groupLimits(group) {
  const min = Number.isFinite(Number(group?.minSelections)) ? Number(group.minSelections) : 1;
  const maxRaw = Number.isFinite(Number(group?.maxSelections)) ? Number(group.maxSelections) : Math.max(min, 1);
  return { min: Math.max(0, min), max: Math.max(maxRaw, Math.max(min, 1)) };
}

export function priceMode(group) {
  return String(group?.priceMode || '').toUpperCase() === 'HIGHEST' ? 'HIGHEST' : 'SUM';
}

export function selectedIds(selections, groupId) {
  const value = selections?.[groupId];
  if (Array.isArray(value)) return value.filter((id) => id != null && id !== '');
  if (value == null || value === '') return [];
  return [value];
}

export function choiceHint(group) {
  const { min, max } = groupLimits(group);
  if (min <= 0) return `Escolha até ${max} ${max === 1 ? 'opção' : 'opções'}`;
  if (min === max) return min === 1 ? 'Escolha 1 opção' : `Escolha ${min} opções`;
  return `Escolha de ${min} a ${max} opções`;
}

export function groupSatisfied(group, selections) {
  const { min, max } = groupLimits(group);
  const count = selectedIds(selections, group?.id).length;
  return count >= min && count <= max;
}

export function mandatoryReady(product, selections) {
  return (product?.mandatoryGroups || []).every((group) => groupSatisfied(group, selections));
}

export function toggleChoice(group, selections, itemId) {
  const current = selectedIds(selections, group?.id).map(String);
  const id = String(itemId);
  const { max } = groupLimits(group);
  if (current.includes(id)) {
    return current.filter((entry) => entry !== id);
  }
  if (max === 1) return [id];
  if (current.length >= max) return current;
  return [...current, id];
}

export function highestPrices(product) {
  return (product?.mandatoryGroups || [])
    .filter((group) => priceMode(group) === 'HIGHEST')
    .flatMap((group) => group.items || [])
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);
}

export function fromPrice(product) {
  const prices = highestPrices(product);
  if (!prices.length) return Number(product?.value);
  return Math.min(...prices);
}

/**
 * Acréscimo sobre o preço base. No modo maior valor, troca o base pelo maior escolhido.
 */
export function selectionAdjustment(unitPrice, groups, selections) {
  const base = Number(unitPrice);
  const safeBase = Number.isFinite(base) ? base : 0;
  let highest = null;
  let sum = 0;
  (groups || []).forEach((group) => {
    const chosen = selectedIds(selections, group.id)
      .map((id) => (group.items || []).find((item) => String(item.id) === String(id)))
      .filter(Boolean);
    if (!chosen.length) return;
    if (priceMode(group) === 'HIGHEST') {
      const max = Math.max(...chosen.map((item) => Number(item.price) || 0));
      highest = highest == null ? max : Math.max(highest, max);
    } else {
      sum += chosen.reduce((total, item) => total + (Number(item.price) || 0), 0);
    }
  });
  if (highest == null) return sum;
  return (highest - safeBase) + sum;
}

export function chargeableUnit(base, product, selections) {
  const unit = Number(base);
  if (!Number.isFinite(unit)) return null;
  return unit + selectionAdjustment(unit, product?.mandatoryGroups, selections);
}

export function selectionRecords(product, selections) {
  const records = [];
  (product?.mandatoryGroups || []).forEach((group) => {
    selectedIds(selections, group.id).forEach((id) => {
      const item = (group.items || []).find((entry) => String(entry.id) === String(id));
      if (!item) return;
      records.push({
        productId: product.id,
        mandatoryGroupId: group.id,
        selectedItemId: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        priceMode: priceMode(group),
      });
    });
  });
  return records;
}
