/** Textos e regras de exibição do financeiro. Sem valores inventados. */

export const FIRST_MONTH_PERCENT = 100;
export const DEFAULT_RECURRING_PERCENT = 20;
export const PERCENT_OPTIONS = [10, 15, 20];

export const AUTOMATIC_PAYOUT_REASON =
  'Repasse automático desligado. A API de assinaturas não confirma transferência Pix a terceiros nesta conta.';

export function recurringLabel(percent, custom) {
  const value = Number(percent);
  if (!Number.isFinite(value)) return '—';
  return custom ? `${value}% (do parceiro)` : `${value}% (global)`;
}

export function commissionKindLabel(item) {
  if (!item) return '—';
  if (item.commissionKind === 'FIRST_MONTH' || Number(item.commissionPercent) === 100 || item.cycleNumber === 1) {
    return 'Primeira';
  }
  return 'Recorrente';
}

export const MERCADO_PAGO_SETUP_MISSING =
  'Faltam configurações do aplicativo Mercado Pago no servidor. O botão fica indisponível até isso ser resolvido.';

export function mercadoPagoConnectView(gateway) {
  const selected = gateway?.activeGateway === 'MERCADO_PAGO';
  const connected = gateway?.mercadoPagoConnectionType === 'OAUTH';
  const available = Boolean(gateway?.mercadoPagoOauthAvailable);
  return {
    visible: selected || connected,
    connected,
    buttonDisabled: !available,
    unavailableMessage: available
      ? ''
      : (gateway?.mercadoPagoOauthUnavailableMessage || MERCADO_PAGO_SETUP_MISSING),
  };
}

export function mercadoPagoAccountLabel(gateway) {
  if (!gateway || gateway.mercadoPagoConnectionType !== 'OAUTH') return '';
  const id = gateway.mercadoPagoAccountId
    ? `conta nº ${gateway.mercadoPagoAccountId}`
    : 'conta conectada';
  if (gateway.mercadoPagoLiveMode === false) return `${id} · teste`;
  if (gateway.mercadoPagoLiveMode === true) return `${id} · produção`;
  return id;
}

export function moneyOrDash(value) {
  if (value === null || value === undefined || value === '') return '—';
  return value;
}
