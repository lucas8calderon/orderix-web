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

export function tokenizeDeliveryAsaasCard(slug, orderId, card) {
  return axios.post(
    `${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}/orders/${orderId}/payments/card/tokenize`,
    {
      holderName: card?.holderName,
      number: card?.number,
      expiryMonth: card?.expiryMonth,
      expiryYear: card?.expiryYear,
      ccv: card?.ccv,
    }
  );
}

export function createDeliveryCardPayment(slug, orderId, idempotencyKey, payload) {
  const body = {
    cardToken: payload?.cardToken,
    paymentMethodId: payload?.paymentMethodId,
    installments: payload?.installments,
    identificationType: payload?.identificationType,
    identificationNumber: payload?.identificationNumber,
    providerCustomerId: payload?.providerCustomerId,
  };
  return axios.post(
    `${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}/orders/${orderId}/payments/card`,
    body,
    { headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {} }
  );
}

export function isInfinitePayCheckoutUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'checkout.infinitepay.io' || host.endsWith('.infinitepay.io');
  } catch {
    return false;
  }
}

export function readInfinitePayReturn(search) {
  const params = new URLSearchParams(search || '');
  const orderNsu = params.get('order_nsu');
  const slug = params.get('slug');
  const transactionNsu = params.get('transaction_nsu');
  if (!orderNsu && !slug && !transactionNsu) return null;
  return {
    orderNsu,
    slug,
    transactionNsu,
    captureMethod: params.get('capture_method'),
  };
}

export function createInfinitePayCheckout(slug, orderId, idempotencyKey) {
  return withNormalizedPix(
    axios.post(
      `${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}/orders/${orderId}/payments/infinitepay`,
      {},
      { headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {} }
    )
  );
}

export function confirmInfinitePayReturn(publicToken, payload) {
  return withNormalizedPix(
    axios.post(
      `${API_BASE_URL}/api/public/delivery/orders/${encodeURIComponent(publicToken)}/payments/infinitepay/confirm`,
      {
        orderNsu: payload?.orderNsu || null,
        slug: payload?.slug || null,
        transactionNsu: payload?.transactionNsu || null,
      }
    )
  );
}

export function getDeliveryPixPaymentByToken(publicToken) {
  return withNormalizedPix(
    axios.get(`${API_BASE_URL}/api/public/delivery/orders/${encodeURIComponent(publicToken)}/payment`)
  );
}
