export const CRM_STATUSES = [
  { id: 'NO_WHATSAPP', label: 'Sem WhatsApp' },
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
  { id: 'GOOGLE_PLACES', label: 'Google Places' },
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
  { id: 'OVERDUE', label: 'Atrasados' },
  { id: 'TODAY', label: 'Vencem hoje' },
  { id: 'DUE_24H', label: 'Próximas 24h' },
  { id: 'NO_FIRST_CONTACT', label: 'Sem 1º contato' },
  { id: 'MISSING', label: 'Sem prazo' },
  { id: 'UPCOMING', label: 'Futuros' },
];

export const CRM_LOST_REASONS = [
  { id: 'NO_RESPONSE', label: 'Sem resposta' },
  { id: 'NO_INTEREST', label: 'Sem interesse' },
  { id: 'PRICE', label: 'Preço' },
  { id: 'OTHER_SOLUTION', label: 'Já utiliza outra solução' },
  { id: 'INVALID_CONTACT', label: 'Contato inválido' },
  { id: 'OTHER', label: 'Outro' },
];

export const CRM_ACTIVITY_TITLES = {
  CREATED: 'Lead cadastrado',
  UPDATED: 'Lead atualizado',
  STATUS_CHANGED: 'Status alterado',
  CONTACT_REGISTERED: 'Contato realizado',
  ARCHIVED: 'Lead arquivado',
  RESTORED: 'Lead reativado',
  NOTE: 'Observação',
  MESSAGE: 'Mensagem',
  AUTOMATION: 'Automação',
  DISCOVERED: 'Descoberto no Google Places',
  RECONSULTED: 'Reconsultado no Places',
  ACTION_SCHEDULED: 'Próxima ação agendada',
  ACTION_COMPLETED: 'Ação concluída',
  DEADLINE_OVERDUE: 'Prazo vencido',
  DEMO_SCHEDULED: 'Demonstração agendada',
  PROPOSAL_SENT: 'Proposta enviada',
  CONVERTED: 'Convertido',
  CLOSED: 'Encerrado',
};

export const DUE_SOON_HOURS = 4;

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

/** Deriva estado de prazo a partir de dueAt (backend) — sem polling. */
export function deadlineStateFromDue(dueAt, now = new Date()) {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return null;
  if (now.getTime() > due.getTime()) return 'OVERDUE';
  const soonMs = DUE_SOON_HOURS * 3600 * 1000;
  if (due.getTime() - now.getTime() <= soonMs) return 'DUE_SOON';
  return 'ON_TIME';
}

export function formatCountdown(dueAt, now = new Date()) {
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return '';
  const diffMs = due.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const hours = Math.floor(abs / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  let span;
  if (days >= 1) {
    span = days === 1 ? '1 dia' : `${days} dias`;
    if (remHours > 0) span += ` ${remHours}h`;
  } else if (hours >= 1) {
    span = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  } else {
    span = `${Math.max(1, minutes)}min`;
  }
  return diffMs >= 0 ? `Vence em ${span}` : `Atrasado há ${span}`;
}

export function deadlineIndicator(lead, now = new Date()) {
  if (!lead || lead.status === 'WON' || lead.status === 'LOST') {
    return { state: 'NONE', label: '', tone: 'none', cardClass: '' };
  }
  const dueAt = lead.activeAction?.dueAt || lead.nextContactAt;
  const backendState = lead.deadlineState || lead.activeAction?.state;
  const state = backendState && ['ON_TIME', 'DUE_SOON', 'OVERDUE'].includes(backendState)
    ? backendState
    : (deadlineStateFromDue(dueAt, now) || (dueAt ? null : 'MISSING'));

  if (!dueAt || state === 'MISSING') {
    return { state: 'MISSING', label: 'Sem prazo de ação', tone: 'missing', cardClass: 'is-missing' };
  }

  const actionLabel = lead.activeAction?.actionTypeLabel || lead.activeAction?.actionType;
  const countdown = formatCountdown(dueAt, now);
  if (state === 'OVERDUE') {
    return {
      state,
      label: actionLabel ? `${actionLabel} · ${countdown}` : countdown,
      tone: 'overdue',
      cardClass: 'is-overdue',
    };
  }
  if (state === 'DUE_SOON') {
    return {
      state,
      label: actionLabel ? `${actionLabel} · ${countdown}` : countdown,
      tone: 'dueSoon',
      cardClass: 'is-due-soon',
    };
  }
  return {
    state: 'ON_TIME',
    label: actionLabel ? `${actionLabel} · ${countdown}` : countdown,
    tone: 'onTime',
    cardClass: 'is-on-time',
  };
}

export function followUpIndicator(lead, now = new Date()) {
  const deadline = deadlineIndicator(lead, now);
  if (deadline.state !== 'NONE' && deadline.label) {
    return deadline;
  }
  const state = lead?.followUpState || followUpState(lead, now);
  if (state === 'NONE') {
    return { state, label: '', tone: 'none', cardClass: '' };
  }
  if (state === 'MISSING' || !lead?.nextContactAt) {
    return { state: 'MISSING', label: 'Sem próximo contato', tone: 'missing', cardClass: 'is-missing' };
  }
  const next = new Date(lead.nextContactAt);
  if (Number.isNaN(next.getTime())) {
    return { state: 'MISSING', label: 'Sem próximo contato', tone: 'missing', cardClass: 'is-missing' };
  }
  const time = next.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = next.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  if (state === 'TODAY') {
    return { state, label: `Retornar hoje às ${time}`, tone: 'today', cardClass: 'is-today' };
  }
  if (state === 'OVERDUE') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    const days = Math.max(1, Math.round((today - nextDay) / 86400000));
    return {
      state,
      label: days === 1 ? 'Retorno atrasado há 1 dia' : `Retorno atrasado há ${days} dias`,
      tone: 'overdue',
      cardClass: 'is-overdue',
    };
  }
  return { state: 'UPCOMING', label: `Retorno ${date} às ${time}`, tone: 'upcoming', cardClass: '' };
}

export function followUpDelayLabel(lead, now = new Date()) {
  return followUpIndicator(lead, now).label || null;
}

export function lostReasonLabel(value) {
  return CRM_LOST_REASONS.find((item) => item.id === value)?.label || value || '—';
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

export function phoneContactLabel(lead) {
  if (!lead?.phone) return 'Telefone não disponível';
  if (lead.phoneWhatsAppConfirmed) return 'WhatsApp confirmado';
  return 'Telefone disponível';
}

export function locationLabel(lead) {
  if (!lead) return '—';
  if (lead.city && lead.state) return `${lead.city} - ${lead.state}`;
  return lead.city || lead.state || '—';
}
