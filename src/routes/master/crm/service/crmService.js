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

export function changeCrmLeadStatus(id, status, extras = {}) {
  const body = typeof extras === 'string'
    ? { status, reason: extras }
    : { status, ...extras };
  return axios.patch(`${CRM_URL}/leads/${id}/status`, body);
}

export function confirmCrmLeadSend(id, payload = {}) {
  return axios.post(`${CRM_URL}/leads/${id}/messages/confirm-sent`, payload);
}

export function scheduleCrmLeadAction(id, payload) {
  return axios.post(`${CRM_URL}/leads/${id}/actions`, payload);
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

export function getCrmInstagramTemplates() {
  return axios.get(`${CRM_URL}/instagram/templates`);
}

export function updateCrmInstagramTemplates(payload) {
  return axios.put(`${CRM_URL}/instagram/templates`, payload);
}

export function prepareCrmInstagram(id) {
  return axios.post(`${CRM_URL}/instagram/leads/${id}/prepare`);
}

export function recordCrmInstagramEvent(id, event) {
  return axios.post(`${CRM_URL}/instagram/leads/${id}/events`, { event });
}

export function confirmCrmInstagramSend(id) {
  return axios.post(`${CRM_URL}/instagram/leads/${id}/confirm`);
}

export function registerCrmInstagramResponse(id, notes) {
  return axios.post(`${CRM_URL}/instagram/leads/${id}/response`, { notes });
}

export function scheduleCrmInstagramFollowUp(id, payload) {
  return axios.post(`${CRM_URL}/instagram/leads/${id}/follow-up`, payload);
}

export function getInstagramMessageTemplates() {
  return axios.get(`${CRM_URL}/instagram/message-templates`);
}

export function updateInstagramMessageTemplate(id, content) {
  return axios.put(`${CRM_URL}/instagram/message-templates/${id}`, { content });
}

export function restoreInstagramMessageTemplate(id) {
  return axios.post(`${CRM_URL}/instagram/message-templates/${id}/restore`);
}

export function getInstagramFollowUpSettings() {
  return axios.get(`${CRM_URL}/instagram/follow-up-settings`);
}

export function updateInstagramFollowUpSettings(payload) {
  return axios.put(`${CRM_URL}/instagram/follow-up-settings`, payload);
}

export function getInstagramLeadMessage(id) {
  return axios.get(`${CRM_URL}/instagram/leads/${id}/message`);
}

export function saveInstagramLeadMessage(id, content) {
  return axios.put(`${CRM_URL}/instagram/leads/${id}/message`, { content });
}

export function registerInstagramTouch(id) {
  return axios.post(`${CRM_URL}/instagram/leads/${id}/register-touch`);
}

export function moveInstagramLead(id, payload) {
  return axios.post(`${CRM_URL}/instagram/leads/${id}/move`, payload);
}

export function addInstagramLeadNote(id, content) {
  return axios.post(`${CRM_URL}/instagram/leads/${id}/notes`, { content });
}

export function updateInstagramLeadProfile(id, payload) {
  return axios.put(`${CRM_URL}/instagram/leads/${id}/profile`, payload);
}
