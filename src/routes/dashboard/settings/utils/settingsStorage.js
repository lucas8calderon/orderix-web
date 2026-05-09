// Mock storage para configurações - simula backend em memória
let mockSettings = {
  // Taxa de Serviço
  serviceFee: 10,
  
  // Taxa de Entrega
  deliveryFee: 5.00,
  deliveryByDistance: false,
  deliveryPerKm: 2.50,
  
  // Horário de Funcionamento
  openingTime: '08:00',
  closingTime: '22:00',
  closedOnSunday: false,
  customHours: false,
  
  // Métodos de Pagamento
  paymentMethods: {
    pix: true,
    creditCard: true,
    debitCard: true,
    cash: true,
    mealVoucher: false
  },
  
  // Cardápio e Operação
  showUnavailableProducts: false,
  averagePrepTime: 25,
  allowFutureOrders: true,
  maxActiveTables: 20,
  
  // Dados Fiscais
  companyName: 'Padaria Belas Artes',
  cnpj: '12.345.678/0001-90',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 3456-7890',
  logo: null,
  
  // Preferências Gerais
  theme: 'light',
  language: 'pt',
  realTimeNotifications: true
};

// Simula delay de rede
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const settingsStorage = {
  // Buscar todas as configurações
  async getSettings() {
    await delay(200);
    console.log('SettingsStorage: Buscando configurações');
    return { ...mockSettings };
  },

  // Atualizar configurações
  async updateSettings(newSettings) {
    await delay(400);
    console.log('SettingsStorage: Atualizando configurações:', newSettings);
    mockSettings = { ...mockSettings, ...newSettings };
    console.log('SettingsStorage: Configurações atualizadas:', mockSettings);
    return { ...mockSettings };
  },

  // Atualizar configuração específica
  async updateSetting(key, value) {
    await delay(300);
    console.log(`SettingsStorage: Atualizando ${key}:`, value);
    mockSettings[key] = value;
    return { ...mockSettings };
  },

  // Restaurar configurações padrão
  async restoreDefaults() {
    await delay(500);
    console.log('SettingsStorage: Restaurando configurações padrão');
    mockSettings = {
      serviceFee: 10,
      deliveryFee: 5.00,
      deliveryByDistance: false,
      deliveryPerKm: 2.50,
      openingTime: '08:00',
      closingTime: '22:00',
      closedOnSunday: false,
      customHours: false,
      paymentMethods: {
        pix: true,
        creditCard: true,
        debitCard: true,
        cash: true,
        mealVoucher: false
      },
      showUnavailableProducts: false,
      averagePrepTime: 25,
      allowFutureOrders: true,
      maxActiveTables: 20,
      companyName: 'Padaria Belas Artes',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 3456-7890',
      logo: null,
      theme: 'light',
      language: 'pt',
      realTimeNotifications: true
    };
    return { ...mockSettings };
  }
};
