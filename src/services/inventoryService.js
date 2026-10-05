import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const INVENTORY_URL = `${API_BASE_URL}/stores/me/inventory`;

function idempotencyHeaders() {
  const key = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `inventory-${Date.now()}`;
  return { 'Idempotency-Key': key };
}

export function getInventorySnapshot() {
  return axios.get(INVENTORY_URL);
}

export function getInventoryMovements() {
  return axios.get(`${INVENTORY_URL}/movements`);
}

export function adjustInventory({ productId, type, quantity, note }) {
  return axios.post(
    `${INVENTORY_URL}/adjustments`,
    { productId, type, quantity, note },
    { headers: idempotencyHeaders() },
  );
}
