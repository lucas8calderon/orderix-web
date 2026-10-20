/** Rótulos e tons das etiquetas da Área de Parceiros (valores dos enums do backend). */

export const REFERRAL_STATUS_META = {
  REGISTERED: { label: 'Cadastrada', tone: 'neutral' },
  CONTACTED: { label: 'Contatada', tone: 'info' },
  NEGOTIATING: { label: 'Em negociação', tone: 'warning' },
  CONVERTED: { label: 'Convertida', tone: 'success' },
  NOT_CONVERTED: { label: 'Não convertida', tone: 'danger' },
};

export const COMMISSION_STATUS_META = {
  ESTIMATED: { label: 'Prevista', tone: 'info' },
  PENDING: { label: 'Pendente', tone: 'warning' },
  AVAILABLE: { label: 'Disponível', tone: 'info' },
  RESERVED: { label: 'Reservada', tone: 'warning' },
  APPROVED: { label: 'Aprovada', tone: 'info' },
  PROCESSING: { label: 'Em processamento', tone: 'warning' },
  PAID: { label: 'Paga', tone: 'success' },
  CANCELED: { label: 'Cancelada', tone: 'danger' },
  REVERSED: { label: 'Estornada', tone: 'danger' },
  FAILED: { label: 'Falhou', tone: 'danger' },
};

export const PAYOUT_STATUS_META = {
  SCHEDULED: { label: 'Agendado', tone: 'info' },
  DRAFT: { label: 'Rascunho', tone: 'neutral' },
  PENDING_APPROVAL: { label: 'Aguardando aprovação', tone: 'warning' },
  APPROVED: { label: 'Aprovado', tone: 'info' },
  TRANSFER_PENDING: { label: 'Transferência pendente', tone: 'warning' },
  PROCESSING: { label: 'Em processamento', tone: 'warning' },
  PAID: { label: 'Pago', tone: 'success' },
  FAILED: { label: 'Falhou', tone: 'danger' },
  REJECTED: { label: 'Rejeitado', tone: 'danger' },
  CANCELED: { label: 'Cancelado', tone: 'neutral' },
};

export const PARTNER_STATUS_META = {
  PENDING_VERIFICATION: { label: 'Verificação pendente', tone: 'warning' },
  ACTIVE: { label: 'Ativo', tone: 'success' },
  SUSPENDED: { label: 'Suspenso', tone: 'danger' },
  DISABLED: { label: 'Desativado', tone: 'neutral' },
};

export const STATUS_KINDS = {
  referral: REFERRAL_STATUS_META,
  commission: COMMISSION_STATUS_META,
  payout: PAYOUT_STATUS_META,
  partner: PARTNER_STATUS_META,
};

export const REFERRAL_STATUS_OPTIONS = Object.entries(REFERRAL_STATUS_META).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

export const EARNINGS_RANGE_OPTIONS = [
  { value: '6m', label: '6 meses' },
  { value: '12m', label: '12 meses' },
  { value: 'ytd', label: 'Ano atual' },
];

export const REFERRAL_SEGMENTS = [
  'Restaurante',
  'Lanchonete / Hamburgueria',
  'Pizzaria',
  'Bar / Café',
  'Padaria / Confeitaria',
  'Delivery',
  'Outro',
];

export const PARTNER_PAGE_SIZE = 10;

/** "2026-10" → "out/26" */
export function formatPeriodLabel(period) {
  const match = /^(\d{4})-(\d{2})/.exec(String(period || ''));
  if (!match) return String(period || '');
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return date
    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    .replace('.', '')
    .replace(' de ', '/');
}

/** Data e hora (LocalDateTime ISO ou array Jackson) em pt-BR. */
export function formatDateTime(value) {
  if (value == null || value === '') return '—';
  let date;
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, h = 0, min = 0] = value;
    date = new Date(y, m - 1, d, h, min);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
