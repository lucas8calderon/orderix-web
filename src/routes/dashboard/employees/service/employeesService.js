import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

export function getEmployees() {
  return axios.get(`${API_BASE_URL}/employees/all`);
}

export function saveEmployee(employee) {
  return axios.post(`${API_BASE_URL}/employees/new`, employee);
}

export function deleteEmployee(id) {
  return axios.delete(`${API_BASE_URL}/employees/delete?employeeId=${id}`);
}

export function updateEmployee(employee) {
  return axios.put(`${API_BASE_URL}/employees/update`, employee);
}

