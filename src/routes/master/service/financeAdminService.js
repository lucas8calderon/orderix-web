import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';

const GATEWAYS_URL = `${API_BASE_URL}/api/admin/billing/gateways`;
const FINANCE_URL = `${API_BASE_URL}/api/admin/partners`;

/** Mensalidades Pix (Mercado Pago). Filtros vazios não são enviados. */
export async function listPixInvoices(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') params[key] = value;
  });
  const response = await axios.get(`${API_BASE_URL}/api/admin/billing/invoices`, { params });
  return response.data;
}

export async function getGatewaySettings() {
  const response = await axios.get(GATEWAYS_URL);
  return response.data;
}

export async function saveGatewaySettings(payload) {
  const response = await axios.put(GATEWAYS_URL, payload);
  return response.data;
}

export async function testGatewayConnection() {
  const response = await axios.post(`${GATEWAYS_URL}/test`);
  return response.data;
}

export async function testSaasMercadoPago() {
  const response = await axios.post(`${GATEWAYS_URL}/mercadopago/test`);
  return response.data;
}

export async function startSaasMercadoPagoOAuth() {
  const response = await axios.post(`${GATEWAYS_URL}/mercadopago/oauth/start`);
  return response.data;
}

export async function completeSaasMercadoPagoOAuth(code, state) {
  const response = await axios.post(`${GATEWAYS_URL}/mercadopago/oauth/complete`, { code, state });
  return response.data;
}

export async function disconnectSaasMercadoPagoOAuth() {
  const response = await axios.delete(`${GATEWAYS_URL}/mercadopago/oauth`);
  return response.data;
}

export async function getFinanceSummary() {
  const response = await axios.get(`${FINANCE_URL}/finance/summary`);
  return response.data;
}

export async function getFinanceRows(params) {
  const response = await axios.get(`${FINANCE_URL}/finance/rows`, { params });
  return response.data;
}

export async function downloadFinanceCsv(params) {
  const response = await axios.get(`${FINANCE_URL}/finance/export`, { params, responseType: 'blob' });
  return response.data;
}

export async function updatePartnerPercent(partnerId, percent, note) {
  await axios.put(`${FINANCE_URL}/${partnerId}/commission-percent`, { percent, note });
}

export async function blockPartnerPayouts(partnerId, blocked) {
  await axios.post(`${FINANCE_URL}/${partnerId}/payouts/block`, { blocked });
}

export async function openManualPayout(partnerId, commissionId, idempotencyKey) {
  const response = await axios.post(`${FINANCE_URL}/payouts/manual`, { partnerId, commissionId }, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return response.data;
}

export async function confirmManualPayout(payoutId, pixIdentifier, receiptRef) {
  const response = await axios.post(`${FINANCE_URL}/payouts/${payoutId}/confirm`, { pixIdentifier, receiptRef });
  return response.data;
}

export async function failManualPayout(payoutId, reason) {
  const response = await axios.post(`${FINANCE_URL}/payouts/${payoutId}/fail`, { reason });
  return response.data;
}
