import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { ROLES } from './accessControl';
import { clearSession, getCurrentUser, getToken, saveSession } from './session';
import { phoneDigits } from '../utils/phoneInput';

const PUBLIC_URL = `${API_BASE_URL}/api/public/partner`;
const PORTAL_URL = `${API_BASE_URL}/api/partner`;

export const PARTNER_PASSWORD_HINT =
  'Entre 8 e 72 caracteres, com pelo menos uma letra e um número.';

/** Mesma regra do backend (PartnerPasswordPolicy). */
export function isValidPartnerPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 72) return false;
  return /[A-Za-zÀ-ÿ]/.test(password) && /\d/.test(password);
}

/** Mensagem da API quando houver; senão o texto de contingência. */
export function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const message = typeof data === 'string' ? data : data?.message;
  if (typeof message === 'string' && message.trim()) return message.trim();
  if (error?.code === 'ECONNABORTED' || error?.message === 'Network Error') {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  }
  return fallback;
}

/** Dígitos para o payload. O backend normaliza para E.164. */
export function toWhatsappPayload(value) {
  return phoneDigits(value, { maxDigits: 13 });
}

/** +5511999998888 / 5511999998888 / 11999998888 → (11) 99999-8888 */
export function formatWhatsappDisplay(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) digits = digits.slice(2);
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value || '—';
}

export function partnerFullName(partner) {
  return [partner?.firstName, partner?.lastName].filter(Boolean).join(' ').trim();
}

/** Usuário de sessão (weper.user) a partir do PartnerSessionDTO. */
export function buildPartnerSessionUser(session) {
  return {
    id: session.userId,
    userId: session.userId,
    partnerId: session.partnerId,
    name: partnerFullName(session),
    firstName: session.firstName,
    lastName: session.lastName,
    whatsapp: session.whatsapp,
    referralCode: session.referralCode,
    status: session.status,
    phoneVerified: Boolean(session.phoneVerified),
    tokenType: session.tokenType || 'Bearer',
    expiresIn: session.expiresIn,
    role: ROLES.PARTNER,
  };
}

/* ------------------------------ público ------------------------------ */

export async function registerPartner(form) {
  const response = await axios.post(`${PUBLIC_URL}/register`, {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    whatsapp: toWhatsappPayload(form.whatsapp),
    password: form.password,
    confirmPassword: form.confirmPassword,
    acceptTerms: Boolean(form.acceptTerms),
    acceptPrivacy: Boolean(form.acceptPrivacy),
  });
  return response.data;
}

export async function loginPartner(whatsapp, password) {
  const response = await axios.post(`${PUBLIC_URL}/auth/login`, {
    whatsapp: toWhatsappPayload(whatsapp),
    password,
  });
  const session = response.data;
  if (!session?.token || (session.role && session.role !== ROLES.PARTNER)) {
    throw new Error('Resposta de login inválida para a Área de Parceiros.');
  }
  const user = buildPartnerSessionUser(session);
  saveSession(session.token, user);
  return user;
}

export function logoutPartner() {
  clearSession();
}

export async function requestPartnerRecovery(whatsapp) {
  const response = await axios.post(`${PUBLIC_URL}/password/recovery-request`, {
    whatsapp: toWhatsappPayload(whatsapp),
  });
  return response.data;
}

export async function resetPartnerPassword({ token, newPassword, confirmPassword }) {
  await axios.post(`${PUBLIC_URL}/password/reset`, {
    token: token.trim(),
    newPassword,
    confirmPassword,
  });
}

/* ------------------------------ portal ------------------------------- */

/** Atualiza o weper.user sem tocar no token. */
export function syncPartnerSessionUser(profile) {
  const token = getToken();
  const current = getCurrentUser();
  if (!token || !current || current.role !== ROLES.PARTNER || !profile) return;
  saveSession(token, {
    ...current,
    firstName: profile.firstName ?? current.firstName,
    lastName: profile.lastName ?? current.lastName,
    name: partnerFullName(profile) || current.name,
    whatsapp: profile.whatsapp ?? current.whatsapp,
    referralCode: profile.referralCode ?? current.referralCode,
    status: profile.status ?? current.status,
    phoneVerified: profile.phoneVerified ?? current.phoneVerified,
  });
}

export async function getPartnerProfile() {
  const response = await axios.get(`${PORTAL_URL}/me`);
  return response.data;
}

export async function updatePartnerProfile({ firstName, lastName, whatsapp }) {
  const response = await axios.put(`${PORTAL_URL}/me`, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    whatsapp: toWhatsappPayload(whatsapp),
  });
  syncPartnerSessionUser(response.data);
  return response.data;
}

export async function changePartnerPassword({ currentPassword, newPassword, confirmPassword }) {
  await axios.post(`${PORTAL_URL}/me/password`, { currentPassword, newPassword, confirmPassword });
}

export async function getPartnerDashboard() {
  const response = await axios.get(`${PORTAL_URL}/dashboard`);
  return response.data;
}

export const EARNINGS_RANGES = ['6m', '12m', 'ytd'];

export async function getPartnerEarnings(range = '6m') {
  const safe = EARNINGS_RANGES.includes(range) ? range : '6m';
  const response = await axios.get(`${PORTAL_URL}/earnings`, { params: { range: safe } });
  return response.data;
}

function compactParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export async function listPartnerReferrals({ status, from, to, name, page = 0, size = 10 } = {}) {
  const response = await axios.get(`${PORTAL_URL}/referrals`, {
    params: compactParams({ status, from, to, name, page, size }),
  });
  return response.data;
}

export async function createPartnerReferral(form) {
  const response = await axios.post(`${PORTAL_URL}/referrals`, {
    establishmentName: form.establishmentName.trim(),
    contactName: form.contactName?.trim() || undefined,
    commercialWhatsapp: toWhatsappPayload(form.commercialWhatsapp) || undefined,
    segment: form.segment?.trim() || undefined,
    notes: form.notes?.trim() || undefined,
    consentToProcessData: Boolean(form.consentToProcessData),
  });
  return response.data;
}

export async function listPartnerCommissions({ page = 0, size = 10 } = {}) {
  const response = await axios.get(`${PORTAL_URL}/commissions`, { params: { page, size } });
  return response.data;
}

export async function listPartnerPayouts({ page = 0, size = 10 } = {}) {
  const response = await axios.get(`${PORTAL_URL}/payouts`, { params: { page, size } });
  return response.data;
}

export async function getPartnerPayout(id) {
  const response = await axios.get(`${PORTAL_URL}/payouts/${id}`);
  return response.data;
}

/** Resposta paginada vazia, para estados iniciais. */
export const EMPTY_PAGE = Object.freeze({
  items: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
});
