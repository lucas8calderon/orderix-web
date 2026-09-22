export const CRM_STATUSES = [
  { id: 'NEW', label: 'Novo lead' },
  { id: 'CONTACTED', label: 'Contatado' },
  { id: 'WAITING_RESPONSE', label: 'Aguardando retorno' },
  { id: 'INTERESTED', label: 'Interessado' },
  { id: 'DEMO', label: 'Demonstração' },
  { id: 'PROPOSAL', label: 'Proposta' },
  { id: 'WON', label: 'Ganho' },
  { id: 'LOST', label: 'Perdido' },
];

export const CRM_STATUS_LABELS = Object.fromEntries(CRM_STATUSES.map((item) => [item.id, item.label]));

export const CRM_BUSINESS_TYPES = [
  { id: 'HAMBURGER', label: 'Hamburgueria' },
  { id: 'PIZZA', label: 'Pizzaria' },
  { id: 'RESTAURANT', label: 'Restaurante' },
  { id: 'WINE_SHOP', label: 'Adega' },
  { id: 'BAR', label: 'Bar' },
  { id: 'SNACK_BAR', label: 'Lanchonete' },
  { id: 'COFFEE_SHOP', label: 'Cafeteria' },
  { id: 'BAKERY', label: 'Padaria' },
  { id: 'FOOD_TRUCK', label: 'Food Truck' },
  { id: 'MARKET', label: 'Mercado' },
  { id: 'CONVENIENCE', label: 'Conveniência' },
  { id: 'OTHER', label: 'Outros' },
];

export const CRM_SOURCES = [
  { id: 'GOOGLE_MAPS', label: 'Google Maps' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'REFERRAL', label: 'Indicação' },
  { id: 'PARTNER', label: 'Parceiro' },
  { id: 'MANUAL', label: 'Prospecção manual' },
  { id: 'WEBSITE', label: 'Site' },
  { id: 'OTHER', label: 'Outro' },
];

export const CRM_CONTACT_TYPES = [
  { id: 'WHATSAPP', label: 'WhatsApp' },
  { id: 'CALL', label: 'Ligação' },
  { id: 'EMAIL', label: 'E-mail' },
  { id: 'MEETING', label: 'Reunião' },
  { id: 'DEMO', label: 'Demonstração' },
  { id: 'OTHER', label: 'Outro' },
];

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const FOLLOW_UP_FILTERS = [
  { id: '', label: 'Todos' },
  { id: 'TODAY', label: 'Retornos hoje' },
  { id: 'OVERDUE', label: 'Atrasados' },
  { id: 'MISSING', label: 'Sem próximo contato' },
];

export const CRM_LIST_COLUMNS = [
  { id: 'businessName', label: 'Estabelecimento' },
  { id: 'businessType', label: 'Segmento', sortable: false },
  { id: 'city', label: 'Cidade' },
  { id: 'phone', label: 'Telefone' },
  { id: 'status', label: 'Status' },
  { id: 'lastContactAt', label: 'Último contato' },
  { id: 'nextContactAt', label: 'Próximo contato' },
];

export function adjacentStatus(current, direction) {
  const index = CRM_STATUSES.findIndex((item) => item.id === current);
  if (index < 0) return null;
  const next = CRM_STATUSES[index + direction];
  return next ? next.id : null;
}

export function businessTypeLabel(value) {
  return CRM_BUSINESS_TYPES.find((item) => item.id === value)?.label || value || '—';
}

export function sourceLabel(value) {
  return CRM_SOURCES.find((item) => item.id === value)?.label || value || '—';
}

export function statusLabel(value) {
  return CRM_STATUS_LABELS[value] || value || '—';
}

export function followUpState(lead, now = new Date()) {
  if (!lead || lead.status === 'WON' || lead.status === 'LOST') {
    return 'NONE';
  }
  if (!lead.nextContactAt) {
    return 'MISSING';
  }
  const next = new Date(lead.nextContactAt);
  if (Number.isNaN(next.getTime())) {
    return 'MISSING';
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate());
  const diff = Math.round((nextDay - today) / 86400000);
  if (diff < 0) return 'OVERDUE';
  if (diff === 0) return 'TODAY';
  return 'UPCOMING';
}

export function followUpIndicator(lead, now = new Date()) {
  const state = lead?.followUpState || followUpState(lead, now);
  if (state === 'NONE') {
    return { state, label: '', tone: 'none' };
  }
  if (state === 'MISSING' || !lead?.nextContactAt) {
    return { state: state === 'MISSING' ? 'MISSING' : state, label: 'Sem próximo contato', tone: 'missing' };
  }
  const next = new Date(lead.nextContactAt);
  if (Number.isNaN(next.getTime())) {
    return { state: 'MISSING', label: 'Sem próximo contato', tone: 'missing' };
  }
  const time = next.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = next.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  if (state === 'TODAY') {
    return { state, label: `Retornar hoje às ${time}`, tone: 'today' };
  }
  if (state === 'OVERDUE') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    const days = Math.max(1, Math.round((today - nextDay) / 86400000));
    return {
      state,
      label: days === 1 ? 'Retorno atrasado há 1 dia' : `Retorno atrasado há ${days} dias`,
      tone: 'overdue',
    };
  }
  return { state: 'UPCOMING', label: `Retorno ${date} às ${time}`, tone: 'upcoming' };
}

export function followUpDelayLabel(lead, now = new Date()) {
  return followUpIndicator(lead, now).label || null;
}

export function formatDateTime(value) {
  if (value == null || value === '') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDateTimeLocalValue(value) {
  if (value == null || value === '') return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocalValue(value) {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 19);
  }
  return undefined;
}

export function formatPercent(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

export function locationLabel(lead) {
  if (!lead) return '—';
  if (lead.city && lead.state) return `${lead.city} - ${lead.state}`;
  return lead.city || lead.state || '—';
}
