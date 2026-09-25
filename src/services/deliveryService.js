import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const SETTINGS_URL = `${API_BASE_URL}/stores/me/delivery`;

export function getDeliverySettings() {
  return axios.get(SETTINGS_URL, { timeout: 60000 });
}

export function updateDeliverySettings(payload) {
  // Data URLs de logo+banner podem ser grandes; evita timeout falso de 15s.
  return axios.put(SETTINGS_URL, payload, { timeout: 60000 });
}

export function getDeliveryCatalog(slug) {
  return axios.get(`${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}`);
}

export function createDeliveryOrder(slug, payload, idempotencyKey) {
  return axios.post(
    `${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}/orders`,
    payload,
    { headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {} }
  );
}

export function getDeliveryOrder(publicToken) {
  return axios.get(`${API_BASE_URL}/api/public/delivery/orders/${encodeURIComponent(publicToken)}`);
}

export function buildDeliveryUrl(slug, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  if (!slug) return '';
  const base = (origin || '').replace(/\/$/, '');
  return `${base}/delivery/${encodeURIComponent(slug)}`;
}

function flagOr(value, fallback) {
  if (value == null) return fallback;
  return Boolean(value);
}

function paymentOptionsFromApi(data = {}) {
  const legacyPayOn = data.acceptPaymentOnDelivery == null
    ? true
    : Boolean(data.acceptPaymentOnDelivery);
  const acceptPayOnDelivery = flagOr(data.acceptPayOnDelivery, legacyPayOn);
  const acceptPayOnPickup = flagOr(data.acceptPayOnPickup, legacyPayOn);
  const acceptPrepaidDelivery = flagOr(data.acceptPrepaidDelivery, true);
  const acceptPrepaidPickup = flagOr(data.acceptPrepaidPickup, true);
  return {
    acceptPayOnDelivery,
    acceptPrepaidDelivery,
    acceptPayOnPickup,
    acceptPrepaidPickup,
    acceptPaymentOnDelivery: acceptPayOnDelivery || acceptPayOnPickup,
  };
}

export function toDeliverySettingsUi(data = {}) {
  return {
    deliveryEnabled: Boolean(data.enabled),
    offersDelivery: data.offersDelivery == null ? true : Boolean(data.offersDelivery),
    offersPickup: data.offersPickup == null ? true : Boolean(data.offersPickup),
    ...paymentOptionsFromApi(data),
    deliveryFee: Number(data.deliveryFee || 0),
    deliveryFeeMode: data.feeMode || 'PER_NEIGHBORHOOD',
    storePhone: data.phone || '',
    deliveryEstimatedMinutes: data.estimatedMinutes == null ? '' : data.estimatedMinutes,
    deliveryMinOrder: Number(data.minOrder || 0),
    slug: data.slug || '',
    storeName: data.storeName || '',
    storeAddress: data.address || '',
    deliveryPublicPath: data.publicPath || '',
    deliveryLogoUrl: data.logoUrl || '',
    deliveryCoverUrl: data.coverUrl || '',
  };
}

/** Marca remoção explícita. Campo vazio no estado não apaga o que já está no servidor. */
export const CLEARED_BRANDING_IMAGE = '__cleared_branding__';

export function isBrandingImage(value) {
  const trimmed = String(value || '').trim();
  return Boolean(trimmed) && trimmed !== CLEARED_BRANDING_IMAGE;
}

function brandingField(value) {
  if (value === CLEARED_BRANDING_IMAGE) return '';
  const trimmed = String(value || '').trim();
  return trimmed || null;
}

export function toDeliverySettingsPayload(ui = {}) {
  const eta = ui.deliveryEstimatedMinutes;
  const address = (ui.storeAddress || '').trim();
  const offersDelivery = ui.offersDelivery == null ? true : Boolean(ui.offersDelivery);
  const offersPickup = ui.offersPickup == null ? true : Boolean(ui.offersPickup);
  const acceptPayOnDelivery = ui.acceptPayOnDelivery == null ? true : Boolean(ui.acceptPayOnDelivery);
  const acceptPrepaidDelivery = ui.acceptPrepaidDelivery == null ? true : Boolean(ui.acceptPrepaidDelivery);
  const acceptPayOnPickup = ui.acceptPayOnPickup == null ? true : Boolean(ui.acceptPayOnPickup);
  const acceptPrepaidPickup = ui.acceptPrepaidPickup == null ? true : Boolean(ui.acceptPrepaidPickup);
  return {
    enabled: Boolean(ui.deliveryEnabled),
    offersDelivery,
    offersPickup,
    acceptPayOnDelivery,
    acceptPrepaidDelivery,
    acceptPayOnPickup,
    acceptPrepaidPickup,
    acceptPaymentOnDelivery: acceptPayOnDelivery || acceptPayOnPickup,
    deliveryFee: Number(ui.deliveryFee || 0),
    feeMode: ui.deliveryFeeMode || 'PER_NEIGHBORHOOD',
    minOrder: Number(ui.deliveryMinOrder || 0),
    estimatedMinutes: eta === '' || eta == null ? null : Number(eta),
    address: address || null,
    logoUrl: brandingField(ui.deliveryLogoUrl),
    coverUrl: brandingField(ui.deliveryCoverUrl),
  };
}
