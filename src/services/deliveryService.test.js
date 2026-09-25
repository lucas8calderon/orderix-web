import {
  buildDeliveryUrl,
  CLEARED_BRANDING_IMAGE,
  toDeliverySettingsPayload,
  toDeliverySettingsUi,
} from './deliveryService';

describe('deliveryService helpers', () => {
  it('monta URL /delivery/:slug', () => {
    expect(buildDeliveryUrl('padaria', 'https://app.weper.com.br')).toBe(
      'https://app.weper.com.br/delivery/padaria'
    );
    expect(buildDeliveryUrl('', 'https://app.weper.com.br')).toBe('');
  });

  it('converte settings da API para UI e payload', () => {
    const ui = toDeliverySettingsUi({
      enabled: true,
      slug: 'padaria',
      deliveryFee: 5,
      feeMode: 'PER_NEIGHBORHOOD',
      estimatedMinutes: 40,
      minOrder: 20,
      publicPath: '/delivery/padaria',
      address: 'Rua A, 10',
      logoUrl: 'https://cdn.example.com/logo.png',
      coverUrl: 'https://cdn.example.com/cover.jpg',
    });
    expect(ui.deliveryEnabled).toBe(true);
    expect(ui.deliveryFee).toBe(5);
    expect(ui.storeAddress).toBe('Rua A, 10');
    expect(ui.deliveryLogoUrl).toBe('https://cdn.example.com/logo.png');
    expect(ui.deliveryCoverUrl).toBe('https://cdn.example.com/cover.jpg');
    expect(ui.offersDelivery).toBe(true);
    expect(ui.offersPickup).toBe(true);
    expect(ui.acceptPayOnDelivery).toBe(true);
    expect(ui.acceptPrepaidDelivery).toBe(true);
    expect(ui.acceptPayOnPickup).toBe(true);
    expect(ui.acceptPrepaidPickup).toBe(true);
    expect(ui.acceptPaymentOnDelivery).toBe(true);
    expect(toDeliverySettingsPayload({ ...ui, deliveryEstimatedMinutes: '' })).toEqual({
      enabled: true,
      offersDelivery: true,
      offersPickup: true,
      acceptPayOnDelivery: true,
      acceptPrepaidDelivery: true,
      acceptPayOnPickup: true,
      acceptPrepaidPickup: true,
      acceptPaymentOnDelivery: true,
      deliveryFee: 5,
      feeMode: 'PER_NEIGHBORHOOD',
      minOrder: 20,
      estimatedMinutes: null,
      address: 'Rua A, 10',
      logoUrl: 'https://cdn.example.com/logo.png',
      coverUrl: 'https://cdn.example.com/cover.jpg',
    });
  });

  it('omite logo e capa vazios para não apagar o que já está salvo', () => {
    expect(
      toDeliverySettingsPayload({
        deliveryEnabled: false,
        deliveryFee: 0,
        deliveryMinOrder: 0,
        deliveryEstimatedMinutes: '',
        storeAddress: '',
        deliveryLogoUrl: '',
        deliveryCoverUrl: '  ',
      })
    ).toEqual({
      enabled: false,
      offersDelivery: true,
      offersPickup: true,
      acceptPayOnDelivery: true,
      acceptPrepaidDelivery: true,
      acceptPayOnPickup: true,
      acceptPrepaidPickup: true,
      acceptPaymentOnDelivery: true,
      deliveryFee: 0,
      feeMode: 'PER_NEIGHBORHOOD',
      minOrder: 0,
      estimatedMinutes: null,
      address: null,
      logoUrl: null,
      coverUrl: null,
    });
  });

  it('envia string vazia só quando a imagem foi removida', () => {
    expect(
      toDeliverySettingsPayload({
        deliveryEnabled: true,
        deliveryLogoUrl: CLEARED_BRANDING_IMAGE,
        deliveryCoverUrl: CLEARED_BRANDING_IMAGE,
      })
    ).toEqual(expect.objectContaining({
      logoUrl: '',
      coverUrl: '',
    }));
  });

  it('inclui data URL curta de logo e capa no payload PUT', () => {
    const logo = 'data:image/png;base64,abc';
    const cover = 'data:image/jpeg;base64,xyz';
    expect(
      toDeliverySettingsPayload({
        deliveryEnabled: true,
        deliveryFee: 3.5,
        deliveryMinOrder: 10,
        deliveryEstimatedMinutes: 30,
        storeAddress: 'Rua B, 2',
        deliveryLogoUrl: logo,
        deliveryCoverUrl: cover,
      })
    ).toEqual({
      enabled: true,
      offersDelivery: true,
      offersPickup: true,
      acceptPayOnDelivery: true,
      acceptPrepaidDelivery: true,
      acceptPayOnPickup: true,
      acceptPrepaidPickup: true,
      acceptPaymentOnDelivery: true,
      deliveryFee: 3.5,
      feeMode: 'PER_NEIGHBORHOOD',
      minOrder: 10,
      estimatedMinutes: 30,
      address: 'Rua B, 2',
      logoUrl: logo,
      coverUrl: cover,
    });
  });

  it('preserva modos de fulfillment da loja', () => {
    const ui = toDeliverySettingsUi({
      enabled: true,
      offersDelivery: false,
      offersPickup: true,
    });
    expect(ui.offersDelivery).toBe(false);
    expect(ui.offersPickup).toBe(true);
    expect(toDeliverySettingsPayload(ui)).toEqual(expect.objectContaining({
      offersDelivery: false,
      offersPickup: true,
    }));
  });

  it('preserva exigência de pagamento antecipado', () => {
    const ui = toDeliverySettingsUi({
      enabled: true,
      acceptPaymentOnDelivery: false,
    });
    expect(ui.acceptPayOnDelivery).toBe(false);
    expect(ui.acceptPayOnPickup).toBe(false);
    expect(ui.acceptPrepaidDelivery).toBe(true);
    expect(ui.acceptPrepaidPickup).toBe(true);
    expect(ui.acceptPaymentOnDelivery).toBe(false);
    expect(toDeliverySettingsPayload(ui)).toEqual(expect.objectContaining({
      acceptPayOnDelivery: false,
      acceptPayOnPickup: false,
      acceptPrepaidDelivery: true,
      acceptPrepaidPickup: true,
      acceptPaymentOnDelivery: false,
    }));
  });

  it('separa pagamento na hora e antecipado por canal', () => {
    const ui = toDeliverySettingsUi({
      enabled: true,
      acceptPayOnDelivery: false,
      acceptPrepaidDelivery: true,
      acceptPayOnPickup: true,
      acceptPrepaidPickup: false,
    });
    expect(toDeliverySettingsPayload(ui)).toEqual(expect.objectContaining({
      acceptPayOnDelivery: false,
      acceptPrepaidDelivery: true,
      acceptPayOnPickup: true,
      acceptPrepaidPickup: false,
      acceptPaymentOnDelivery: true,
    }));
  });
});
