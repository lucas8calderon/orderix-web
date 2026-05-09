import axios from 'axios';
import { API_BASE_URL } from '../../../../../services/apiConfig';

export function getAllCategories() {
    //return axios.get('http://localhost:8080/category/all');
    return axios.get(`${API_BASE_URL}/category/all`);
}
    
export function postNewCategory(category) {
     //return axios.post('http://localhost:8080/category/new', category);    
    return axios.post(`${API_BASE_URL}/category/new`, category);
}

export function deleteCategories(categoryId) {
    //return axios.delete(`http://localhost:8080/category/delete/deleteById?categoryId=${categoryId}`);
    return axios.delete(`${API_BASE_URL}/category/deleteById?categoryId=${categoryId}`);
}   