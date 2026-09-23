import {
  isQuickCounterProvider,
  paymentMethodsFromConfig,
  toChannelTiming,
  toPaymentPayload,
  toPaymentUi,
} from './paymentConfigService';

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

describe('channel charge timing', () => {
  it('mapeia OPTIONAL legado para depois da cozinha', () => {
    expect(toChannelTiming('OPTIONAL')).toBe('AFTER_KITCHEN');
    expect(toChannelTiming(undefined, 'BEFORE_KITCHEN')).toBe('BEFORE_KITCHEN');
  });

  it('identifica venda rápida só em Getnet e InfinitePay', () => {
    expect(isQuickCounterProvider('GETNET')).toBe(true);
    expect(isQuickCounterProvider('INFINITEPAY')).toBe(true);
    expect(isQuickCounterProvider('MANUAL')).toBe(false);
  });

  it('toPaymentUi preenche os três canais e usa timing legado como fallback', () => {
    const ui = toPaymentUi({ timing: 'BEFORE_KITCHEN', acceptedMethods: ['PIX'] });
    expect(ui.tableTiming).toBe('BEFORE_KITCHEN');
    expect(ui.comandaTiming).toBe('BEFORE_KITCHEN');
    expect(ui.counterTiming).toBe('BEFORE_KITCHEN');
  });

  it('toPaymentUi respeita o timing do balcão da loja', () => {
    const ui = toPaymentUi({ timing: 'AFTER_KITCHEN', counterTiming: 'AFTER_KITCHEN' });
    expect(ui.counterTiming).toBe('AFTER_KITCHEN');
    expect(ui.tableTiming).toBe('AFTER_KITCHEN');
  });

  it('toPaymentPayload envia os três timings de canal', () => {
    const payload = toPaymentPayload({
      tableTiming: 'BEFORE_KITCHEN',
      comandaTiming: 'AFTER_KITCHEN',
      counterTiming: 'AFTER_KITCHEN',
      tablePaymentMode: 'MANUAL_CONFIRMATION',
      comandaPaymentMode: 'MANUAL_CONFIRMATION',
      counterPaymentMode: 'MANUAL_CONFIRMATION',
      tablePaymentProvider: 'NONE',
      comandaPaymentProvider: 'NONE',
      counterPaymentProvider: 'NONE',
      tableFallbackMode: 'BLOCK',
      waiterPaymentEnabled: true,
      paymentMethods: { PIX: true },
      defaultProvider: 'NONE',
      serviceFee: 10,
    });
    expect(payload.tableTiming).toBe('BEFORE_KITCHEN');
    expect(payload.comandaTiming).toBe('AFTER_KITCHEN');
    expect(payload.counterTiming).toBe('AFTER_KITCHEN');
    expect(payload.tablePaymentMode).toBe('MANUAL_CONFIRMATION');
    expect(payload.tablePaymentProvider).toBe('NONE');
    expect(payload.tableFallbackMode).toBe('BLOCK');
    expect(payload.defaultProvider).toBe('NONE');
  });

  it('mapeia defaultProvider GETNET para INTEGRATED_PAYMENT e waiter false para ORDER_ONLY', () => {
    const integrated = toPaymentUi({ defaultProvider: 'GETNET', waiterPaymentEnabled: true });
    expect(integrated.tablePaymentMode).toBe('INTEGRATED_PAYMENT');
    expect(integrated.counterPaymentMode).toBe('INTEGRATED_PAYMENT');
    const launchOnly = toPaymentUi({ defaultProvider: 'MANUAL', waiterPaymentEnabled: false });
    expect(launchOnly.tablePaymentMode).toBe('ORDER_ONLY');
    expect(launchOnly.comandaPaymentMode).toBe('ORDER_ONLY');
    expect(launchOnly.counterPaymentMode).toBe('MANUAL_CONFIRMATION');
  });

  it('ORDER_ONLY força timing de fechamento no payload', () => {
    const payload = toPaymentPayload({
      tablePaymentMode: 'ORDER_ONLY',
      tableTiming: 'BEFORE_KITCHEN',
      comandaPaymentMode: 'MANUAL_CONFIRMATION',
      comandaTiming: 'BEFORE_KITCHEN',
      counterPaymentMode: 'INTEGRATED_PAYMENT',
      counterPaymentProvider: 'INFINITEPAY',
      counterFallbackMode: 'MANUAL_CONFIRMATION',
      counterTiming: 'AFTER_KITCHEN',
      paymentMethods: { PIX: true },
      serviceFee: 10,
    });
    expect(payload.tableTiming).toBe('AFTER_KITCHEN');
    expect(payload.comandaTiming).toBe('BEFORE_KITCHEN');
    expect(payload.counterPaymentProvider).toBe('INFINITEPAY');
    expect(payload.counterFallbackMode).toBe('MANUAL_CONFIRMATION');
    expect(payload.tablePaymentProvider).toBe('NONE');
    expect(payload.defaultProvider).toBe('INFINITEPAY');
  });

  it('toPaymentUi não devolve secrets do Mercado Pago e mapeia lengths', () => {
    const ui = toPaymentUi({
      mercadoPagoConfigured: true,
      mercadoPagoAccessTokenConfigured: true,
      mercadoPagoPublicKeyConfigured: true,
      mercadoPagoWebhookSecretConfigured: true,
      mercadoPagoStoreAccessTokenConfigured: false,
      mercadoPagoServerTestCredentialsAvailable: true,
      mercadoPagoServerTestPublicKeyAvailable: true,
      mercadoPagoEnvironment: 'test',
      accessTokenLength: 32,
      publicKeyLength: 20,
      webhookSecretLength: 16,
      mercadoPagoAccessToken: 'should-not-leak',
      mercadoPagoPublicKey: 'public-key-value',
      mercadoPagoWebhookSecret: 'secret',
      onlinePixEnabled: true,
    });
    expect(ui.mercadoPagoAccessToken).toBe('');
    expect(ui.mercadoPagoPublicKey).toBe('');
    expect(ui.mercadoPagoWebhookSecret).toBe('');
    expect(ui.mercadoPagoAccessTokenLength).toBe(32);
    expect(ui.mercadoPagoPublicKeyLength).toBe(20);
    expect(ui.mercadoPagoWebhookSecretLength).toBe(16);
    expect(ui.mercadoPagoAccessTokenConfigured).toBe(true);
    expect(ui.mercadoPagoServerTestCredentialsAvailable).toBe(true);
    expect(ui.mercadoPagoStoreAccessTokenConfigured).toBe(false);
    expect(ui.onlinePixEnabled).toBe(true);
  });

  it('toPaymentPayload envia só segredos novos do Mercado Pago', () => {
    const payload = toPaymentPayload({
      tablePaymentMode: 'MANUAL_CONFIRMATION',
      comandaPaymentMode: 'MANUAL_CONFIRMATION',
      counterPaymentMode: 'MANUAL_CONFIRMATION',
      paymentMethods: { PIX: true },
      serviceFee: 10,
      mercadoPagoEnvironment: 'prod',
      mercadoPagoAccessToken: '  novo-token  ',
      mercadoPagoPublicKey: 'pk',
      mercadoPagoWebhookSecret: 'whsec',
      onlinePixEnabled: true,
    });
    expect(payload.mercadoPagoAccessToken).toBe('novo-token');
    expect(payload.mercadoPagoPublicKey).toBe('pk');
    expect(payload.mercadoPagoWebhookSecret).toBe('whsec');
    expect(payload.mercadoPagoEnvironment).toBe('prod');
    expect(payload.onlinePixEnabled).toBe(true);
  });

  it('toPaymentPayload omite máscara Configurado e campos vazios', () => {
    const payload = toPaymentPayload({
      tablePaymentMode: 'MANUAL_CONFIRMATION',
      comandaPaymentMode: 'MANUAL_CONFIRMATION',
      counterPaymentMode: 'MANUAL_CONFIRMATION',
      paymentMethods: { PIX: true },
      serviceFee: 10,
      mercadoPagoEnvironment: 'test',
      mercadoPagoAccessToken: 'Configurado',
      mercadoPagoPublicKey: '•••',
      mercadoPagoWebhookSecret: '   ',
      onlinePixEnabled: false,
    });
    expect(payload.mercadoPagoAccessToken).toBeUndefined();
    expect(payload.mercadoPagoPublicKey).toBeUndefined();
    expect(payload.mercadoPagoWebhookSecret).toBeUndefined();
    expect(payload.mercadoPagoEnvironment).toBe('test');
  });

  it('toPaymentPayload omite máscara de qualquer comprimento e envia só valor novo', () => {
    const mask32 = '•'.repeat(32);
    const unchanged = toPaymentPayload({
      tablePaymentMode: 'MANUAL_CONFIRMATION',
      comandaPaymentMode: 'MANUAL_CONFIRMATION',
      counterPaymentMode: 'MANUAL_CONFIRMATION',
      paymentMethods: { PIX: true },
      serviceFee: 10,
      mercadoPagoEnvironment: 'prod',
      mercadoPagoAccessToken: mask32,
      mercadoPagoPublicKey: '*****',
      mercadoPagoWebhookSecret: '*'.repeat(16),
      onlinePixEnabled: true,
    });
    expect(unchanged.mercadoPagoAccessToken).toBeUndefined();
    expect(unchanged.mercadoPagoPublicKey).toBeUndefined();
    expect(unchanged.mercadoPagoWebhookSecret).toBeUndefined();

    const replaced = toPaymentPayload({
      tablePaymentMode: 'MANUAL_CONFIRMATION',
      comandaPaymentMode: 'MANUAL_CONFIRMATION',
      counterPaymentMode: 'MANUAL_CONFIRMATION',
      paymentMethods: { PIX: true },
      serviceFee: 10,
      mercadoPagoEnvironment: 'prod',
      mercadoPagoAccessToken: mask32,
      mercadoPagoPublicKey: 'pk-nova',
      mercadoPagoWebhookSecret: '',
      onlinePixEnabled: true,
    });
    expect(replaced.mercadoPagoAccessToken).toBeUndefined();
    expect(replaced.mercadoPagoPublicKey).toBe('pk-nova');
    expect(replaced.mercadoPagoWebhookSecret).toBeUndefined();
  });

  it('toPaymentPayload envia onlineCardEnabled e omite secrets vazios', () => {
    const payload = toPaymentPayload({
      tablePaymentMode: 'MANUAL_CONFIRMATION',
      comandaPaymentMode: 'MANUAL_CONFIRMATION',
      counterPaymentMode: 'MANUAL_CONFIRMATION',
      paymentMethods: { PIX: true },
      serviceFee: 10,
      mercadoPagoEnvironment: 'test',
      mercadoPagoAccessToken: '',
      mercadoPagoPublicKey: '',
      onlinePixEnabled: true,
      onlineCardEnabled: true,
    });
    expect(payload.onlinePixEnabled).toBe(true);
    expect(payload.onlineCardEnabled).toBe(true);
    expect(payload.mercadoPagoAccessToken).toBeUndefined();
    expect(payload.mercadoPagoPublicKey).toBeUndefined();
  });

  it('não liga InfinitePay sozinho em loja manual', () => {
    const ui = toPaymentUi({
      tablePaymentMode: 'MANUAL_CONFIRMATION',
      comandaPaymentMode: 'MANUAL_CONFIRMATION',
      counterPaymentMode: 'MANUAL_CONFIRMATION',
      defaultProvider: 'MANUAL',
    });
    expect(ui.tablePaymentProvider).toBe('NONE');
    expect(ui.defaultProvider).toBe('NONE');
  });
});
