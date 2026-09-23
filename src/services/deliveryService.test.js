import { buildDeliveryUrl, toDeliverySettingsPayload, toDeliverySettingsUi } from './deliveryService';

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
    expect(toDeliverySettingsPayload({ ...ui, deliveryEstimatedMinutes: '' })).toEqual({
      enabled: true,
      offersDelivery: true,
      offersPickup: true,
      deliveryFee: 5,
      minOrder: 20,
      estimatedMinutes: null,
      address: 'Rua A, 10',
      logoUrl: 'https://cdn.example.com/logo.png',
      coverUrl: 'https://cdn.example.com/cover.jpg',
    });
  });

  it('envia null ao remover logo e capa', () => {
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
      deliveryFee: 0,
      minOrder: 0,
      estimatedMinutes: null,
      address: null,
      logoUrl: null,
      coverUrl: null,
    });
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
      deliveryFee: 3.5,
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
});
