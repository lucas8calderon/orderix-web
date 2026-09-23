export function draftLineTotal(product, qty, extrasMap = {}, selections = {}) {
  if (!product) return 0;
  let unit = Number(product.value || 0);
  (product.extras || []).forEach((extra) => {
    if (extrasMap[extra.id]) unit += Number(extra.price || 0);
  });
  (product.mandatoryGroups || []).forEach((group) => {
    const selectedId = selections[group.id];
    const item = (group.items || []).find((entry) => String(entry.id) === String(selectedId));
    if (item) unit += Number(item.price || 0);
  });
  return unit * Number(qty || 1);
}
