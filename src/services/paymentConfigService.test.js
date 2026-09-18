import { paymentMethodsFromConfig } from './paymentConfigService';

describe('paymentMethodsFromConfig', () => {
  it('omite meios desabilitados', () => {
    expect(paymentMethodsFromConfig({ acceptedMethods: ['PIX', 'CASH'] }).map((m) => m.id))
      .toEqual(['PIX', 'CASH']);
  });

  it('usa a lista padrão quando a loja não filtra', () => {
    const ids = paymentMethodsFromConfig({}).map((m) => m.id);
    expect(ids).toContain('PIX');
    expect(ids).toContain('CREDIT');
  });
});
