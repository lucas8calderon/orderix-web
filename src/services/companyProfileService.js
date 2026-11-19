import axios from 'axios';
import { API_BASE_URL, SETTINGS_SAVE_TIMEOUT_MS } from './apiConfig';
import { formatCnpjInput, isValidCnpj } from '../utils/cnpjInput';
import { formatStoreWhatsAppInput, normalizeStoreWhatsApp } from '../utils/phoneInput';

const COMPANY_URL = `${API_BASE_URL}/stores/me/company`;
const NAME_MAX = 160;
const ADDRESS_MAX = 512;

export function getCompanyProfile() {
  return axios.get(COMPANY_URL, { timeout: 60000 });
}

export function updateCompanyProfile(payload) {
  return axios.put(COMPANY_URL, payload, { timeout: SETTINGS_SAVE_TIMEOUT_MS });
}

export function toCompanyProfileUi(data = {}) {
  return {
    companyName: data.companyName || '',
    cnpj: formatCnpjInput(data.cnpj || ''),
    address: data.address || '',
    phone: formatStoreWhatsAppInput(data.phone || ''),
  };
}

export function toCompanyProfilePayload(ui = {}) {
  return {
    companyName: String(ui.companyName ?? '').trim(),
    cnpj: String(ui.cnpj ?? '').trim(),
    address: String(ui.address ?? '').trim(),
    phone: String(ui.phone ?? '').trim(),
  };
}

export function companyProfileError(company) {
  const name = String(company?.companyName ?? '').trim();
  if (name.length > NAME_MAX) {
    return 'O nome da empresa pode ter no máximo 160 caracteres.';
  }
  const address = String(company?.address ?? '').trim();
  if (address.length > ADDRESS_MAX) {
    return 'O endereço pode ter no máximo 512 caracteres.';
  }
  const cnpj = String(company?.cnpj ?? '').replace(/\D/g, '');
  if (cnpj && !isValidCnpj(cnpj)) {
    return 'Informe um CNPJ válido.';
  }
  const phone = normalizeStoreWhatsApp(company?.phone);
  if (phone && !/^\d{10,11}$/.test(phone)) {
    return 'Informe um telefone válido com DDD.';
  }
  return '';
}

function digits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/** Confere se a resposta trouxe o que foi enviado, já normalizado. */
export function companyProfileEchoes(sent, received) {
  const name = String(sent?.companyName ?? '').trim();
  const address = String(sent?.address ?? '').trim();
  return String(received?.companyName ?? '').trim() === name
    && String(received?.address ?? '').trim() === address
    && digits(received?.cnpj) === digits(sent?.cnpj)
    && digits(received?.phone) === digits(sent?.phone);
}
