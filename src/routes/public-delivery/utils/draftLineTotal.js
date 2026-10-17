import { variationUnitPrice, activeVariations } from '../../dashboard/menu/utils/productVariations';
import { selectionAdjustment } from '../../dashboard/menu/utils/mandatoryChoices';

export function draftLineTotal(product, qty, extrasMap = {}, selections = {}, variationId) {
  if (!product) return 0;
  const hasVariations = activeVariations(product).length > 0;
  let unit = hasVariations
    ? (variationId ? variationUnitPrice(product, variationId) : 0)
    : Number(product.value || 0);
  (product.extras || []).forEach((extra) => {
    if (extrasMap[extra.id]) unit += Number(extra.price || 0);
  });
  unit += selectionAdjustment(unit - extraSum(product, extrasMap), product.mandatoryGroups, selections);
  return unit * Number(qty || 1);
}

function extraSum(product, extrasMap) {
  return (product.extras || []).reduce((sum, extra) => (
    extrasMap[extra.id] ? sum + Number(extra.price || 0) : sum
  ), 0);
}
