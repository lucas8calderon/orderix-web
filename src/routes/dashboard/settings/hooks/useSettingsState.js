import { useState, useCallback, useMemo } from 'react';

// Hook customizado para gerenciar configurações de forma otimizada
export const useSettingsState = () => {
  const [settings, setSettings] = useState({
    serviceFee: 10,
    paymentMethods: {
      pix: true,
      creditCard: true,
      debitCard: true,
      cash: true,
      mealVoucher: false
    },
    permissions: {
      admin: {
        viewDashboard: true,
        manageEmployees: true,
        manageMenu: true,
        manageTables: true,
        manageKitchen: true,
        manageSettings: true
      },
      garcom: {
        viewDashboard: true,
        manageEmployees: false,
        manageMenu: true,
        manageTables: true,
        manageKitchen: false,
        manageSettings: false
      },
      cozinha: {
        viewDashboard: true,
        manageEmployees: false,
        manageMenu: true,
        manageTables: false,
        manageKitchen: true,
        manageSettings: false
      },
      caixa: {
        viewDashboard: true,
        manageEmployees: false,
        manageMenu: true,
        manageTables: true,
        manageKitchen: false,
        manageSettings: false
      }
    },
    companyInfo: {
      companyName: 'Padaria Belas Artes',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 3456-7890',
      logoUrl: ''
    }
  });

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Função otimizada para atualizar configurações
  const updateSetting = useCallback((section, key, value) => {
    setSettings(prev => {
      // Evitar re-renders desnecessários
      if (prev[section] === value) return prev;
      
      return {
        ...prev,
        [section]: typeof prev[section] === 'object' 
          ? { ...prev[section], [key]: value }
          : value
      };
    });
  }, []);

  // Função otimizada para atualizar permissões
  const updatePermission = useCallback((profile, permission, value) => {
    setSettings(prev => {
      // Verificar se o valor realmente mudou
      if (prev.permissions[profile][permission] === value) return prev;
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [profile]: {
            ...prev.permissions[profile],
            [permission]: value
          }
        }
      };
    });
  }, []);

  // Função otimizada para salvar configurações
  const saveSettings = useCallback((section) => {
    console.log(`Salvando configurações da seção: ${section}`, settings[section]);
    setToast({ 
      open: true, 
      message: `Configurações de ${getSectionTitle(section)} salvas com sucesso!`, 
      severity: 'success' 
    });
  }, [settings]);

  // Labels memoizados para evitar recriação
  const labels = useMemo(() => ({
    sectionTitles: {
      serviceFee: 'Taxa de Serviço',
      paymentMethods: 'Métodos de Pagamento',
      permissions: 'Perfis e Permissões',
      companyInfo: 'Dados Fiscais e Empresa'
    },
    paymentMethods: {
      pix: 'PIX',
      creditCard: 'Cartão de Crédito',
      debitCard: 'Cartão de Débito',
      cash: 'Dinheiro',
      mealVoucher: 'Vale-refeição'
    },
    profiles: {
      admin: 'Admin',
      garcom: 'Garçom',
      cozinha: 'Cozinha',
      caixa: 'Caixa'
    },
    permissions: {
      viewDashboard: 'Visualizar Dashboard',
      manageEmployees: 'Gerenciar Funcionários',
      manageMenu: 'Gerenciar Cardápio',
      manageTables: 'Gerenciar Mesas',
      manageKitchen: 'Gerenciar Cozinha',
      manageSettings: 'Gerenciar Configurações'
    }
  }), []);

  // Funções de label memoizadas
  const getSectionTitle = useCallback((section) => labels.sectionTitles[section] || section, [labels]);
  const getPaymentMethodLabel = useCallback((method) => labels.paymentMethods[method] || method, [labels]);
  const getProfileLabel = useCallback((profile) => labels.profiles[profile] || profile, [labels]);
  const getPermissionLabel = useCallback((permission) => labels.permissions[permission] || permission, [labels]);

  return {
    settings,
    toast,
    setToast,
    updateSetting,
    updatePermission,
    saveSettings,
    getSectionTitle,
    getPaymentMethodLabel,
    getProfileLabel,
    getPermissionLabel
  };
};

// Hook para otimizar estilos do slider
export const useSliderStyles = () => {
  return useMemo(() => ({
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
};

// Hook para otimizar estilos dos switches
export const useSwitchStyles = () => {
  return useMemo(() => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: 'var(--color-primary)',
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: 'var(--color-primary)',
    },
  }), []);
};
