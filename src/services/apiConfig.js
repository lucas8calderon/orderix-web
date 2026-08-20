import axios from 'axios';
import { getToken, clearSession, getCurrentUser, saveSession } from './session';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
    }
    if (
      error.response
      && error.response.status === 403
      && typeof error.response.data?.message === 'string'
      && error.response.data.message.toLowerCase().includes('assinatura')
    ) {
      const token = getToken();
      const user = getCurrentUser();
      if (token && user) {
        saveSession(token, {
          ...user,
          subscriptionActive: false,
          subscriptionStatus: user.subscriptionStatus || 'BLOCKED',
        });
      }
      if (typeof window !== 'undefined' && !window.location.pathname.includes('subscription-blocked')) {
        window.location.assign('/subscription-blocked');
      }
    }
    return Promise.reject(error);
  }
);
