import { AUTOMATIC_PAYOUT_REASON, commissionKindLabel, mercadoPagoAccountLabel, recurringLabel } from './financeModel';

test('a primeira mensalidade aparece como primeira e a seguinte como recorrente', () => {
  expect(commissionKindLabel({ cycleNumber: 1, commissionPercent: 100 })).toBe('Primeira');
  expect(commissionKindLabel({ cycleNumber: 2, commissionPercent: 15 })).toBe('Recorrente');
});

test('o percentual do parceiro não se confunde com o global', () => {
  expect(recurringLabel(10, true)).toBe('10% (do parceiro)');
  expect(recurringLabel(20, false)).toBe('20% (global)');
});

test('a conta conectada da Weper mostra o número e o ambiente, sem token', () => {
  expect(mercadoPagoAccountLabel({
    mercadoPagoConnectionType: 'OAUTH',
    mercadoPagoAccountId: '241983636',
    mercadoPagoLiveMode: true,
  })).toBe('conta nº 241983636 · produção');
  expect(mercadoPagoAccountLabel({ mercadoPagoConnectionType: null })).toBe('');
});

test('o repasse automático permanece indisponível na interface', () => {
  expect(AUTOMATIC_PAYOUT_REASON).toMatch(/desligado/i);
  expect(AUTOMATIC_PAYOUT_REASON).toMatch(/não confirma/i);
});
