import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';

const STORES_URL = `${API_BASE_URL}/api/stores`;

export function getStores() {
  return axios.get(STORES_URL);
}

export function getStoreById(id) {
  return axios.get(`${STORES_URL}/${id}`);
}

export function getStoresDashboard() {
  return axios.get(`${STORES_URL}/dashboard`);
}

export function createStore(payload) {
  return axios.post(STORES_URL, payload);
}

export function updateStore(id, payload) {
  return axios.put(`${STORES_URL}/${id}`, payload);
}
