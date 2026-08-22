export function resolveMandatorySelections(product) {
  const groups = product?.mandatoryGroups || [];
  return (product?.mandatorySelections || [])
    .map((selection) => {
      const group = groups.find(
        (item) =>
          item.id === selection.mandatoryGroupId || item.id === selection.groupId
      );
      const option = group?.items?.find(
        (item) =>
          item.id === selection.selectedItemId || item.id === selection.itemId
      );
      return {
        groupName: group?.name || selection.groupName || '',
        itemName: option?.name || selection.itemName || '',
        price: Number(option?.price ?? selection.price ?? selection.itemPrice ?? 0),
      };
    })
    .filter((selection) => selection.itemName);
}

export function productLineTotal(product) {
  const quantity = Number(product?.quantity) > 0 ? Number(product.quantity) : 1;
  let total = (Number(product?.value) || 0) * quantity;

  (product?.extras || []).forEach((extra) => {
    const extraQty = Number(extra.quantity) || 1;
    total += (Number(extra.price) || 0) * extraQty * quantity;
  });

  resolveMandatorySelections(product).forEach((selection) => {
    total += (Number(selection.price) || 0) * quantity;
  });

  return total;
}

export function accountSubtotal(account) {
  const orders = account?.orders || [];
  const fromItems = orders.reduce((sum, order) => {
    return (
      sum +
      (order.products || []).reduce((lineSum, product) => lineSum + productLineTotal(product), 0)
    );
  }, 0);

  if (fromItems > 0) {
    return fromItems;
  }

  return Number(account?.totalAmount) || 0;
}

export function countAccountItems(account) {
  return (account?.orders || []).reduce((sum, order) => {
    return (
      sum +
      (order.products || []).reduce((lineSum, product) => {
        const quantity = Number(product.quantity) > 0 ? Number(product.quantity) : 1;
        return lineSum + quantity;
      }, 0)
    );
  }, 0);
}
