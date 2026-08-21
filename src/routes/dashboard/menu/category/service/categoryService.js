import axios from 'axios';
import { API_BASE_URL } from '../../../../../services/apiConfig';

export function getAllCategories() {
  return axios.get(`${API_BASE_URL}/category/all`);
}

export function postNewCategory(category) {
  return axios.post(`${API_BASE_URL}/category/new`, category);
}

export function updateCategory(categoryId, category) {
  return axios.put(`${API_BASE_URL}/category/update?categoryId=${categoryId}`, category);
}

export function deleteCategories(categoryId) {
  return axios.delete(`${API_BASE_URL}/category/deleteById?categoryId=${categoryId}`);
}
