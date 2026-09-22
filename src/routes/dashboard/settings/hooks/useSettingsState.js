import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PAYMENT_METHOD_LABELS } from '../../../../services/paymentConfigService';
import { settingsStorage } from '../utils/settingsStorage';

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
};

function apiErrorMessage(error, fallback) {
  const apiMessage = error?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage;
  }
  const status = error?.response?.status;
  if (status === 413) {
    return 'As imagens são grandes demais para enviar. Use arquivos menores ou reinicie o backend atualizado.';
  }
  if (error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')) {
    return 'Tempo esgotado ao salvar. Tente imagens menores.';
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
  settingsRef.current = settings;

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
  }, [showToast]);

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

  const saveSettings = useCallback(async (section) => {
    if (section === 'permissions' || section === 'companyInfo') {
      showToast(
        'Configurações ainda não são salvas no servidor. Esta tela está em breve.',
        'info'
      );
      return false;
    }

    const current = settingsRef.current;
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
        const deliveryPayload = {
          deliveryEnabled: current.deliveryEnabled,
          deliveryFee: current.deliveryFee,
          deliveryMinOrder: current.deliveryMinOrder,
          deliveryEstimatedMinutes: current.deliveryEstimatedMinutes,
          storeAddress: current.storeAddress,
          deliveryLogoUrl: current.deliveryLogoUrl,
          deliveryCoverUrl: current.deliveryCoverUrl,
        };
        const delivery = await settingsStorage.updateDeliveryConfig(deliveryPayload);
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
        setSettings((prev) => ({ ...prev, ...delivery }));
        showToast('Delivery salvo com sucesso.');
        return true;
      }

      const payment = await settingsStorage.updatePaymentConfig({
        timing: current.timing,
        tableTiming: current.tableTiming,
        comandaTiming: current.comandaTiming,
        counterTiming: current.counterTiming,
        tablePaymentMode: current.tablePaymentMode,
        comandaPaymentMode: current.comandaPaymentMode,
        counterPaymentMode: current.counterPaymentMode,
        tablePaymentProvider: current.tablePaymentProvider,
        comandaPaymentProvider: current.comandaPaymentProvider,
        counterPaymentProvider: current.counterPaymentProvider,
        tableFallbackMode: current.tableFallbackMode,
        comandaFallbackMode: current.comandaFallbackMode,
        counterFallbackMode: current.counterFallbackMode,
        waiterPaymentEnabled: current.waiterPaymentEnabled,
        paymentMethods: current.paymentMethods,
        defaultProvider: current.defaultProvider,
        serviceFee: current.serviceFee,
        infinitePayHandle: current.infinitePayHandle,
        infinitePayDocument: current.infinitePayDocument,
      });
      setSettings((prev) => ({ ...prev, ...payment }));
      showToast(
        section === 'serviceFee'
          ? 'Taxa de serviço salva com sucesso.'
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
      showToast(apiErrorMessage(error, fallback), 'error');
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
