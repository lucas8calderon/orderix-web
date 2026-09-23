import { defaultFulfillment, resolveFulfillmentModes } from './fulfillmentModes';

describe('fulfillmentModes', () => {
  it('usa os dois modos quando o catálogo não informa', () => {
    expect(resolveFulfillmentModes({})).toEqual(['DELIVERY', 'PICKUP']);
    expect(resolveFulfillmentModes({ fulfillmentModes: [] })).toEqual(['DELIVERY', 'PICKUP']);
  });

  it('respeita somente retirada', () => {
    expect(resolveFulfillmentModes({ fulfillmentModes: ['PICKUP'] })).toEqual(['PICKUP']);
    expect(defaultFulfillment(['PICKUP'])).toBe('PICKUP');
  });

  it('ignora valores inválidos', () => {
    expect(resolveFulfillmentModes({ fulfillmentModes: ['DRIVE'] })).toEqual(['DELIVERY', 'PICKUP']);
  });
});
