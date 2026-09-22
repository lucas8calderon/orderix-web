import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

const CRM_URL = `${API_BASE_URL}/api/crm`;

export function getCrmLeads(params = {}) {
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = value;
    }
  });
  return axios.get(`${CRM_URL}/leads`, { params: query });
}

export function getCrmLeadsPage(params = {}) {
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = value;
    }
  });
  return axios.get(`${CRM_URL}/lead-pages`, { params: query });
}

export function searchCrmProspecting(payload) {
  return axios.post(`${CRM_URL}/prospecting/search`, payload || {});
}

export function importCrmProspecting(payload) {
  return axios.post(`${CRM_URL}/prospecting/import`, payload || {});
}

export function getCrmProspectingUsage() {
  return axios.get(`${CRM_URL}/prospecting/usage`);
}

export function getCrmLead(id) {
  return axios.get(`${CRM_URL}/leads/${id}`);
}

export function getCrmMetrics() {
  return axios.get(`${CRM_URL}/metrics`);
}

export function getCrmWhatsAppTemplate() {
  return axios.get(`${CRM_URL}/whatsapp-template`);
}

export function createCrmLead(payload) {
  return axios.post(`${CRM_URL}/leads`, payload);
}

export function updateCrmLead(id, payload) {
  return axios.put(`${CRM_URL}/leads/${id}`, payload);
}

export function changeCrmLeadStatus(id, status, reason) {
  return axios.patch(`${CRM_URL}/leads/${id}/status`, { status, reason });
}

export function registerCrmContact(id, payload) {
  return axios.post(`${CRM_URL}/leads/${id}/contacts`, payload);
}

export function getCrmLeadActivities(id, page = 0, size = 50) {
  return axios.get(`${CRM_URL}/leads/${id}/activities`, { params: { page, size } });
}

export function archiveCrmLead(id) {
  return axios.delete(`${CRM_URL}/leads/${id}`);
}
