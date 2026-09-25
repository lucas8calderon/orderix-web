const isPickup = (fulfillment) => String(fulfillment || '').toUpperCase() === 'PICKUP';

function flag(value, fallback) {
  if (value == null) return fallback;
  return value !== false;
}

export function channelPaymentOptions(catalog, fulfillment) {
  const pickup = isPickup(fulfillment);
  const legacyPayOn = catalog?.acceptPaymentOnDelivery !== false;
  const payOnFulfillment = pickup
    ? flag(catalog?.acceptPayOnPickup, legacyPayOn)
    : flag(catalog?.acceptPayOnDelivery, legacyPayOn);
  const prepaid = pickup
    ? flag(catalog?.acceptPrepaidPickup, true)
    : flag(catalog?.acceptPrepaidDelivery, true);
  const onlinePix = Boolean(catalog?.onlinePixEnabled);
  const onlineCard = Boolean(catalog?.onlineCardEnabled);
  return {
    pickup,
    payOnFulfillment,
    prepaid,
    onlinePix,
    onlineCard,
    showPayOnFulfillment: payOnFulfillment,
    showOnline: prepaid && (onlinePix || onlineCard),
  };
}

export function defaultCheckoutPayment(catalog, fulfillment) {
  const options = channelPaymentOptions(catalog, fulfillment);
  if (options.showOnline && options.onlinePix) {
    return { onlinePayment: true, paymentMethod: 'PIX', needsChange: false };
  }
  if (options.showOnline && options.onlineCard) {
    return { onlinePayment: true, paymentMethod: 'CREDIT', needsChange: false };
  }
  return { onlinePayment: false, paymentMethod: 'PIX', needsChange: false };
}

export function checkoutPaymentStillValid(catalog, fulfillment, checkout) {
  const options = channelPaymentOptions(catalog, fulfillment);
  if (checkout?.onlinePayment) {
    if (checkout.paymentMethod === 'PIX') return options.showOnline && options.onlinePix;
    if (checkout.paymentMethod === 'CREDIT') return options.showOnline && options.onlineCard;
    return false;
  }
  return options.showPayOnFulfillment;
}
