import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const PUBLIC_MENU_SETTINGS_URL = `${API_BASE_URL}/stores/me/public-menu`;

export function getPublicMenuSettings() {
  return axios.get(PUBLIC_MENU_SETTINGS_URL);
}

export function updatePublicMenuSettings(payload) {
  return axios.put(PUBLIC_MENU_SETTINGS_URL, payload);
}

export function getPublicMenuBySlug(slug, { etag } = {}) {
  const headers = {};
  if (etag) {
    headers['If-None-Match'] = etag;
  }
  return axios.get(`${API_BASE_URL}/api/public/menu/${encodeURIComponent(slug)}`, {
    headers,
    validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
  });
}

export function buildPublicMenuUrl(slug, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  if (!slug) return '';
  const base = (origin || '').replace(/\/$/, '');
  return `${base}/cardapio/${encodeURIComponent(slug)}`;
}
