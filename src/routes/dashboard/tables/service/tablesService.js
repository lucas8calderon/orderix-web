import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

export function getTables() {
  //return axios.get('http://localhost:8080/tables/all');
  return axios.get(`${API_BASE_URL}/tables/all`);
}

export function saveTable(table) {
  //return axios.post('http://localhost:8080/tables/new', table);
  return axios.post(`${API_BASE_URL}/tables/new`, table);
}

export function deleteTable(id) {
  //return axios.delete(`http://localhost:8080/tables/delete?tableId=${id}`);
  return axios.delete(`${API_BASE_URL}/tables/delete?tableId=${id}`);
}