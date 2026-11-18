import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { WHATSAPP_NUMBER } from '../routes/home/landingAssets';

const BASE = `${API_BASE_URL}/api/onboarding`;

export const ONBOARDING_SUPPORT_MESSAGE =
  'Olá! Acabei de começar a utilizar a Weper e gostaria de ajuda com a configuração inicial da minha loja.';

/** WhatsApp oficial da Weper (número centralizado da landing), sem dados da loja na mensagem. */
export function onboardingSupportUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(ONBOARDING_SUPPORT_MESSAGE)}`;
}

export async function getOnboardingStatus() {
  const response = await axios.get(`${BASE}/status`);
  return response.data;
}

export async function startOnboarding() {
  const response = await axios.post(`${BASE}/start`);
  return response.data;
}

export async function saveOnboardingProgress(step) {
  const response = await axios.patch(`${BASE}/progress`, { step });
  return response.data;
}

export async function completeOnboarding() {
  const response = await axios.post(`${BASE}/complete`);
  return response.data;
}

export async function dismissOnboarding() {
  const response = await axios.post(`${BASE}/dismiss`);
  return response.data;
}

export async function getOnboardingChecklist() {
  const response = await axios.get(`${BASE}/checklist`);
  return response.data;
}

export async function dismissOnboardingChecklist() {
  const response = await axios.post(`${BASE}/checklist/dismiss`);
  return response.data;
}

export async function reopenOnboardingChecklist() {
  const response = await axios.post(`${BASE}/checklist/reopen`);
  return response.data;
}

export async function acknowledgeOnboardingChecklist() {
  const response = await axios.post(`${BASE}/checklist/acknowledge`);
  return response.data;
}
