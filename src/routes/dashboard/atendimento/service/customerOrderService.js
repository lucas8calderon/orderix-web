import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

function withIdempotency(idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return { headers };
}

export function listCustomerOrders({ q, status, kitchenStatus } = {}) {
  return axios.get(`${API_BASE_URL}/customer-orders`, {
    params: {
      q: q || undefined,
      status: status || undefined,
      kitchenStatus: kitchenStatus || undefined,
    },
  });
}

export function getCustomerOrder(orderId) {
  return axios.get(`${API_BASE_URL}/customer-orders/${orderId}`);
}

export function createCustomerOrder(payload, idempotencyKey) {
  return axios.post(`${API_BASE_URL}/customer-orders`, payload, withIdempotency(idempotencyKey));
}

export function addCustomerOrderItems(orderId, payload, idempotencyKey) {
  return axios.post(
    `${API_BASE_URL}/customer-orders/${orderId}/items`,
    payload,
    withIdempotency(idempotencyKey),
  );
}

export function closeCustomerOrder(orderId, payload, idempotencyKey) {
  return axios.post(
    `${API_BASE_URL}/customer-orders/${orderId}/close`,
    payload,
    withIdempotency(idempotencyKey),
  );
}
