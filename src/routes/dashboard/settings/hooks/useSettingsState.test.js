import { act, renderHook, waitFor } from '@testing-library/react';
import { useSettingsState } from './useSettingsState';
import { settingsStorage } from '../utils/settingsStorage';

jest.mock('../utils/settingsStorage', () => ({
  settingsStorage: {
    getPaymentConfig: jest.fn(),
    getPublicMenuConfig: jest.fn(),
    getHoursConfig: jest.fn(),
    getDeliveryConfig: jest.fn(),
    updatePaymentConfig: jest.fn(),
    updatePublicMenuConfig: jest.fn(),
    updateHoursConfig: jest.fn(),
    updateDeliveryConfig: jest.fn(),
  },
}));

describe('useSettingsState delivery branding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    settingsStorage.getPaymentConfig.mockResolvedValue({});
    settingsStorage.getPublicMenuConfig.mockResolvedValue({});
    settingsStorage.getHoursConfig.mockResolvedValue({ schedule: [] });
    settingsStorage.getDeliveryConfig.mockResolvedValue({
      deliveryEnabled: true,
      deliveryFee: 5,
      deliveryMinOrder: 0,
      deliveryEstimatedMinutes: 40,
      storeAddress: '',
      deliveryLogoUrl: '',
      deliveryCoverUrl: '',
    });
  });

  it('envia logoUrl/coverUrl no save da seção delivery e mantém no estado', async () => {
    const logo = 'data:image/png;base64,shortlogo';
    const cover = 'data:image/jpeg;base64,shortcover';
    settingsStorage.updateDeliveryConfig.mockResolvedValue({
      deliveryEnabled: true,
      deliveryFee: 5,
      deliveryMinOrder: 0,
      deliveryEstimatedMinutes: 40,
      storeAddress: '',
      deliveryLogoUrl: logo,
      deliveryCoverUrl: cover,
      deliveryPublicPath: '/delivery/loja',
      slug: 'loja',
    });

    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('deliveryLogoUrl', null, logo);
      result.current.updateSetting('deliveryCoverUrl', null, cover);
    });

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('delivery');
    });

    expect(saved).toBe(true);
    expect(settingsStorage.updateDeliveryConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryLogoUrl: logo,
        deliveryCoverUrl: cover,
      })
    );
    expect(result.current.settings.deliveryLogoUrl).toBe(logo);
    expect(result.current.settings.deliveryCoverUrl).toBe(cover);
    expect(result.current.toast.severity).toBe('success');
  });

  it('mostra erro quando a API falha ao salvar delivery', async () => {
    settingsStorage.updateDeliveryConfig.mockRejectedValue({
      response: { status: 413, data: { message: 'A imagem é grande demais para salvar. Use uma foto menor ou uma URL.' } },
    });

    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('deliveryLogoUrl', null, 'data:image/png;base64,abc');
    });

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('delivery');
    });

    expect(saved).toBe(false);
    expect(result.current.toast.severity).toBe('error');
    expect(result.current.toast.message).toMatch(/grande demais/i);
  });

  it('mostra erro se o servidor devolver sucesso sem as imagens enviadas', async () => {
    settingsStorage.updateDeliveryConfig.mockResolvedValue({
      deliveryEnabled: true,
      deliveryFee: 5,
      deliveryMinOrder: 0,
      deliveryEstimatedMinutes: 40,
      storeAddress: '',
      deliveryLogoUrl: '',
      deliveryCoverUrl: '',
    });

    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('deliveryLogoUrl', null, 'data:image/png;base64,abc');
      result.current.updateSetting('deliveryCoverUrl', null, 'data:image/jpeg;base64,xyz');
    });

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('delivery');
    });

    expect(saved).toBe(false);
    expect(result.current.toast.severity).toBe('error');
    expect(result.current.toast.message).toMatch(/não gravou logo\/banner/i);
  });
});
