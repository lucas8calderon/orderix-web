import axios from 'axios';
import { API_BASE_URL } from '../../../../../services/apiConfig';

export function getProductsFromCategory(categoryId) {
    //return axios.post(`http://localhost:8080/product/new`, product);
    return axios.get(`${API_BASE_URL}/product/getByCategoryId?categoryId=${categoryId}`);
}

export function addNewProduct(product) {
    //return axios.post(`http://localhost:8080/product/new`, product);    
    return axios.post(`${API_BASE_URL}/product/new`, product);
}

export function deleteProduct(productId) {
    //return axios.post(`http://localhost:8080/product/delete?productId=${productId}`);
    return axios.delete(`${API_BASE_URL}/product/delete?productId=${productId}`);
}