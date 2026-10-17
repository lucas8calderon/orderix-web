import { formatPrice } from '../../config/pricingTiers';
import { getFeatureById } from '../../config/weperFeatures';
import {
  PARTNER_DEFAULT_RATE,
  PARTNER_PROGRESS_MONTHS,
  PARTNER_SOLUTIONS,
  buildPartnerExamples,
  commissionPerStoreCents,
  getPartnerPlans,
  getPartnerReferencePlan,
  simulatePartnerEarnings,
} from './partnerProgram';

describe('simulador do programa de parceiros', () => {
  const reference = getPartnerReferencePlan();

  it('usa as faixas públicas de preço, com referência de R$ 99,90', () => {
    const plans = getPartnerPlans();
    expect(plans.map((plan) => plan.monthlyPrice)).toEqual([39.9, 69.9, 89.9, 99.9, 149.9]);
    expect(reference.monthlyPrice).toBe(99.9);
    expect(reference.label).toMatch(/7\.000/);
  });

  it('arredonda a comissão por estabelecimento em centavos', () => {
    expect(commissionPerStoreCents(99.9, 10)).toBe(999);
    expect(commissionPerStoreCents(39.9, 5)).toBe(200);
    expect(commissionPerStoreCents(69.9, 15)).toBe(1049);
    expect(commissionPerStoreCents(149.9, 30)).toBe(4497);
  });

  it('projeta comissão mensal, acumulada e equivalente anual', () => {
    const result = simulatePartnerEarnings({
      monthlyPrice: 99.9,
      stores: 10,
      ratePercent: 10,
      months: 12,
    });

    expect(result).toMatchObject({
      stores: 10,
      months: 12,
      ratePercent: 10,
      commissionPerStoreCents: 999,
      monthlyCommissionCents: 9990,
      subscriptionRevenueCents: 99900,
      accumulatedCommissionCents: 119880,
      annualEquivalentCents: 119880,
    });
    expect(result.series).toHaveLength(12);
    expect(result.series[11].accumulatedCents).toBe(119880);
    expect(result.progress.map((item) => item.months)).toEqual([3, 6, 12]);
    expect(formatPrice(result.monthlyCommission)).toContain('99,90');
  });

  it('reage a plano, quantidade, percentual e período', () => {
    const result = simulatePartnerEarnings({
      monthlyPrice: 39.9,
      stores: 5,
      ratePercent: 15,
      months: 24,
    });

    expect(result.commissionPerStoreCents).toBe(599);
    expect(result.monthlyCommissionCents).toBe(2995);
    expect(result.subscriptionRevenueCents).toBe(19950);
    expect(result.accumulatedCommissionCents).toBe(71880);
    expect(result.annualEquivalentCents).toBe(35940);
    expect(result.series).toHaveLength(24);
    expect(result.progress.map((item) => item.months)).toEqual([3, 6, 12, 24]);
    expect(result.progress.find((item) => item.months === 24).share).toBe(1);
    expect(result.progress.find((item) => item.months === 6).share).toBe(0.25);
  });

  it('mostra os cinco marcos quando o período é de 36 meses', () => {
    const result = simulatePartnerEarnings({
      monthlyPrice: reference.monthlyPrice,
      stores: 1,
      ratePercent: PARTNER_DEFAULT_RATE,
      months: 36,
    });
    expect(result.progress.map((item) => item.months)).toEqual(PARTNER_PROGRESS_MONTHS);
    expect(result.series.at(-1).accumulatedCents).toBe(result.accumulatedCommissionCents);
  });

  it('limita a quantidade de estabelecimentos entre 1 e 100', () => {
    expect(simulatePartnerEarnings({ monthlyPrice: 99.9, stores: 0, ratePercent: 10, months: 12 }).stores).toBe(1);
    expect(simulatePartnerEarnings({ monthlyPrice: 99.9, stores: 250, ratePercent: 10, months: 12 }).stores).toBe(100);
  });

  it('calcula os exemplos a partir da mesma fórmula e do plano de referência', () => {
    const examples = buildPartnerExamples();
    expect(examples.map((example) => example.stores)).toEqual([5, 20, 50]);
    examples.forEach((example) => {
      const direct = simulatePartnerEarnings({
        monthlyPrice: reference.monthlyPrice,
        stores: example.stores,
        ratePercent: PARTNER_DEFAULT_RATE,
        months: 12,
      });
      expect(example.estimate.monthlyCommissionCents).toBe(direct.monthlyCommissionCents);
    });
    expect(examples[0].estimate.monthlyCommissionCents).toBe(4995);
    expect(examples[1].estimate.monthlyCommissionCents).toBe(19980);
    expect(examples[2].estimate.monthlyCommissionCents).toBe(49950);
  });

  it('reaproveita as funcionalidades publicadas, com impressão à parte', () => {
    const linked = PARTNER_SOLUTIONS.filter((item) => item.featureId);
    expect(linked).toHaveLength(9);
    linked.forEach((item) => {
      expect(getFeatureById(item.featureId)?.Icon).toBeTruthy();
    });
    expect(PARTNER_SOLUTIONS.find((item) => item.id === 'impressao').featureId).toBeUndefined();
  });
});
