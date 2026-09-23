import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const PIX_POLL_INTERVAL_MS = 5000;

export const ONLINE_PIX_TERMINAL = new Set(['APPROVED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED']);

export function isPixPaid(status) {
  const raw = String(status || '').toUpperCase();
  return raw === 'APPROVED' || raw === 'PAID';
}

export function isPixTerminal(status) {
  return ONLINE_PIX_TERMINAL.has(String(status || '').toUpperCase());
}

/** Normaliza campos do PixPaymentDTO (create/poll), incl. expiresAt. */
export function normalizePixPayment(data) {
  if (!data || typeof data !== 'object') return data;
  const expiresAt = data.expiresAt ?? data.expires_at ?? null;
  const createdAt = data.createdAt ?? data.created_at ?? null;
  return {
    ...data,
    expiresAt,
    createdAt,
  };
}

function withNormalizedPix(promise) {
  return promise.then((response) => ({
    ...response,
    data: normalizePixPayment(response.data),
  }));
}

export function createDeliveryPixPayment(slug, orderId, idempotencyKey) {
  return withNormalizedPix(
    axios.post(
      `${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}/orders/${orderId}/payments/pix`,
      {},
      { headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {} }
    )
  );
}

export function getDeliveryPixPayment(slug, orderId, paymentId) {
  return withNormalizedPix(
    axios.get(
      `${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}/orders/${orderId}/payments/${paymentId}`
    )
  );
}

export function createDeliveryCardPayment(slug, orderId, idempotencyKey, payload) {
  const body = {
    cardToken: payload?.cardToken,
    paymentMethodId: payload?.paymentMethodId,
    installments: payload?.installments,
    identificationType: payload?.identificationType,
    identificationNumber: payload?.identificationNumber,
  };
  return axios.post(
    `${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}/orders/${orderId}/payments/card`,
    body,
    { headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {} }
  );
}

export function getDeliveryPixPaymentByToken(publicToken) {
  return withNormalizedPix(
    axios.get(`${API_BASE_URL}/api/public/delivery/orders/${encodeURIComponent(publicToken)}/payment`)
  );
}
