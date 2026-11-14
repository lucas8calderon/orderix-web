import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { saveSession, clearSession, getCurrentUser } from './session';
import { getPostLoginPath } from './accessControl';

/** A API gratuita de homologação dorme e pode levar mais de um minuto para responder. */
const STAGING_API_HOST = 'weper-staging-api.onrender.com';
const STAGING_LOGIN_TIMEOUT_MS = 120000;
const DEFAULT_LOGIN_TIMEOUT_MS = 15000;

export function resolveLoginTimeoutMs(apiBaseUrl = API_BASE_URL) {
  return String(apiBaseUrl || '').includes(STAGING_API_HOST)
    ? STAGING_LOGIN_TIMEOUT_MS
    : DEFAULT_LOGIN_TIMEOUT_MS;
}

export async function login(email, password) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email,
    password,
  }, { timeout: resolveLoginTimeoutMs() });
  const { token, user } = response.data;
  saveSession(token, user);
  return user;
}

export function logout() {
  clearSession();
}

export function resolveHomePath(user = getCurrentUser()) {
  return getPostLoginPath(user);
}

export { getCurrentUser };

export default login;
