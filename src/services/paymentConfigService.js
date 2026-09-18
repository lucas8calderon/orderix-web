import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const PAYMENT_METHOD_ORDER = ['PIX', 'DEBIT', 'CREDIT', 'CASH', 'VOUCHER', 'OTHER'];

export const PAYMENT_METHOD_LABELS = {
  PIX: 'PIX',
  DEBIT: 'Cartão de Débito',
  CREDIT: 'Cartão de Crédito',
  CASH: 'Dinheiro',
  VOUCHER: 'Vale',
  OTHER: 'Outro',
};

export const CHARGE_TIMING_OPTIONS = [
  { id: 'AFTER_KITCHEN', label: 'Depois da cozinha' },
  { id: 'BEFORE_KITCHEN', label: 'Antes da cozinha (hold)' },
  { id: 'OPTIONAL', label: 'Opcional' },
];

export const PAYMENT_PROVIDER_OPTIONS = [
  { id: 'MANUAL', label: 'Manual' },
  { id: 'INFINITEPAY', label: 'InfinitePay' },
  { id: 'GETNET', label: 'Getnet' },
];

const PAYMENT_CONFIG_URL = `${API_BASE_URL}/stores/me/payment-config`;

export function getStorePaymentConfig() {
  return axios.get(PAYMENT_CONFIG_URL);
}

export function updateStorePaymentConfig(payload) {
  return axios.put(PAYMENT_CONFIG_URL, payload);
}

export function serviceFeePercentToUi(percent) {
  const n = Number(percent);
  if (!Number.isFinite(n)) return 10;
  return Math.round(n * 100);
}

export function serviceFeeUiToPercent(uiPercent) {
  const n = Number(uiPercent);
  if (!Number.isFinite(n)) return 0.1;
  return Number((Math.min(100, Math.max(0, n)) / 100).toFixed(4));
}

export function methodsToToggleMap(acceptedMethods) {
  const list = Array.isArray(acceptedMethods) ? acceptedMethods : [];
  const enabled = new Set(list.map((method) => String(method).toUpperCase()));
  const useAll = enabled.size === 0;
  return PAYMENT_METHOD_ORDER.reduce((acc, method) => {
    acc[method] = useAll ? true : enabled.has(method);
    return acc;
  }, {});
}

export function toggleMapToMethods(map) {
  return PAYMENT_METHOD_ORDER.filter((method) => Boolean(map?.[method]));
}

export function toPaymentUi(dto = {}) {
  return {
    timing: dto.timing || 'AFTER_KITCHEN',
    waiterPaymentEnabled: dto.waiterPaymentEnabled !== false,
    paymentMethods: methodsToToggleMap(dto.acceptedMethods),
    defaultProvider: dto.defaultProvider || 'MANUAL',
    serviceFee: serviceFeePercentToUi(dto.serviceFeePercent ?? 0.1),
    infinitePayHandle: dto.infinitePayHandle || '',
    infinitePayDocument: dto.infinitePayDocument || '',
  };
}

export function toPaymentPayload(ui) {
  const acceptedMethods = toggleMapToMethods(ui.paymentMethods);
  const payload = {
    timing: ui.timing || 'AFTER_KITCHEN',
    waiterPaymentEnabled: Boolean(ui.waiterPaymentEnabled),
    acceptedMethods,
    defaultProvider: ui.defaultProvider || 'MANUAL',
    serviceFeePercent: serviceFeeUiToPercent(ui.serviceFee),
  };
  if (payload.defaultProvider === 'INFINITEPAY') {
    payload.infinitePayHandle = ui.infinitePayHandle || '';
    payload.infinitePayDocument = ui.infinitePayDocument || '';
  }
  return payload;
}

export function paymentMethodsFromConfig(dto) {
  const accepted = Array.isArray(dto?.acceptedMethods) && dto.acceptedMethods.length > 0
    ? dto.acceptedMethods.map((method) => String(method).toUpperCase())
    : PAYMENT_METHOD_ORDER;
  return accepted
    .filter((id) => PAYMENT_METHOD_LABELS[id])
    .map((id) => ({ id, label: PAYMENT_METHOD_LABELS[id] }));
}

const PAYMENTS_URL = `${API_BASE_URL}/payments`;

export function createPaymentIntent(payload, idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return axios.post(`${PAYMENTS_URL}/intents`, payload, { headers });
}

export function capturePayment(paymentId, body = {}) {
  return axios.post(`${PAYMENTS_URL}/${paymentId}/capture`, body);
}
