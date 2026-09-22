import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { getDeliveryCustomerToken } from './deliveryCustomerSession';

function customerHeaders() {
  const token = getDeliveryCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function registerDeliveryCustomer(payload) {
  return axios.post(`${API_BASE_URL}/api/public/delivery/auth/register`, payload);
}

export function loginDeliveryCustomer(payload) {
  return axios.post(`${API_BASE_URL}/api/public/delivery/auth/login`, payload);
}

export function getDeliveryCustomerMe() {
  return axios.get(`${API_BASE_URL}/api/public/delivery/account/me`, {
    headers: customerHeaders(),
  });
}

export function listDeliveryCustomerAddresses() {
  return axios.get(`${API_BASE_URL}/api/public/delivery/account/addresses`, {
    headers: customerHeaders(),
  });
}

export function createDeliveryCustomerAddress(payload) {
  return axios.post(`${API_BASE_URL}/api/public/delivery/account/addresses`, payload, {
    headers: customerHeaders(),
  });
}

export function listDeliveryCustomerOrders() {
  return axios.get(`${API_BASE_URL}/api/public/delivery/account/orders`, {
    headers: customerHeaders(),
  });
}
