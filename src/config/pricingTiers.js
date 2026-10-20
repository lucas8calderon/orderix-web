/**
 * WEPER PRICING TIERS
 * 
 * Configuração central das faixas de preço da Weper.
 * A mensalidade é calculada com base no volume mensal processado pela plataforma.
 * 
 * IMPORTANTE: Todos os valores monetários estão em BRL (Reais).
 * 
 * Estrutura preparada para futura integração com backend.
 * TODO: Conectar ao endpoint GET /api/pricing/tiers quando disponível.
 */

export const PRICING_TIERS = [
  {
    id: 'tier-1',
    /** Código persistido em SubscriptionPlan. O site mostra a faixa, não o código. */
    code: 'PLAN_01',
    number: 1,
    minRevenue: 0,
    maxRevenue: 1000,
    monthlyPrice: 39.90,
    label: 'Até R$ 1.000',
    description: 'Ideal para quem está começando',
  },
  {
    id: 'tier-2',
    code: 'PLAN_02',
    number: 2,
    minRevenue: 1000.01,
    maxRevenue: 2000,
    monthlyPrice: 69.90,
    label: 'R$ 1.000,01 até R$ 2.000',
    description: 'Para operações em crescimento',
  },
  {
    id: 'tier-3',
    code: 'PLAN_03',
    number: 3,
    minRevenue: 2000.01,
    maxRevenue: 4000,
    monthlyPrice: 89.90,
    label: 'R$ 2.000,01 até R$ 4.000',
    description: 'Para negócios estabelecidos',
  },
  {
    id: 'tier-4',
    code: 'PLAN_04',
    number: 4,
    minRevenue: 4000.01,
    maxRevenue: 7000,
    monthlyPrice: 99.90,
    label: 'R$ 4.000,01 até R$ 7.000',
    description: 'Para operações robustas',
  },
  {
    id: 'tier-5',
    code: 'PLAN_05',
    number: 5,
    minRevenue: 7000.01,
    maxRevenue: Infinity,
    monthlyPrice: 149.90,
    label: 'Acima de R$ 7.000',
    description: 'Valor máximo da mensalidade',
    isMaxTier: true,
  },
];

/**
 * Homologação Asaas SaaS (R$ 5 — mínimo da API). Fora de PRICING_TIERS — não entra na oferta comercial.
 * Uso: deep link /contratar?plan=PLAN_TEST ou dropdown só em staging.
 * @see docs/asaas/PLAN_TEST.md no backend
 */
export const TEST_PLAN = {
  id: 'tier-test',
  code: 'PLAN_TEST',
  number: 0,
  minRevenue: 0,
  maxRevenue: Infinity,
  monthlyPrice: 5.0,
  label: 'Homologação (teste Asaas)',
  description: 'Plano interno R$ 5,00 para validar Pix/cartão',
  isTestPlan: true,
};

/** Resolve faixa comercial ou PLAN_TEST. */
export function getPlanTier(code) {
  if (!code) return null;
  if (code === TEST_PLAN.code) return TEST_PLAN;
  return PRICING_TIERS.find((tier) => tier.code === code) || null;
}

/**
 * Opções do select em /contratar.
 * @param {{ includeTest?: boolean }} options — staging ou deep link ?plan=PLAN_TEST
 */
export function getSignupPlanOptions({ includeTest = false } = {}) {
  if (!includeTest) return [...PRICING_TIERS];
  return [...PRICING_TIERS, TEST_PLAN];
}

/**
 * Calcula a mensalidade com base no volume mensal processado.
 * @param {number} revenue - Volume mensal em reais
 * @returns {number} Valor da mensalidade
 */
export function calculateMonthlyPrice(revenue) {
  const value = Number(revenue) || 0;
  
  const tier = PRICING_TIERS.find(
    (t) => value >= t.minRevenue && value <= t.maxRevenue
  );
  
  return tier ? tier.monthlyPrice : PRICING_TIERS[0].monthlyPrice;
}

/**
 * Retorna a faixa (tier) correspondente ao volume informado.
 * @param {number} revenue - Volume mensal em reais
 * @returns {Object} Objeto tier
 */
export function getTierByRevenue(revenue) {
  const value = Number(revenue) || 0;
  
  return PRICING_TIERS.find(
    (t) => value >= t.minRevenue && value <= t.maxRevenue
  ) || PRICING_TIERS[0];
}

/**
 * Retorna o preço mínimo (primeira faixa).
 */
export function getMinimumPrice() {
  return PRICING_TIERS[0].monthlyPrice;
}

/**
 * Retorna o preço máximo (última faixa).
 */
export function getMaximumPrice() {
  return PRICING_TIERS[PRICING_TIERS.length - 1].monthlyPrice;
}

/**
 * Retorna o volume máximo da penúltima faixa (antes do teto).
 */
export function getMaxRevenueBeforeCap() {
  return PRICING_TIERS[PRICING_TIERS.length - 2].maxRevenue;
}

/**
 * Formata valor monetário em BRL.
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado (ex: "R$ 39,90")
 */
export function formatPrice(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata valor monetário sem o símbolo R$.
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado (ex: "39,90")
 */
export function formatPriceNumber(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
