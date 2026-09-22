import {
  getStorePaymentConfig,
  toPaymentPayload,
  toPaymentUi,
  updateStorePaymentConfig,
} from '../../../../services/paymentConfigService';
import {
  getPublicMenuSettings,
  updatePublicMenuSettings,
} from '../../../../services/publicMenuService';
import {
  getStoreHours,
  toHoursPayload,
  toHoursUi,
  updateStoreHours,
} from '../../../../services/storeHoursService';
import {
  getDeliverySettings,
  toDeliverySettingsPayload,
  toDeliverySettingsUi,
  updateDeliverySettings,
} from '../../../../services/deliveryService';

function toPublicMenuUi(data = {}) {
  return {
    publicMenuEnabled: Boolean(data.enabled),
    publicMenuShowUnavailable: Boolean(data.showUnavailable),
    slug: data.slug || '',
    storeName: data.storeName || '',
    catalogVersion: data.catalogVersion ?? 0,
  };
}

// Mock apenas para blocos ainda não migrados (fiscal).
let mockSettings = {
  deliveryFee: 5.00,
  deliveryByDistance: false,
  deliveryPerKm: 2.50,
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
  realTimeNotifications: true,
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const settingsStorage = {
  async getPaymentConfig() {
    const response = await getStorePaymentConfig();
    return toPaymentUi(response.data || {});
  },

  async updatePaymentConfig(paymentUi) {
    const payload = toPaymentPayload(paymentUi);
    if (!payload.acceptedMethods.length) {
      const error = new Error('Selecione ao menos um meio de pagamento');
      error.code = 'PAYMENT_METHODS_REQUIRED';
      throw error;
    }
    const response = await updateStorePaymentConfig(payload);
    return toPaymentUi(response.data || {});
  },

  async getHoursConfig() {
    const response = await getStoreHours();
    return toHoursUi(response.data || {});
  },

  async updateHoursConfig(hoursUi) {
    const response = await updateStoreHours(toHoursPayload(hoursUi));
    return toHoursUi(response.data || {});
  },

  async getPublicMenuConfig() {
    const response = await getPublicMenuSettings();
    return toPublicMenuUi(response.data || {});
  },

  async updatePublicMenuConfig(publicMenuUi) {
    const response = await updatePublicMenuSettings({
      enabled: Boolean(publicMenuUi?.publicMenuEnabled),
      showUnavailable: Boolean(publicMenuUi?.publicMenuShowUnavailable),
    });
    return toPublicMenuUi(response.data || {});
  },

  async getDeliveryConfig() {
    const response = await getDeliverySettings();
    return toDeliverySettingsUi(response.data || {});
  },

  async updateDeliveryConfig(deliveryUi) {
    const response = await updateDeliverySettings(toDeliverySettingsPayload(deliveryUi));
    return toDeliverySettingsUi(response.data || {});
  },

  async getSettings() {
    const [payment, publicMenu, hours, delivery] = await Promise.all([
      this.getPaymentConfig(),
      this.getPublicMenuConfig(),
      this.getHoursConfig(),
      this.getDeliveryConfig(),
    ]);
    return { ...mockSettings, ...payment, ...publicMenu, ...hours, ...delivery };
  },

  async updateSettings(newSettings) {
    await delay(200);
    const {
      timing,
      tableTiming,
      comandaTiming,
      counterTiming,
      tablePaymentMode,
      comandaPaymentMode,
      counterPaymentMode,
      tablePaymentProvider,
      comandaPaymentProvider,
      counterPaymentProvider,
      tableFallbackMode,
      comandaFallbackMode,
      counterFallbackMode,
      waiterPaymentEnabled,
      paymentMethods,
      defaultProvider,
      serviceFee,
      infinitePayHandle,
      infinitePayDocument,
      ...rest
    } = newSettings || {};
    mockSettings = { ...mockSettings, ...rest };
    const payment = await this.updatePaymentConfig({
      timing,
      tableTiming,
      comandaTiming,
      counterTiming,
      tablePaymentMode,
      comandaPaymentMode,
      counterPaymentMode,
      tablePaymentProvider,
      comandaPaymentProvider,
      counterPaymentProvider,
      tableFallbackMode,
      comandaFallbackMode,
      counterFallbackMode,
      waiterPaymentEnabled,
      paymentMethods,
      defaultProvider,
      serviceFee,
      infinitePayHandle,
      infinitePayDocument,
    });
    return { ...mockSettings, ...payment };
  },

  async updateSetting(key, value) {
    const paymentKeys = new Set([
      'timing',
      'tableTiming',
      'comandaTiming',
      'counterTiming',
      'tablePaymentMode',
      'comandaPaymentMode',
      'counterPaymentMode',
      'tablePaymentProvider',
      'comandaPaymentProvider',
      'counterPaymentProvider',
      'tableFallbackMode',
      'comandaFallbackMode',
      'counterFallbackMode',
      'waiterPaymentEnabled',
      'paymentMethods',
      'defaultProvider',
      'serviceFee',
      'infinitePayHandle',
      'infinitePayDocument',
    ]);
    if (paymentKeys.has(key)) {
      const current = await this.getPaymentConfig();
      return this.updatePaymentConfig({ ...current, [key]: value });
    }
    await delay(200);
    mockSettings[key] = value;
    return { ...mockSettings };
  },

  async restoreDefaults() {
    await delay(200);
    return { ...mockSettings };
  },
};
