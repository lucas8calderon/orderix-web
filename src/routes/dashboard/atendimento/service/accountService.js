import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';
import { getCurrentUser, getToken, saveSession } from '../../../../services/session';

export function getTableAccount(tableId) {
  return axios.get(`${API_BASE_URL}/tables/${tableId}/orders`);
}

export function closeTableAccount(tableId, payload, idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return axios.post(`${API_BASE_URL}/tables/${tableId}/group-orders/close`, payload, { headers });
}

export function getComandaAccount(comandaId) {
  return axios.get(`${API_BASE_URL}/comandas/${comandaId}/orders`);
}

export function closeComandaAccount(comandaId, payload, idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return axios.post(`${API_BASE_URL}/comandas/${comandaId}/orders/close`, payload, { headers });
}

export function createFloorOrder(tableId, payload, idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return axios.post(`${API_BASE_URL}/tables/${tableId}/orders`, payload, { headers });
}

export async function resolveOperatorWaiterId() {
  const current = getCurrentUser();
  if (current?.waiterId) {
    return current.waiterId;
  }
  const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
  const profile = response.data || {};
  const token = getToken();
  if (token && profile.id) {
    saveSession(token, { ...current, ...profile });
  }
  return profile.waiterId || null;
}

export function closeCounterOrder(orderId, payload, idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return axios.post(`${API_BASE_URL}/counter/orders/${orderId}/close`, payload, { headers });
}
