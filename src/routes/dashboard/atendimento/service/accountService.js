import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

export function getTableAccount(tableId) {
  return axios.get(`${API_BASE_URL}/tables/${tableId}/orders`);
}

export function closeTableAccount(tableId, payload) {
  return axios.post(`${API_BASE_URL}/tables/${tableId}/group-orders/close`, payload);
}

export function getComandaAccount(comandaId) {
  return axios.get(`${API_BASE_URL}/comandas/${comandaId}/orders`);
}

export function closeComandaAccount(comandaId, payload) {
  return axios.post(`${API_BASE_URL}/comandas/${comandaId}/orders/close`, payload);
}
