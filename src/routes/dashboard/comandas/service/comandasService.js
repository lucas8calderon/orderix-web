import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

export function getComandas() {
  return axios.get(`${API_BASE_URL}/comandas/all`);
}

export function saveComanda(comanda) {
  return axios.post(`${API_BASE_URL}/comandas/new`, comanda);
}

export function deleteComanda(id) {
  return axios.delete(`${API_BASE_URL}/comandas/delete?comandaId=${id}`);
}
