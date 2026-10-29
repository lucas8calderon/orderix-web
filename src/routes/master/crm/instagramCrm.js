export const INSTAGRAM_COLUMNS = [
  { id: 'NEW', label: 'Novo Lead' },
  { id: 'CONTACTED', label: 'Contatado' },
  { id: 'WAITING_RESPONSE', label: 'Aguardando Retorno' },
  { id: 'NEGOTIATING', label: 'Em Negociação' },
  { id: 'WON', label: 'Convertido' },
  { id: 'NO_RESPONSE', label: 'Sem Resposta' },
  { id: 'LOST', label: 'Descartado' },
];

export const INSTAGRAM_LEAD_KINDS = [
  { id: 'INFLUENCER', label: 'Criador de Conteúdo / Influenciador' },
  { id: 'ESTABLISHMENT', label: 'Estabelecimento Comercial' },
  { id: 'FREE_PARTNERSHIP', label: 'Parceria Gratuita para Estabelecimento' },
];

const LEGACY_COLUMN = {
  NO_WHATSAPP: 'NEW',
  INTERESTED: 'NEGOTIATING',
  DEMO: 'NEGOTIATING',
  PROPOSAL: 'NEGOTIATING',
};

export function columnOf(status) {
  if (!status) return 'NEW';
  return LEGACY_COLUMN[status] || status;
}

export function kindLabel(kind) {
  return INSTAGRAM_LEAD_KINDS.find((item) => item.id === kind)?.label || 'Estabelecimento Comercial';
}

export function renderProspectMessage(template, name, instagram) {
  const text = template == null ? '' : String(template);
  const safeName = name == null ? '' : String(name).trim();
  const safeInstagram = instagram == null ? '' : String(instagram).trim();
  return text.split('{nome}').join(safeName).split('{instagram}').join(safeInstagram);
}

export function toneOf(lead) {
  if (lead?.prospectTone) return lead.prospectTone;
  return 'NONE';
}

export function toneColor(tone) {
  if (tone === 'OVERDUE') return '#DC2626';
  if (tone === 'DUE_SOON') return '#D97706';
  if (tone === 'ON_TIME') return '#15803D';
  return '#6B7280';
}

export function flagOf(lead) {
  if (lead?.prospectFlag) return lead.prospectFlag;
  return '';
}

export function timeInStage(lead, now = new Date()) {
  const start = parseWhen(lead?.statusChangedAt || lead?.createdAt);
  if (!start) return '';
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  if (days <= 0) return 'Entrou hoje';
  if (days === 1) return 'Há 1 dia nesta etapa';
  return `Há ${days} dias nesta etapa`;
}

export function compareUrgency(a, b) {
  const rank = { OVERDUE: 0, DUE_SOON: 1, ON_TIME: 2, NONE: 3 };
  const left = rank[toneOf(a)] ?? 3;
  const right = rank[toneOf(b)] ?? 3;
  if (left !== right) return left - right;
  const aTime = parseWhen(a?.nextContactAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const bTime = parseWhen(b?.nextContactAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return aTime - bTime;
}

export function isOverdue(lead) {
  return toneOf(lead) === 'OVERDUE';
}

export function withinCreatedRange(lead, from, to) {
  if (!from && !to) return true;
  const created = parseWhen(lead?.createdAt);
  if (!created) return false;
  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (created < start) return false;
  }
  if (to) {
    const end = new Date(`${to}T23:59:59`);
    if (created > end) return false;
  }
  return true;
}

export function instagramHandle(lead) {
  if (lead?.instagramUsername) return `@${lead.instagramUsername}`;
  return '';
}

export function parseWhen(value) {
  if (value == null || value === '') return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    const date = new Date(year, (month || 1) - 1, day || 1, hour, minute, second);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const text = String(value).trim().replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1');
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatWhen(value) {
  const date = parseWhen(value);
  if (!date) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function registerLabel(status) {
  const column = columnOf(status);
  if (column === 'CONTACTED') return 'Registrar follow-up realizado';
  if (column === 'WAITING_RESPONSE') return 'Registrar última tentativa';
  if (column === 'NEW') return 'Registrar contato realizado';
  return '';
}
