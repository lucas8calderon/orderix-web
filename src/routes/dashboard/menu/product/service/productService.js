import axios from 'axios';
import { API_BASE_URL } from '../../../../../services/apiConfig';

export function getAllProducts() {
  return axios.get(`${API_BASE_URL}/product/all`);
}

export function getProductsFromCategory(categoryId) {
  if (categoryId == null) {
    return axios.get(`${API_BASE_URL}/product/getByCategoryId`);
  }
  return axios.get(`${API_BASE_URL}/product/getByCategoryId?categoryId=${categoryId}`);
}

export function addNewProduct(product) {
  return axios.post(`${API_BASE_URL}/product/new`, product);
}

export function updateProduct(productId, product) {
  return axios.put(`${API_BASE_URL}/product/update?productId=${productId}`, product);
}

export function deleteProduct(productId) {
  return axios.delete(`${API_BASE_URL}/product/delete?productId=${productId}`);
}
