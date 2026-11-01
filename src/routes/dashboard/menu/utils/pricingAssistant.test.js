import {
  calculatePricingIndicators,
  calculateSuggestedPrice,
  canApplyPricing,
  createEmptyCostRow,
  parseNonNegativeNumber,
  roundMoney,
  sumCosts,
} from './pricingAssistant';

describe('pricingAssistant', () => {
  it('soma custos e ignora vazios', () => {
    expect(sumCosts([
      { name: 'Massa', value: 4.5 },
      { name: 'Molho', value: '1,80' },
      { name: 'Vazio', value: '' },
      { name: 'Queijo', value: 8 },
    ])).toBe(14.3);
  });

  it('rejeita valores negativos na parse', () => {
    expect(parseNonNegativeNumber(-1)).toBeNull();
    expect(parseNonNegativeNumber('-2,5')).toBeNull();
    expect(parseNonNegativeNumber('3,25')).toBe(3.25);
  });

  it('calcula preço sugerido com margem e taxas', () => {
    // 23 / (1 - 0.45) = 41.818... → 41.82
    expect(calculateSuggestedPrice(23, 40, 5)).toBe(41.82);
  });

  it('bloqueia soma de margem + taxas >= 100', () => {
    expect(calculateSuggestedPrice(20, 80, 20)).toBeNull();
    expect(calculateSuggestedPrice(20, 100, 0)).toBeNull();
  });

  it('bloqueia custo zerado', () => {
    expect(calculateSuggestedPrice(0, 40, 5)).toBeNull();
    expect(canApplyPricing({
      totalCost: 0,
      desiredMarginPct: 40,
      variableFeesPct: 5,
      applyPrice: 10,
    })).toBe(false);
  });

  it('recalcula indicadores com preço ajustado', () => {
    const indicators = calculatePricingIndicators(41.9, 23, 5);
    expect(indicators.cmvPercent).toBe(54.89);
    expect(indicators.contributionMarginPercent).toBe(40.11);
    expect(indicators.contributionMarginAmount).toBe(16.8);
  });

  it('arredonda dinheiro de forma estável', () => {
    expect(roundMoney(41.819)).toBe(41.82);
    expect(roundMoney(1.005)).toBe(1.01);
  });

  it('permite aplicar só com preço positivo e % válidos', () => {
    expect(canApplyPricing({
      totalCost: 23,
      desiredMarginPct: 40,
      variableFeesPct: 5,
      applyPrice: 41.9,
    })).toBe(true);

    expect(canApplyPricing({
      totalCost: 23,
      desiredMarginPct: 40,
      variableFeesPct: 5,
      applyPrice: 0,
    })).toBe(false);
  });

  it('cria linha de custo vazia com chave', () => {
    const row = createEmptyCostRow();
    expect(row.name).toBe('');
    expect(row.value).toBe('');
    expect(row.key).toMatch(/^cost-/);
  });
});
