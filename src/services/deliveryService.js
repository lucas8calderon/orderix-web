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

export function toDeliverySettingsUi(data = {}) {
  return {
    deliveryEnabled: Boolean(data.enabled),
    offersDelivery: data.offersDelivery == null ? true : Boolean(data.offersDelivery),
    offersPickup: data.offersPickup == null ? true : Boolean(data.offersPickup),
    acceptPaymentOnDelivery: data.acceptPaymentOnDelivery == null
      ? true
      : Boolean(data.acceptPaymentOnDelivery),
    deliveryFee: Number(data.deliveryFee || 0),
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
  const acceptPaymentOnDelivery = ui.acceptPaymentOnDelivery == null
    ? true
    : Boolean(ui.acceptPaymentOnDelivery);
  return {
    enabled: Boolean(ui.deliveryEnabled),
    offersDelivery,
    offersPickup,
    acceptPaymentOnDelivery,
    deliveryFee: Number(ui.deliveryFee || 0),
    minOrder: Number(ui.deliveryMinOrder || 0),
    estimatedMinutes: eta === '' || eta == null ? null : Number(eta),
    address: address || null,
    logoUrl: brandingField(ui.deliveryLogoUrl),
    coverUrl: brandingField(ui.deliveryCoverUrl),
  };
}
