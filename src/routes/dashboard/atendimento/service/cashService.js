import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

function withIdempotency(idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return { headers };
}

export function newCashKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `cash-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Caixa aberto da loja, ou null quando está fechado (204). */
export async function getCurrentCash() {
  const response = await axios.get(`${API_BASE_URL}/cash-sessions/current`);
  return response.status === 204 ? null : response.data || null;
}

export function openCash(payload, idempotencyKey) {
  return axios.post(`${API_BASE_URL}/cash-sessions`, payload, withIdempotency(idempotencyKey));
}

export function addCashMovement(sessionId, payload, idempotencyKey) {
  return axios.post(`${API_BASE_URL}/cash-sessions/${sessionId}/movements`, payload, withIdempotency(idempotencyKey));
}

export function closeCash(sessionId, payload, idempotencyKey) {
  return axios.post(`${API_BASE_URL}/cash-sessions/${sessionId}/close`, payload, withIdempotency(idempotencyKey));
}

export function listCashSessions({ page, size } = {}) {
  return axios.get(`${API_BASE_URL}/cash-sessions`, { params: { page, size } });
}

export function getCashSession(sessionId) {
  return axios.get(`${API_BASE_URL}/cash-sessions/${sessionId}`);
}
