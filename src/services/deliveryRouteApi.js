import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

function idempotencyHeaders(idempotencyKey) {
  return idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;
}

export function listDeliveryRoutes() {
  return axios.get(`${API_BASE_URL}/delivery/routes`);
}

export function getDeliveryRoute(routeId) {
  return axios.get(`${API_BASE_URL}/delivery/routes/${routeId}`);
}

export function createDeliveryRoute(body, idempotencyKey) {
  return axios.post(`${API_BASE_URL}/delivery/routes`, body, idempotencyHeaders(idempotencyKey));
}

export function confirmDeliveryRoute(routeId, idempotencyKey) {
  return axios.post(`${API_BASE_URL}/delivery/routes/${routeId}/confirm`, {}, idempotencyHeaders(idempotencyKey));
}

export function cancelDeliveryRoute(routeId, idempotencyKey) {
  return axios.post(`${API_BASE_URL}/delivery/routes/${routeId}/cancel`, {}, idempotencyHeaders(idempotencyKey));
}

export function getPublicDeliveryRoute(token) {
  return axios.get(`${API_BASE_URL}/api/public/routes/${encodeURIComponent(token)}`);
}

export function confirmPublicDeliveryStop(token, stopId, body, idempotencyKey) {
  return axios.post(
    `${API_BASE_URL}/api/public/routes/${encodeURIComponent(token)}/stops/${stopId}/confirm`,
    body,
    idempotencyHeaders(idempotencyKey),
  );
}

export function newIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : ((random % 4) + 8);
    return value.toString(16);
  });
}

export function apiErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}
