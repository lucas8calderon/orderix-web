import { selectionAdjustment, selectionRecords } from '../../menu/utils/mandatoryChoices';
import { activeVariations, variationUnitPrice } from '../../menu/utils/productVariations';

export function newLineKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function lineSignature(line) {
  const selections = Object.keys(line?.selections || {}).sort().map((groupId) => {
    const raw = line.selections[groupId];
    const ids = (Array.isArray(raw) ? raw : [raw]).filter((id) => id != null && id !== '').map(String).sort();
    return `${groupId}:${ids.join(',')}`;
  }).join('|');
  const extras = [...(line?.extraIds || [])].map(String).sort().join(',');
  return [
    line?.product?.id ?? '',
    line?.variationId || '',
    selections,
    extras,
    String(line?.observation || '').trim(),
  ].join('::');
}

function normalizeLine(line) {
  return {
    key: line?.key || newLineKey(),
    product: line.product,
    quantity: Math.max(1, Number(line?.quantity) || 1),
    variationId: line?.variationId || null,
    selections: line?.selections || {},
    extraIds: [...(line?.extraIds || [])],
    observation: String(line?.observation || ''),
  };
}

export function addLine(lines, line) {
  const next = normalizeLine(line);
  const signature = lineSignature(next);
  const existing = (lines || []).find((item) => lineSignature(item) === signature);
  if (!existing) return [...(lines || []), next];
  return lines.map((item) => (
    item.key === existing.key
      ? { ...item, quantity: item.quantity + next.quantity }
      : item
  ));
}

export function replaceLine(lines, key, line) {
  return addLine((lines || []).filter((item) => item.key !== key), { ...line, key });
}

export function updateLine(lines, key, patch) {
  return (lines || []).map((item) => (item.key === key ? { ...item, ...patch } : item));
}

export function changeLineQuantity(lines, key, delta) {
  return (lines || []).flatMap((item) => {
    if (item.key !== key) return [item];
    const quantity = Number(item.quantity) + delta;
    if (quantity <= 0) return [];
    return [{ ...item, quantity }];
  });
}

export function removeLine(lines, key) {
  return (lines || []).filter((item) => item.key !== key);
}

export function lineUnitPrice(line) {
  const base = variationUnitPrice(line?.product, line?.variationId);
  const adjustment = selectionAdjustment(base, line?.product?.mandatoryGroups, line?.selections);
  const extras = (line?.extraIds || []).reduce((sum, id) => {
    const extra = (line?.product?.extras || []).find(
      (item) => String(item.productExtraId) === String(id),
    );
    return sum + (Number(extra?.price) || 0);
  }, 0);
  return base + adjustment + extras;
}

export function lineTotal(line) {
  const quantity = Number(line?.quantity) > 0 ? Number(line.quantity) : 0;
  return lineUnitPrice(line) * quantity;
}

export function cartTotals(lines) {
  const itemCount = (lines || []).reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  const subtotal = (lines || []).reduce((sum, line) => sum + lineTotal(line), 0);
  return { itemCount, subtotal, total: subtotal };
}

export function lineDetails(line) {
  const parts = [];
  const variation = activeVariations(line?.product).find(
    (item) => String(item.id) === String(line?.variationId),
  );
  if (variation?.name) parts.push(variation.name);
  selectionRecords(line?.product, line?.selections).forEach((record) => {
    if (record.name) parts.push(record.name);
  });
  (line?.extraIds || []).forEach((id) => {
    const extra = (line?.product?.extras || []).find(
      (item) => String(item.productExtraId) === String(id),
    );
    if (extra?.name) parts.push(extra.name);
  });
  return parts;
}

export function draftSignature(customerName, observation, lines) {
  return JSON.stringify({
    customerName: String(customerName || '').trim(),
    observation: String(observation || '').trim(),
    lines: (lines || []).map((line) => ({
      id: line.product?.id,
      quantity: line.quantity,
      variationId: line.variationId || null,
      selections: line.selections || {},
      extraIds: line.extraIds || [],
      observation: String(line.observation || '').trim(),
    })),
  });
}
