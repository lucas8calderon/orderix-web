const PLAN_NUMBER = {
  PLAN_01: '1',
  PLAN_02: '2',
  PLAN_03: '3',
  PLAN_04: '4',
  PLAN_05: '5',
};

export function planNumber(code) {
  return PLAN_NUMBER[code] || '';
}

export function planLabel(code) {
  const number = planNumber(code);
  return number ? `Plano ${number}` : 'Plano';
}

export function formatPlanDate(value) {
  const iso = String(value || '').slice(0, 10);
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

export function formatPlanMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Mensagem para o administrador copiar. Não diz que a alteração já foi feita. */
export function planChangeMessage({ storeName, currentPlan, currentAmount, newPlan, newAmount, firstBillingDate }) {
  const name = String(storeName || '').trim() || 'seu estabelecimento';
  return [
    'Olá! Tudo bem? 😊',
    '',
    `Passando para confirmar nossa combinação sobre a assinatura da Weper para o estabelecimento ${name}.`,
    '',
    `Atualmente, seu estabelecimento está no Plano ${planNumber(currentPlan)}, no valor de ${formatPlanMoney(currentAmount)} por mês.`,
    '',
    `Conforme conversamos, a partir de ${formatPlanDate(firstBillingDate)}, sua mensalidade passará para o Plano ${planNumber(newPlan)}, no valor de ${formatPlanMoney(newAmount)}.`,
    '',
    'Até essa data, sua mensalidade atual permanece normalmente.',
    '',
    'Você não precisa realizar uma nova contratação e continuará utilizando a Weper sem interrupções.',
    '',
    'Pode me confirmar se está tudo certo com essa alteração?',
    '',
    'Qualquer dúvida, estou à disposição!',
    '',
    'Equipe Weper',
  ].join('\n');
}

export const PLAN_CHANGE_STATUS = {
  AWAITING_CONFIRMATION: 'Aguardando confirmação',
  SCHEDULED: 'Agendada',
  PROCESSING: 'Em processamento',
  APPLIED: 'Aplicado',
  FAILED: 'Falhou',
  CANCELED: 'Cancelada',
};

export function planChangeHistoryLine(change) {
  if (!change) return '';
  const status = PLAN_CHANGE_STATUS[change.status] || change.status || '—';
  return `${formatPlanDate(change.firstBillingDate)} — ${planLabel(change.previousPlan)} → ${planLabel(change.newPlan)} — ${formatPlanMoney(change.previousAmount)} → ${formatPlanMoney(change.newAmount)} — ${status}.`;
}
