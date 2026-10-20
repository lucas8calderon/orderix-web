import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PAYMENT_METHOD_LABELS } from '../../../../services/paymentConfigService';
import { isValidStoreWhatsApp } from '../../../public-delivery/utils/neighborhoodWhatsApp';
import { CLEARED_STORE_PHONE, formatStoreWhatsAppInput, normalizeStoreWhatsApp } from '../../../../utils/phoneInput';
import { settingsStorage } from '../utils/settingsStorage';
import { brandingValueForSave } from '../../../../services/deliveryService';

const MOCK_PERMISSIONS = {
  admin: {
    viewDashboard: true,
    manageEmployees: true,
    manageMenu: true,
    manageTables: true,
    manageKitchen: true,
    manageSettings: true,
  },
  garcom: {
    viewDashboard: true,
    manageEmployees: false,
    manageMenu: true,
    manageTables: true,
    manageKitchen: false,
    manageSettings: false,
  },
  cozinha: {
    viewDashboard: true,
    manageEmployees: false,
    manageMenu: true,
    manageTables: false,
    manageKitchen: true,
    manageSettings: false,
  },
  caixa: {
    viewDashboard: true,
    manageEmployees: false,
    manageMenu: true,
    manageTables: true,
    manageKitchen: false,
    manageSettings: false,
  },
};

const MOCK_COMPANY = {
  companyName: 'Padaria Belas Artes',
  cnpj: '12.345.678/0001-90',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 3456-7890',
  logoUrl: '',
};

const DEFAULT_PAYMENT = {
  serviceFee: 10,
  timing: 'AFTER_KITCHEN',
  tableTiming: 'AFTER_KITCHEN',
  comandaTiming: 'AFTER_KITCHEN',
  counterTiming: 'AFTER_KITCHEN',
  tablePaymentMode: 'MANUAL_CONFIRMATION',
  comandaPaymentMode: 'MANUAL_CONFIRMATION',
  counterPaymentMode: 'MANUAL_CONFIRMATION',
  tablePaymentProvider: 'NONE',
  comandaPaymentProvider: 'NONE',
  counterPaymentProvider: 'NONE',
  tableFallbackMode: 'BLOCK',
  comandaFallbackMode: 'BLOCK',
  counterFallbackMode: 'BLOCK',
  waiterPaymentEnabled: true,
  paymentMethods: {
    PIX: true,
    DEBIT: true,
    CREDIT: true,
    CASH: true,
    VOUCHER: true,
    OTHER: false,
  },
  defaultProvider: 'NONE',
  infinitePayHandle: '',
  infinitePayDocument: '',
  onlinePixEnabled: false,
  onlineCardEnabled: false,
  mercadoPagoConfigured: false,
  mercadoPagoAccessTokenConfigured: false,
  mercadoPagoPublicKeyConfigured: false,
  mercadoPagoWebhookSecretConfigured: false,
  mercadoPagoStoreAccessTokenConfigured: false,
  mercadoPagoServerTestCredentialsAvailable: false,
  mercadoPagoServerTestPublicKeyAvailable: false,
  mercadoPagoEnvironment: 'prod',
  mercadoPagoAccessTokenLength: 0,
  mercadoPagoPublicKeyLength: 0,
  mercadoPagoWebhookSecretLength: 0,
  mercadoPagoAccessToken: '',
  mercadoPagoPublicKey: '',
  mercadoPagoWebhookSecret: '',
  deliveryOnlineProvider: 'MERCADOPAGO',
  pagbankEnvironment: 'prod',
  pagbankAccessTokenConfigured: false,
  pagbankCardPublicKeyConfigured: false,
  pagbankAccessTokenLength: 0,
  pagbankAccessToken: '',
  asaasEnvironment: 'prod',
  asaasApiKeyConfigured: false,
  asaasPublicKeyConfigured: false,
  asaasWebhookTokenConfigured: false,
  asaasApiKeyLength: 0,
  asaasPublicKeyLength: 0,
  asaasWebhookTokenLength: 0,
  asaasApiKey: '',
  asaasPublicKey: '',
  asaasWebhookToken: '',
};

