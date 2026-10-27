import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

export function listDeliveryOrders() {
  return axios.get(`${API_BASE_URL}/delivery/orders`);
}
