export const RADIUS_FEE_UNKNOWN_MESSAGE =
  'Não foi possível calcular a taxa de entrega. Verifique o endereço e tente novamente.';

export function radiusDeliveryBlocked(catalog, fulfillment) {
  if (String(fulfillment || '').toUpperCase() !== 'DELIVERY') return '';
  if (catalog?.pricingMethod !== 'BY_RADIUS') return '';
  return RADIUS_FEE_UNKNOWN_MESSAGE;
}
