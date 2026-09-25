import { act, renderHook, waitFor } from '@testing-library/react';
import { useSettingsState } from './useSettingsState';
import { settingsStorage } from '../utils/settingsStorage';
import { toDeliverySettingsPayload, toDeliverySettingsUi } from '../../../../services/deliveryService';
import { CLEARED_STORE_PHONE } from '../../../../utils/phoneInput';

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

  it('grava o logotipo ao salvar a seção empresa', async () => {
    const logo = 'data:image/jpeg;base64,logodaempresa';
    settingsStorage.updateDeliveryConfig.mockResolvedValue({
      deliveryEnabled: true,
      deliveryFee: 5,
      deliveryMinOrder: 0,
      deliveryEstimatedMinutes: 40,
      storeAddress: '',
      deliveryLogoUrl: logo,
      deliveryCoverUrl: '',
    });

    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('deliveryLogoUrl', null, logo);
    });

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('companyInfo');
    });

    expect(saved).toBe(true);
    expect(settingsStorage.updateDeliveryConfig).toHaveBeenCalledWith(
      expect.objectContaining({ deliveryLogoUrl: logo })
    );
    expect(result.current.settings.deliveryLogoUrl).toBe(logo);
    expect(result.current.toast.message).toMatch(/logotipo salvo/i);
  });

  it('salva WhatsApp válido, a resposta devolve o número e o form mostra de novo', async () => {
    settingsStorage.getDeliveryConfig.mockResolvedValue(toDeliverySettingsUi({
      enabled: true,
      deliveryFee: 5,
      minOrder: 0,
      estimatedMinutes: 40,
      address: '',
      phone: '11988887777',
    }));
    settingsStorage.updateDeliveryConfig.mockImplementation(async (ui) => {
      const payload = toDeliverySettingsPayload(ui);
      return toDeliverySettingsUi({
        enabled: payload.enabled,
        deliveryFee: payload.deliveryFee,
        minOrder: payload.minOrder,
        estimatedMinutes: payload.estimatedMinutes,
        address: payload.address,
        feeMode: payload.feeMode,
        phone: payload.phone,
      });
    });

    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.settings.storePhone).toBe('(11) 98888-7777'));

    act(() => {
      result.current.updateSetting('storePhone', null, '(11) 97777-6666');
    });

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('delivery');
    });

    expect(saved).toBe(true);
    const sent = toDeliverySettingsPayload(settingsStorage.updateDeliveryConfig.mock.calls[0][0]);
    expect(sent.phone).toBe('11977776666');
    expect(result.current.settings.storePhone).toBe('(11) 97777-6666');
    expect(result.current.toast.severity).toBe('success');
  });

  it('não apaga o WhatsApp salvo quando o campo vazio não foi limpo de propósito', async () => {
    let serverPhone = '11988887777';
    settingsStorage.getDeliveryConfig.mockResolvedValue(toDeliverySettingsUi({
      enabled: true,
      deliveryFee: 5,
      phone: null,
    }));
    settingsStorage.updateDeliveryConfig.mockImplementation(async (ui) => {
      const payload = toDeliverySettingsPayload(ui);
      if (Object.prototype.hasOwnProperty.call(payload, 'phone')) {
        serverPhone = payload.phone || null;
      }
      return toDeliverySettingsUi({
        enabled: true,
        deliveryFee: payload.deliveryFee,
        phone: serverPhone,
      });
    });

    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.settings.storePhone).toBe('');

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('delivery');
    });

    expect(saved).toBe(true);
    expect(toDeliverySettingsPayload(settingsStorage.updateDeliveryConfig.mock.calls[0][0]).phone).toBeUndefined();
    expect(serverPhone).toBe('11988887777');
    expect(result.current.settings.storePhone).toBe('(11) 98888-7777');
  });

  it('apaga o WhatsApp quando o usuário limpa o campo', async () => {
    settingsStorage.getDeliveryConfig.mockResolvedValue(toDeliverySettingsUi({
      enabled: true,
      phone: '11988887777',
    }));
    settingsStorage.updateDeliveryConfig.mockImplementation(async (ui) => {
      const payload = toDeliverySettingsPayload(ui);
      return toDeliverySettingsUi({ enabled: true, phone: payload.phone || null });
    });

    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.settings.storePhone).toBe('(11) 98888-7777'));

    act(() => {
      result.current.updateSetting('storePhone', null, CLEARED_STORE_PHONE);
    });

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('delivery');
    });

    expect(saved).toBe(true);
    expect(toDeliverySettingsPayload(settingsStorage.updateDeliveryConfig.mock.calls[0][0]).phone).toBe('');
    expect(result.current.settings.storePhone).toBe('');
  });

  it('mantém o número digitado se a resposta não devolve o WhatsApp', async () => {
    settingsStorage.updateDeliveryConfig.mockResolvedValue(toDeliverySettingsUi({
      enabled: true,
      deliveryFee: 5,
      phone: null,
    }));

    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('storePhone', null, '(11) 97777-6666');
    });

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('delivery');
    });

    expect(saved).toBe(false);
    expect(result.current.toast.severity).toBe('error');
    expect(result.current.toast.message).toMatch(/não gravou o whatsapp/i);
    expect(result.current.settings.storePhone).toBe('(11) 97777-6666');
  });

  it('não grava WhatsApp inválido', async () => {
    const { result } = renderHook(() => useSettingsState());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSetting('storePhone', null, '(11) 123');
    });

    let saved;
    await act(async () => {
      saved = await result.current.saveSettings('delivery');
    });

    expect(saved).toBe(false);
    expect(settingsStorage.updateDeliveryConfig).not.toHaveBeenCalled();
    expect(result.current.toast.severity).toBe('error');
    expect(result.current.toast.message).toMatch(/whatsapp válido com ddd/i);
  });
});
