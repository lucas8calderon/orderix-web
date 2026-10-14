import { CRM_STATUSES } from './crmConstants';

const METRIC_KEYS = {
  NO_WHATSAPP: 'noWhatsApp',
  NEW: 'newLeads',
  CONTACTED: 'contacted',
  WAITING_RESPONSE: 'waitingResponse',
  INTERESTED: 'interested',
  DEMO: 'demos',
  PROPOSAL: 'proposals',
  WON: 'won',
  LOST: 'lost',
};

export const CRM_STATUS_CHART_COLORS = {
  NO_WHATSAPP: '#64748B',
  NEW: '#2563EB',
  CONTACTED: '#0891B2',
  WAITING_RESPONSE: '#D97706',
  INTERESTED: '#7C3AED',
  DEMO: '#4F46E5',
  PROPOSAL: '#0F766E',
  WON: '#059669',
  LOST: '#DC2626',
};

export function statusChartRows(metrics) {
  const data = metrics || {};
  const total = CRM_STATUSES.reduce((sum, status) => sum + Number(data[METRIC_KEYS[status.id]] || 0), 0);
  return CRM_STATUSES.map((status) => {
    const value = Number(data[METRIC_KEYS[status.id]] || 0);
    const share = total === 0 ? 0 : Math.round((value / total) * 100);
    return {
      id: status.id,
      name: status.label,
      value,
      share,
      color: CRM_STATUS_CHART_COLORS[status.id] || '#64748B',
    };
  });
}
