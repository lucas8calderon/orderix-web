import axios from 'axios';
import { getToken, clearSession, getCurrentUser, saveSession } from './session';
import { PATHS, isPartnerAreaPath, isPublicPath, normalizePath } from './accessControl';
import { clearDeliveryCustomerSession, getDeliveryCustomerToken } from './deliveryCustomerSession';
import { publishSubscriptionNotice } from './subscriptionNotice';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 15000;

/** Só o save de configurações. O restante continua no timeout de 15s. */
export const SETTINGS_SAVE_TIMEOUT_MS = 60000;

function isPublicPartnerApi(config) {
  const url = `${config?.baseURL || ''}${config?.url || ''}`;
  return url.includes('/api/public/partner');
}

function isPublicDeliveryApi(config) {
  const url = `${config?.baseURL || ''}${config?.url || ''}`;
  return url.includes('/api/public/delivery');
}

function isPublicBillingApi(config) {
  const url = `${config?.baseURL || ''}${config?.url || ''}`;
  return url.includes('/api/public/billing');
}

axios.interceptors.request.use((config) => {
  if (isPublicPartnerApi(config) || isPublicBillingApi(config)) {
    // Contratação e parceiro públicos não carregam JWT de outra sessão.
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }
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

function isStoreApi(config) {
  const url = String(config?.url || '');
  return url.startsWith('/api/') && !url.includes('/api/public/');
}

function subscriptionDenialKind(message) {
  if (typeof message !== 'string') {
    return null;
  }
  const text = message.toLowerCase();
  if (text.includes('mensalidade')) {
    return 'limited';
  }
  if (text.includes('assinatura')) {
    return 'blocked';
  }
  return null;
}

axios.interceptors.response.use(
  (response) => {
    if (isStoreApi(response?.config)) {
      const header = response.headers?.['x-subscription-notice'];
      publishSubscriptionNotice(typeof header === 'string' ? header : '');
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (isPublicPartnerApi(error.config || {}) || isPublicBillingApi(error.config || {})) {
        // Falha anônima na contratação/parceiro: não manda para /login.
        return Promise.reject(error);
      }
      if (isPublicDeliveryApi(error.config || {})) {
        clearDeliveryCustomerSession();
        return Promise.reject(error);
      }
      clearSession();
      if (typeof window !== 'undefined') {
        const path = normalizePath(window.location.pathname);
        if (!isPublicPath(path)) {
          window.location.assign(isPartnerAreaPath(path) ? PATHS.PARTNERS_LOGIN : PATHS.LOGIN);
        }
      }
    }
    const denial = error.response?.status === 403
      ? subscriptionDenialKind(error.response.data?.message)
      : null;
    if (denial) {
      const token = getToken();
      const user = getCurrentUser();
      if (token && user) {
        saveSession(token, {
          ...user,
          subscriptionActive: false,
          subscriptionStatus: denial === 'limited' ? 'BLOCKED' : (user.subscriptionStatus || 'BLOCKED'),
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
