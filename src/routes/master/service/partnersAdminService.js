import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';

const PARTNERS_URL = `${API_BASE_URL}/api/admin/partners`;

function compactParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export async function listAdminPartners({ status, q, page = 0, size = 20 } = {}) {
  const response = await axios.get(PARTNERS_URL, { params: compactParams({ status, q, page, size }) });
  return response.data;
}

export async function getAdminPartner(id) {
  const response = await axios.get(`${PARTNERS_URL}/${id}`);
  return response.data;
}

export async function updateAdminPartnerStatus(id, { status, reason }) {
  const response = await axios.put(`${PARTNERS_URL}/${id}/status`, {
    status,
    reason: reason?.trim() || undefined,
  });
  return response.data;
}

export async function reviewAdminPartnerPayoutData(id, { status, notes }) {
  const response = await axios.put(`${PARTNERS_URL}/${id}/payout-data`, {
    status,
    notes: notes?.trim() || undefined,
  });
  return response.data;
}

export async function createAdminPartnerPayoutBatch(id) {
  const response = await axios.post(`${PARTNERS_URL}/${id}/payout-batches`);
  return response.data;
}

export async function listAdminPartnerPayoutBatches(id, { page = 0, size = 20 } = {}) {
  const response = await axios.get(`${PARTNERS_URL}/${id}/payout-batches`, { params: { page, size } });
  return response.data;
}

export async function getAdminPayoutTransferConfig() {
  const response = await axios.get(`${PARTNERS_URL}/payout-transfers/config`);
  return response.data;
}

export async function approveAdminPayoutBatch(batchId) {
  const response = await axios.post(`${PARTNERS_URL}/payout-batches/${batchId}/approve`);
  return response.data;
}

export async function rejectAdminPayoutBatch(batchId, { notes } = {}) {
  const response = await axios.post(`${PARTNERS_URL}/payout-batches/${batchId}/reject`, {
    notes: notes?.trim() || undefined,
  });
  return response.data;
}

export async function transferAdminPayoutBatch(batchId) {
  const response = await axios.post(`${PARTNERS_URL}/payout-batches/${batchId}/transfer`);
  return response.data;
}

export async function listAdminPartnerReferrals(id, { status, q, page = 0, size = 10 } = {}) {
  const response = await axios.get(`${PARTNERS_URL}/${id}/referrals`, {
    params: compactParams({ status, q, page, size }),
  });
  return response.data;
}

export async function listAdminPartnerCommissions(id, { page = 0, size = 10 } = {}) {
  const response = await axios.get(`${PARTNERS_URL}/${id}/commissions`, { params: { page, size } });
  return response.data;
}

export async function listAdminPartnerPayouts(id, { page = 0, size = 10 } = {}) {
  const response = await axios.get(`${PARTNERS_URL}/${id}/payouts`, { params: { page, size } });
  return response.data;
}

export async function authorizeAdminPartnerRecovery(id) {
  const response = await axios.post(`${PARTNERS_URL}/${id}/recovery/authorize`);
  return response.data;
}
