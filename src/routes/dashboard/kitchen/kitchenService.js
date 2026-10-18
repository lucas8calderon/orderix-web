import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';

export function getKitchenOrders() {
  return axios.get(`${API_BASE_URL}/kitchen/orders`);
}

export function updateKitchenOrderStatus(orderId, kitchenStatus) {
  return axios.patch(`${API_BASE_URL}/kitchen/orders/${orderId}/status`, {
    kitchenStatus,
  });
}

export function refundOnlinePayment(orderId) {
  return axios.post(`${API_BASE_URL}/payments/orders/${orderId}/refund`);
}
