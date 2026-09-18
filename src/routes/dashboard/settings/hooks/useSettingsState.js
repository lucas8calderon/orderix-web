import { useCallback, useEffect, useMemo, useState } from 'react';
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
  waiterPaymentEnabled: true,
  paymentMethods: {
    PIX: true,
    DEBIT: true,
    CREDIT: true,
    CASH: true,
    VOUCHER: true,
    OTHER: false,
  },
  defaultProvider: 'MANUAL',
  infinitePayHandle: '',
  infinitePayDocument: '',
};

function apiErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

export const useSettingsState = () => {
  const [settings, setSettings] = useState({
    ...DEFAULT_PAYMENT,
    permissions: MOCK_PERMISSIONS,
    companyInfo: MOCK_COMPANY,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let cancelled = false;
    settingsStorage.getPaymentConfig()
      .then((payment) => {
        if (cancelled) return;
        setSettings((prev) => ({ ...prev, ...payment }));
      })
      .catch((error) => {
        if (cancelled) return;
        setToast({
          open: true,
          message: apiErrorMessage(error, 'Não foi possível carregar a cobrança da loja.'),
          severity: 'error',
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      setToast({
        open: true,
        message: 'Configurações ainda não são salvas no servidor. Esta tela está em breve.',
        severity: 'info',
      });
      return false;
    }

    setSaving(true);
    try {
      const payment = await settingsStorage.updatePaymentConfig({
        timing: settings.timing,
        waiterPaymentEnabled: settings.waiterPaymentEnabled,
        paymentMethods: settings.paymentMethods,
        defaultProvider: settings.defaultProvider,
        serviceFee: settings.serviceFee,
        infinitePayHandle: settings.infinitePayHandle,
        infinitePayDocument: settings.infinitePayDocument,
      });
      setSettings((prev) => ({ ...prev, ...payment }));
      setToast({
        open: true,
        message: 'Cobrança da loja salva.',
        severity: 'success',
      });
      return true;
    } catch (error) {
      setToast({
        open: true,
        message: apiErrorMessage(error, 'Não foi possível salvar a cobrança da loja.'),
        severity: 'error',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const labels = useMemo(() => ({
    sectionTitles: {
      serviceFee: 'Taxa de Serviço',
      paymentMethods: 'Métodos de Pagamento',
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
    color: '#374151',
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
