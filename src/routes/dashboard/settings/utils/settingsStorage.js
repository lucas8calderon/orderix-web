import {
  getStorePaymentConfig,
  hydrateSavedSecretLengths,
  toPaymentPayload,
  toPaymentUi,
  withoutDeliveryOnlinePayment,
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
import {
  getCompanyProfile as fetchCompanyProfile,
  toCompanyProfilePayload,
  toCompanyProfileUi,
  updateCompanyProfile as saveCompanyProfile,
} from '../../../../services/companyProfileService';

function toPublicMenuUi(data = {}) {
  return {
    publicMenuEnabled: Boolean(data.enabled),
    publicMenuShowUnavailable: Boolean(data.showUnavailable),
    slug: data.slug || '',
    storeName: data.storeName || '',
    catalogVersion: data.catalogVersion ?? 0,
  };
}

// Mock apenas para blocos ainda não migrados (tema, idioma e afins).
let mockSettings = {
  deliveryFee: 5.00,
  deliveryByDistance: false,
  deliveryPerKm: 2.50,
  showUnavailableProducts: false,
  averagePrepTime: 25,
  allowFutureOrders: true,
  maxActiveTables: 20,
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

  async updatePaymentConfig(paymentUi, { scope = 'all' } = {}) {
    const full = toPaymentPayload(paymentUi);
    const payload = scope === 'salon' ? withoutDeliveryOnlinePayment(full) : full;
    if (!payload.acceptedMethods.length) {
      const error = new Error('Selecione ao menos um meio de pagamento');
      error.code = 'PAYMENT_METHODS_REQUIRED';
      throw error;
    }
    const response = await updateStorePaymentConfig(payload);
    return hydrateSavedSecretLengths(toPaymentUi(response.data || {}), paymentUi);
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

  async getCompanyProfile() {
    const response = await fetchCompanyProfile();
    return toCompanyProfileUi(response.data || {});
  },

  async updateCompanyProfile(companyUi) {
    const response = await saveCompanyProfile(toCompanyProfilePayload(companyUi));
    return toCompanyProfileUi(response.data || {});
  },

  async updateDeliveryConfig(deliveryUi) {
    const response = await updateDeliverySettings(toDeliverySettingsPayload(deliveryUi));
    return toDeliverySettingsUi(response.data || {});
  },

  async getSettings() {
    const [payment, publicMenu, hours, delivery, companyInfo] = await Promise.all([
      this.getPaymentConfig(),
      this.getPublicMenuConfig(),
      this.getHoursConfig(),
      this.getDeliveryConfig(),
      this.getCompanyProfile(),
    ]);
    return { ...mockSettings, ...payment, ...publicMenu, ...hours, ...delivery, companyInfo };
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
      onlinePixEnabled,
      onlineCardEnabled,
      mercadoPagoEnvironment,
      mercadoPagoAccessToken,
      mercadoPagoPublicKey,
      mercadoPagoWebhookSecret,
      deliveryOnlineProvider,
      pagbankEnvironment,
      pagbankAccessToken,
      asaasEnvironment,
      asaasApiKey,
      asaasPublicKey,
      asaasWebhookToken,
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
      onlinePixEnabled,
      onlineCardEnabled,
      mercadoPagoEnvironment,
      mercadoPagoAccessToken,
      mercadoPagoPublicKey,
      mercadoPagoWebhookSecret,
      deliveryOnlineProvider,
      pagbankEnvironment,
      pagbankAccessToken,
      asaasEnvironment,
      asaasApiKey,
      asaasPublicKey,
      asaasWebhookToken,
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
      'onlinePixEnabled',
      'onlineCardEnabled',
      'mercadoPagoEnvironment',
      'mercadoPagoAccessToken',
      'mercadoPagoPublicKey',
      'mercadoPagoWebhookSecret',
      'deliveryOnlineProvider',
      'pagbankEnvironment',
      'pagbankAccessToken',
      'asaasEnvironment',
      'asaasApiKey',
      'asaasPublicKey',
      'asaasWebhookToken',
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
