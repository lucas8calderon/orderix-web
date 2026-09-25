import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const ADMIN_URL = `${API_BASE_URL}/stores/me/delivery/neighborhoods`;

export function listStoreNeighborhoods(query) {
  const params = query ? { q: query } : {};
  return axios.get(ADMIN_URL, { params });
}

export function createStoreNeighborhood(payload) {
  return axios.post(ADMIN_URL, payload);
}

export function updateStoreNeighborhood(id, payload) {
  return axios.put(`${ADMIN_URL}/${encodeURIComponent(id)}`, payload);
}

export function deleteStoreNeighborhood(id) {
  return axios.delete(`${ADMIN_URL}/${encodeURIComponent(id)}`);
}

export function listPublicNeighborhoods(slug, { state, city } = {}) {
  return axios.get(
    `${API_BASE_URL}/api/public/delivery/${encodeURIComponent(slug)}/neighborhoods`,
    { params: { state, city } }
  );
}
