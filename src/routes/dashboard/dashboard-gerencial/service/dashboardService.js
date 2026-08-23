import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

export function getStoreOverview(period = 'DAYS_7') {
  return axios.get(`${API_BASE_URL}/dashboard/overview`, { params: { period } });
}
