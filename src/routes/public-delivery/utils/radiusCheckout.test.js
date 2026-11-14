import { RADIUS_FEE_UNKNOWN_MESSAGE, radiusDeliveryBlocked } from './radiusCheckout';

describe('checkout por raio', () => {
  it('bloqueia a entrega enquanto a distância viária é desconhecida', () => {
    expect(radiusDeliveryBlocked({ pricingMethod: 'BY_RADIUS' }, 'DELIVERY'))
      .toBe(RADIUS_FEE_UNKNOWN_MESSAGE);
  });

  it('não bloqueia retirada nem o modo por bairro', () => {
    expect(radiusDeliveryBlocked({ pricingMethod: 'BY_RADIUS' }, 'PICKUP')).toBe('');
    expect(radiusDeliveryBlocked({ pricingMethod: 'NEIGHBORHOOD' }, 'DELIVERY')).toBe('');
    expect(radiusDeliveryBlocked({}, 'DELIVERY')).toBe('');
  });
});
