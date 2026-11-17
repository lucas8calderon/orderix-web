import { planChangeHistoryLine, planChangeMessage } from './planChangeMessage';

test('a mensagem copia plano, valores, data e nome sem dizer que já foi aplicada', () => {
  const text = planChangeMessage({
    storeName: 'Padaria Sol',
    currentPlan: 'PLAN_01',
    currentAmount: 39.9,
    newPlan: 'PLAN_05',
    newAmount: 149.9,
    firstBillingDate: '2027-03-10',
  });

  expect(text).toContain('Padaria Sol');
  expect(text).toContain('Plano 1');
  expect(text).toContain('Plano 5');
  expect(text).toContain('39,90');
  expect(text).toContain('149,90');
  expect(text).toContain('10/03/2027');
  expect(text).toContain('Até essa data, sua mensalidade atual permanece normalmente.');
  expect(text).toContain('Pode me confirmar se está tudo certo com essa alteração?');
  expect(text).toContain('Equipe Weper');
  expect(text.toLowerCase()).not.toContain('conclu');
  expect(text.toLowerCase()).not.toContain('aplicad');
});

test('o histórico mostra a troca do plano 5 para o plano 2', () => {
  const line = planChangeHistoryLine({
    firstBillingDate: '2027-03-10',
    previousPlan: 'PLAN_05',
    newPlan: 'PLAN_02',
    previousAmount: 149.9,
    newAmount: 69.9,
    status: 'APPLIED',
  });
  expect(line.replaceAll('\u00a0', ' ')).toBe(
    '10/03/2027 — Plano 5 → Plano 2 — R$ 149,90 → R$ 69,90 — Aplicado.',
  );
});
