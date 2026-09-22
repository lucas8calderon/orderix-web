import axios from 'axios';
import { getToken, clearSession, getCurrentUser, saveSession } from './session';
import { PATHS } from './accessControl';
import { clearDeliveryCustomerSession, getDeliveryCustomerToken } from './deliveryCustomerSession';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 15000;

function isPublicDeliveryApi(config) {
  const url = `${config?.baseURL || ''}${config?.url || ''}`;
  return url.includes('/api/public/delivery');
}

axios.interceptors.request.use((config) => {
  if (isPublicDeliveryApi(config)) {
    const customerToken = getDeliveryCustomerToken();
    if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }
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
      if (isPublicDeliveryApi(error.config || {})) {
        clearDeliveryCustomerSession();
        return Promise.reject(error);
      }
      clearSession();
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const stayOnPage = [PATHS.LOGIN, PATHS.HOME, PATHS.PRIVACY, PATHS.FORGOT_PASSWORD, PATHS.TERMS];
        const isPublicMenu = path === PATHS.PUBLIC_MENU || path.startsWith(`${PATHS.PUBLIC_MENU}/`);
        const isPublicDelivery = path === PATHS.PUBLIC_DELIVERY || path.startsWith(`${PATHS.PUBLIC_DELIVERY}/`);
        if (!stayOnPage.includes(path) && !isPublicMenu && !isPublicDelivery) {
          window.location.assign(PATHS.LOGIN);
        }
      }
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
      if (typeof window !== 'undefined' && window.location.pathname !== PATHS.SUBSCRIPTION_BLOCKED) {
        const path = window.location.pathname;
        const onPublicMenu = path === PATHS.PUBLIC_MENU || path.startsWith(`${PATHS.PUBLIC_MENU}/`);
        const onPublicDelivery = path === PATHS.PUBLIC_DELIVERY || path.startsWith(`${PATHS.PUBLIC_DELIVERY}/`);
        if (!onPublicMenu && !onPublicDelivery) {
          window.location.assign(PATHS.SUBSCRIPTION_BLOCKED);
        }
      }
    }
    return Promise.reject(error);
  }
);
