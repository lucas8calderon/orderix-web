/** Cálculos do Assistente de Precificação (MVP sem persistência). */

export const DEFAULT_DESIRED_MARGIN = 40;

export function roundMoney(value) {
  if (!Number.isFinite(value)) return NaN;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundPercent(value) {
  if (!Number.isFinite(value)) return NaN;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Aceita número, string com vírgula/ponto, ou vazio → null. Rejeita negativos. */
export function parseNonNegativeNumber(raw) {
  if (raw === '' || raw == null) return null;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 0) return null;
    return raw;
  }
  const normalized = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

export function sumCosts(costs = []) {
  const total = (costs || []).reduce((acc, row) => {
    const amount = parseNonNegativeNumber(row?.value ?? row?.amount);
    return acc + (amount == null ? 0 : amount);
  }, 0);
  return roundMoney(total);
}

/**
 * Preço = Custo / (1 - (margem + taxas) / 100)
 * Retorna null quando a entrada é inválida ou a soma dos % ≥ 100.
 */
export function calculateSuggestedPrice(totalCost, desiredMarginPct, variableFeesPct = 0) {
  const cost = Number(totalCost);
  const margin = Number(desiredMarginPct);
  const fees = Number(variableFeesPct) || 0;

  if (!Number.isFinite(cost) || cost <= 0) return null;
  if (!Number.isFinite(margin) || margin < 0) return null;
  if (!Number.isFinite(fees) || fees < 0) return null;

  const retained = 1 - (margin + fees) / 100;
  if (!(retained > 0)) return null;

  const price = cost / retained;
  if (!Number.isFinite(price) || price <= 0) return null;
  return roundMoney(price);
}

export function calculatePricingIndicators(salePrice, totalCost, variableFeesPct = 0) {
  const price = Number(salePrice);
  const cost = Number(totalCost);
  const fees = Number(variableFeesPct) || 0;

  if (!Number.isFinite(price) || price <= 0) return null;
  if (!Number.isFinite(cost) || cost < 0) return null;
  if (!Number.isFinite(fees) || fees < 0) return null;

  const cmvPercent = roundPercent((cost / price) * 100);
  const contributionMarginPercent = roundPercent(100 - cmvPercent - fees);
  const variableFeesAmount = roundMoney(price * (fees / 100));
  const contributionMarginAmount = roundMoney(price - cost - variableFeesAmount);

  if (![cmvPercent, contributionMarginPercent, contributionMarginAmount].every(Number.isFinite)) {
    return null;
  }

  return {
    cmvPercent,
    contributionMarginPercent,
    contributionMarginAmount,
  };
}

export function canApplyPricing({ totalCost, desiredMarginPct, variableFeesPct, applyPrice }) {
  const cost = Number(totalCost);
  const margin = Number(desiredMarginPct);
  const fees = Number(variableFeesPct) || 0;
  const price = Number(applyPrice);

  if (!Number.isFinite(cost) || cost <= 0) return false;
  if (!Number.isFinite(margin) || margin < 0) return false;
  if (!Number.isFinite(fees) || fees < 0) return false;
  if (!(margin + fees < 100)) return false;
  if (!Number.isFinite(price) || price <= 0) return false;
  return true;
}

export function formatMoneyBrl(value) {
  if (!Number.isFinite(Number(value))) return '—';
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatPercentBrl(value) {
  if (!Number.isFinite(Number(value))) return '—';
  return `${Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

export function createEmptyCostRow() {
  return {
    key: `cost-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: '',
    value: '',
  };
}