const DEFAULT_PUBLIC_MENU = {
  publicMenuEnabled: false,
  publicMenuShowUnavailable: false,
  slug: '',
  storeName: '',
  catalogVersion: 0,
};

const DEFAULT_HOURS = {
  schedule: [
    { weekday: 1, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 2, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 3, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 4, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 5, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 6, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 7, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
  ],
  deliveryEnabled: false,
};

const DEFAULT_DELIVERY = {
  deliveryFee: 0,
  deliveryEstimatedMinutes: '',
  deliveryMinOrder: 0,
  storeAddress: '',
  deliveryPublicPath: '',
  deliveryLogoUrl: '',
  deliveryCoverUrl: '',
  offersDelivery: true,
  offersPickup: true,
  acceptPayOnDelivery: true,
  acceptPrepaidDelivery: true,
  acceptPayOnPickup: true,
  acceptPrepaidPickup: true,
  deliveryFeeMode: 'PER_NEIGHBORHOOD',
  storePhone: '',
};

function mergeSavedDelivery(prev, sent, received) {
  const keepIfNewer = (field) => (
    (prev[field] || '') !== (sent[field] || '') ? (prev[field] || '') : (received[field] || '')
  );
  return {
    ...prev,
    ...received,
    deliveryLogoUrl: keepIfNewer('deliveryLogoUrl'),
    deliveryCoverUrl: keepIfNewer('deliveryCoverUrl'),
  };
}

function storePhoneDigits(value) {
  if (value == null || value === CLEARED_STORE_PHONE) return '';
  return normalizeStoreWhatsApp(value);
}

/** Se o servidor não devolve o número enviado, o campo continua com o que o usuário digitou. */
function confirmSavedStorePhone(sent, received) {
  const sentDigits = storePhoneDigits(sent?.storePhone);
  const gotDigits = normalizeStoreWhatsApp(received?.storePhone);
  if (sentDigits && gotDigits !== sentDigits) {
    return {
      ok: false,
      delivery: {
        ...received,
        storePhone: formatStoreWhatsAppInput(sentDigits),
      },
    };
  }
  return { ok: true, delivery: received };
}

function deliveryPayloadFrom(current, savedImages = {}) {
  return {
    deliveryEnabled: current.deliveryEnabled,
    offersDelivery: current.offersDelivery !== false,
    offersPickup: current.offersPickup !== false,
    acceptPayOnDelivery: current.acceptPayOnDelivery !== false,
    acceptPrepaidDelivery: current.acceptPrepaidDelivery !== false,
    acceptPayOnPickup: current.acceptPayOnPickup !== false,
    acceptPrepaidPickup: current.acceptPrepaidPickup !== false,
    deliveryFee: current.deliveryFee,
    deliveryFeeMode: current.deliveryFeeMode || 'PER_NEIGHBORHOOD',
    deliveryMinOrder: current.deliveryMinOrder,
    deliveryEstimatedMinutes: current.deliveryEstimatedMinutes,
    storeAddress: current.storeAddress,
    storePhone: current.storePhone,
    deliveryLogoUrl: brandingValueForSave(current.deliveryLogoUrl, savedImages.logo),
    deliveryCoverUrl: brandingValueForSave(current.deliveryCoverUrl, savedImages.cover),
  };
}

function slowSaveMessage(saving) {
  return saving
    ? 'A gravação demorou demais. Tente de novo.'
    : 'A resposta demorou demais. Tente de novo.';
}

function isPayloadTooLarge(error) {
  const status = error?.response?.status;
  const apiMessage = typeof error?.response?.data?.message === 'string'
    ? error.response.data.message
    : '';
  return status === 413 || /payload too large|entity too large|request entity too large/i.test(
    `${apiMessage} ${error?.message || ''}`
  );
}

function apiErrorMessage(error, fallback, { saving = false } = {}) {
  const apiMessage = error?.response?.data?.message;
  const hasApiMessage = typeof apiMessage === 'string' && apiMessage.trim();
  if (isPayloadTooLarge(error)) {
    if (hasApiMessage && !/payload too large|entity too large|request entity too large/i.test(apiMessage)) {
      return apiMessage.trim();
    }
    return 'As imagens são grandes demais para enviar. Use arquivos menores ou reinicie o backend atualizado.';
  }
  const status = error?.response?.status;
  if (
    error?.code === 'ECONNABORTED'
    || status === 502
    || status === 503
    || /timeout/i.test(error?.message || '')
  ) {
    return slowSaveMessage(saving);
  }
  if (hasApiMessage) {
    return apiMessage.trim();
  }
  if (status === 401 || status === 403) {
    return error?.message || fallback;
  }
  return error?.message || fallback;
}

export const useSettingsState = () => {
  const [settings, setSettings] = useState({
    ...DEFAULT_PAYMENT,
    ...DEFAULT_PUBLIC_MENU,
    ...DEFAULT_HOURS,
    ...DEFAULT_DELIVERY,
    permissions: MOCK_PERMISSIONS,
    companyInfo: MOCK_COMPANY,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const settingsRef = useRef(settings);
  const serverImagesRef = useRef({ logo: '', cover: '' });
  settingsRef.current = settings;

  const rememberServerImages = useCallback((delivery) => {
    serverImagesRef.current = {
      logo: delivery?.deliveryLogoUrl || '',
      cover: delivery?.deliveryCoverUrl || '',
    };
  }, []);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      settingsStorage.getPaymentConfig(),
      settingsStorage.getPublicMenuConfig(),
      settingsStorage.getHoursConfig(),
      settingsStorage.getDeliveryConfig(),
    ])
      .then(([payment, publicMenu, hours, delivery]) => {
        if (cancelled) return;
        rememberServerImages(delivery);
        setSettings((prev) => ({ ...prev, ...payment, ...publicMenu, ...hours, ...delivery }));
      })
      .catch((error) => {
        if (cancelled) return;
        showToast(
          apiErrorMessage(error, 'Não foi possível carregar as configurações da loja.'),
          'error'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rememberServerImages, showToast]);

  const updateSetting = useCallback((section, key, value) => {
    setSettings((prev) => {
      if (typeof prev[section] === 'object' && prev[section] !== null && !Array.isArray(prev[section])) {
        if (prev[section][key] === value) return prev;
        return {
          ...prev,
          [section]: { ...prev[section], [key]: value },
        };
      }
      if (prev[section] === value) return prev;
      return { ...prev, [section]: value };
    });
  }, []);

  const updatePermission = useCallback((profile, permission, value) => {
    setSettings((prev) => {
      if (prev.permissions[profile][permission] === value) return prev;
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [profile]: {
            ...prev.permissions[profile],
            [permission]: value,
          },
        },
      };
    });
  }, []);

  const saveSettings = useCallback(async (section, options = {}) => {
    if (section === 'permissions') {
      showToast(
        'Configurações ainda não são salvas no servidor. Esta tela está em breve.',
        'info'
      );
      return false;
    }

    const current = settingsRef.current;
    if (section === 'companyInfo' || section === 'delivery') {
      const phone = storePhoneDigits(current.storePhone);
      if (phone && !isValidStoreWhatsApp(phone)) {
        showToast('Informe um WhatsApp válido com DDD', 'error');
        return false;
      }
    }

    if (section === 'companyInfo') {
      setSaving(true);
      try {
        const deliveryPayload = deliveryPayloadFrom(current, serverImagesRef.current);
        const delivery = await settingsStorage.updateDeliveryConfig(deliveryPayload);
        rememberServerImages(delivery);
        const sentLogo = Boolean((deliveryPayload.deliveryLogoUrl || '').trim());
        const gotLogo = Boolean((delivery.deliveryLogoUrl || '').trim());
        if (sentLogo && !gotLogo) {
          showToast(
            'O servidor não gravou o logotipo. Tente uma imagem menor.',
            'error'
          );
          return false;
        }
        const phoneResult = confirmSavedStorePhone(deliveryPayload, delivery);
        if (!phoneResult.ok) {
          setSettings((prev) => mergeSavedDelivery(prev, deliveryPayload, phoneResult.delivery));
          showToast('O servidor não gravou o WhatsApp da loja.', 'error');
          return false;
        }
        setSettings((prev) => mergeSavedDelivery(prev, deliveryPayload, delivery));
        showToast('Logotipo salvo com sucesso.');
        return true;
      } catch (error) {
        showToast(apiErrorMessage(error, 'Não foi possível salvar o logotipo.', { saving: true }), 'error');
        return false;
      } finally {
        setSaving(false);
      }
    }

    setSaving(true);
    try {
      if (section === 'publicMenu') {
        const publicMenu = await settingsStorage.updatePublicMenuConfig({
          publicMenuEnabled: current.publicMenuEnabled,
          publicMenuShowUnavailable: current.publicMenuShowUnavailable,
        });
        setSettings((prev) => ({ ...prev, ...publicMenu }));
        showToast('Cardápio digital salvo com sucesso.');
        return true;
      }

      if (section === 'hours') {
        const hours = await settingsStorage.updateHoursConfig({
          schedule: current.schedule,
          deliveryEnabled: current.deliveryEnabled,
        });
        setSettings((prev) => ({ ...prev, ...hours }));
        showToast('Horários de funcionamento salvos com sucesso.');
        return true;
      }

      if (section === 'delivery') {
        const deliveryPayload = deliveryPayloadFrom(current, serverImagesRef.current);
        const delivery = await settingsStorage.updateDeliveryConfig(deliveryPayload);
        rememberServerImages(delivery);
        const sentLogo = Boolean((deliveryPayload.deliveryLogoUrl || '').trim());
        const sentCover = Boolean((deliveryPayload.deliveryCoverUrl || '').trim());
        const gotLogo = Boolean((delivery.deliveryLogoUrl || '').trim());
        const gotCover = Boolean((delivery.deliveryCoverUrl || '').trim());
        if ((sentLogo && !gotLogo) || (sentCover && !gotCover)) {
          showToast(
            'O servidor não gravou logo/banner. Reinicie o backend (migration V13/V14) e tente de novo com imagens menores.',
            'error'
          );
          return false;
        }
        const phoneResult = confirmSavedStorePhone(deliveryPayload, delivery);
        if (!phoneResult.ok) {
          setSettings((prev) => mergeSavedDelivery(prev, deliveryPayload, phoneResult.delivery));
          showToast('O servidor não gravou o WhatsApp da loja.', 'error');
          return false;
        }
        setSettings((prev) => mergeSavedDelivery(prev, deliveryPayload, delivery));
        showToast(options.imageOnly ? 'Logo e banner salvos.' : 'Delivery salvo com sucesso.');
        return true;
      }

      const paymentSettings = {
        ...current,
        ...(options.paymentOverrides || {}),
      };
      const payment = await settingsStorage.updatePaymentConfig({
        timing: paymentSettings.timing,
        tableTiming: paymentSettings.tableTiming,
        comandaTiming: paymentSettings.comandaTiming,
        counterTiming: paymentSettings.counterTiming,
        tablePaymentMode: paymentSettings.tablePaymentMode,
        comandaPaymentMode: paymentSettings.comandaPaymentMode,
        counterPaymentMode: paymentSettings.counterPaymentMode,
        tablePaymentProvider: paymentSettings.tablePaymentProvider,
        comandaPaymentProvider: paymentSettings.comandaPaymentProvider,
        counterPaymentProvider: paymentSettings.counterPaymentProvider,
        tableFallbackMode: paymentSettings.tableFallbackMode,
        comandaFallbackMode: paymentSettings.comandaFallbackMode,
        counterFallbackMode: paymentSettings.counterFallbackMode,
        waiterPaymentEnabled: paymentSettings.waiterPaymentEnabled,
        paymentMethods: paymentSettings.paymentMethods,
        defaultProvider: paymentSettings.defaultProvider,
        serviceFee: paymentSettings.serviceFee,
        infinitePayHandle: paymentSettings.infinitePayHandle,
        infinitePayDocument: paymentSettings.infinitePayDocument,
        onlinePixEnabled: paymentSettings.onlinePixEnabled,
        onlineCardEnabled: paymentSettings.onlineCardEnabled,
        mercadoPagoEnvironment: paymentSettings.mercadoPagoEnvironment,
        mercadoPagoAccessToken: paymentSettings.mercadoPagoAccessToken,
        mercadoPagoPublicKey: paymentSettings.mercadoPagoPublicKey,
        mercadoPagoWebhookSecret: paymentSettings.mercadoPagoWebhookSecret,
        deliveryOnlineProvider: paymentSettings.deliveryOnlineProvider,
        pagbankEnvironment: paymentSettings.pagbankEnvironment,
        pagbankAccessToken: paymentSettings.pagbankAccessToken,
      });
      setSettings((prev) => ({ ...prev, ...payment }));
      showToast(
        section === 'serviceFee'
          ? 'Taxa de serviço salva com sucesso.'
          : section === 'onlinePayments'
            ? 'Pagamentos online do delivery salvos.'
            : 'Pedidos e pagamentos salvos com sucesso.'
      );
      return true;
    } catch (error) {
      const fallback =
        section === 'publicMenu'
          ? 'Não foi possível salvar o cardápio digital.'
          : section === 'hours'
            ? 'Não foi possível salvar os horários de funcionamento.'
          : section === 'delivery'
            ? 'Não foi possível salvar o Delivery.'
          : section === 'serviceFee'
            ? 'Não foi possível salvar a taxa de serviço.'
            : 'Não foi possível salvar a cobrança da loja.';
      showToast(apiErrorMessage(error, fallback, { saving: true }), 'error');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  const labels = useMemo(() => ({
    sectionTitles: {
      serviceFee: 'Taxa de Serviço',
      paymentMethods: 'Métodos de Pagamento',
      publicMenu: 'Cardápio digital',
      hours: 'Horários de funcionamento',
      delivery: 'Delivery',
      permissions: 'Perfis e Permissões',
      companyInfo: 'Dados Fiscais e Empresa',
    },
    paymentMethods: PAYMENT_METHOD_LABELS,
    profiles: {
      admin: 'Admin',
      garcom: 'Garçom',
      cozinha: 'Cozinha',
      caixa: 'Caixa',
    },
    permissions: {
      viewDashboard: 'Visualizar Dashboard',
      manageEmployees: 'Gerenciar Funcionários',
      manageMenu: 'Gerenciar Catálogo',
      manageTables: 'Gerenciar Atendimento',
      manageKitchen: 'Gerenciar Cozinha',
      manageSettings: 'Gerenciar Configurações',
    },
  }), []);

  const getSectionTitle = useCallback((section) => labels.sectionTitles[section] || section, [labels]);
  const getPaymentMethodLabel = useCallback((method) => labels.paymentMethods[method] || method, [labels]);
  const getProfileLabel = useCallback((profile) => labels.profiles[profile] || profile, [labels]);
  const getPermissionLabel = useCallback((permission) => labels.permissions[permission] || permission, [labels]);

  return {
    settings,
    loading,
    saving,
    toast,
    setToast,
    showToast,
    updateSetting,
    updatePermission,
    saveSettings,
    getSectionTitle,
    getPaymentMethodLabel,
    getProfileLabel,
    getPermissionLabel,
  };
};

export const useSliderStyles = () => useMemo(() => ({
  '& .MuiSlider-thumb': {
    backgroundColor: 'var(--color-primary)',
    border: '2px solid var(--color-primary)',
    '&:hover': {
      backgroundColor: 'var(--color-primary-dark)',
      border: '2px solid var(--color-primary-dark)',
    },
    '&:focus': {
      backgroundColor: 'var(--color-primary-dark)',
      border: '2px solid var(--color-primary-dark)',
    },
    '&:active': {
      backgroundColor: 'var(--color-primary-dark)',
      border: '2px solid var(--color-primary-dark)',
    },
  },
  '& .MuiSlider-track': {
    backgroundColor: 'var(--color-primary)',
    border: 'none',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)',
    border: 'none',
  },
  '& .MuiSlider-mark': {
    backgroundColor: 'var(--color-primary)',
  },
  '& .MuiSlider-markActive': {
    backgroundColor: 'var(--color-primary)',
  },
  '& .MuiSlider-markLabel': {
    color: 'var(--color-text-secondary)',
  },
  '& .MuiSlider-markLabelActive': {
    color: 'var(--color-primary)',
  },
}), []);

export const useSwitchStyles = () => useMemo(() => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: 'var(--color-primary)',
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: 'var(--color-primary)',
  },
}), []);
