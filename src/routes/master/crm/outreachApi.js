import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';

export const outreachApi = {
  get: (path) => axios.get(`${API_BASE_URL}/api/crm/outreach${path}`),
  post: (path, body) => axios.post(`${API_BASE_URL}/api/crm/outreach${path}`, body),
};
