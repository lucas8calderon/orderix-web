/**
 * Programa de Parceiros — dados e cálculos da landing (Etapa 01).
 * Os valores de assinatura vêm de pricingTiers, a mesma configuração
 * publicada na página inicial. Não há chamada de backend.
 */
import { PRICING_TIERS } from '../../config/pricingTiers';

export const PARTNER_WHATSAPP_MESSAGE =
  'Olá! Conheci o Programa de Parceiros Weper e gostaria de saber mais sobre como participar e indicar estabelecimentos.';

export const PARTNER_PAGE_SEO = {
  title: 'Programa de Parceiros Weper | Indique e Ganhe Comissões Recorrentes',
  description:
    'Conheça o Programa de Parceiros Weper. Indique estabelecimentos, descubra nossas soluções e simule suas possíveis comissões recorrentes.',
  canonical: 'https://www.weper.com.br/parceiros',
};

export const PARTNER_DISCLAIMER =
  'Esta é uma simulação ilustrativa, não uma promessa de rendimentos. Os valores pressupõem que todas as assinaturas indicadas permaneçam ativas, elegíveis e pagas durante o período selecionado. Os resultados reais podem variar conforme planos, regras de comissão, tarifas, tributos, inadimplência e cancelamentos.';

/** Mensalidade pública usada como referência dos exemplos (faixa de R$ 99,90). */
export const PARTNER_REFERENCE_PRICE = 99.9;

export const PARTNER_COMMISSION_RATES = [5, 10, 15, 20, 25, 30];
export const PARTNER_DEFAULT_RATE = 10;
export const PARTNER_PERIODS = [12, 24, 36];
export const PARTNER_DEFAULT_PERIOD = 12;
export const PARTNER_MIN_STORES = 1;
export const PARTNER_MAX_STORES = 100;
export const PARTNER_DEFAULT_STORES = 10;
export const PARTNER_PROGRESS_MONTHS = [3, 6, 12, 24, 36];

export const PARTNER_STEPS = [
  {
    id: 'join',
    title: 'Torne-se parceiro',
    text: 'Entre em contato com a Weper e conheça o programa.',
  },
  {
    id: 'refer',
    title: 'Indique estabelecimentos',
    text: 'Apresente nossas soluções para restaurantes e outros empreendedores.',
  },
  {
    id: 'subscribe',
    title: 'O estabelecimento assina',
    text: 'Quando uma indicação elegível se transforma em cliente pagante, ela passa a gerar comissões.',
  },
  {
    id: 'receive',
    title: 'Receba de forma recorrente',
    text: 'Enquanto as mensalidades elegíveis forem pagas e as condições da parceria permanecerem atendidas, você poderá continuar recebendo comissões.',
  },
];

export const PARTNER_ADVANTAGES = [
  {
    id: 'recurring',
    title: 'Receita recorrente',
    text: 'Uma indicação pode gerar comissões por várias mensalidades.',
  },
  {
    id: 'ready',
    title: 'Sem precisar desenvolver um produto',
    text: 'O parceiro indica uma plataforma já desenvolvida.',
  },
  {
    id: 'fit',
    title: 'Soluções para diferentes estabelecimentos',
    text: 'A Weper oferece funcionalidades para diversos modelos de operação.',
  },
  {
    id: 'together',
    title: 'Crescimento conjunto',
    text: 'Quanto mais estabelecimentos ativos e elegíveis, maior pode ser a receita recorrente.',
  },
  {
    id: 'clear',
    title: 'Transparência',
    text: 'O programa prevê acompanhamento das indicações e comissões em uma futura área exclusiva.',
  },
  {
    id: 'support',
    title: 'Suporte Weper',
    text: 'Nossa equipe auxilia na apresentação e no entendimento das soluções.',
  },
];

export const PARTNER_EXAMPLES = [
  {
    id: 'starter',
    title: 'Parceiro iniciante',
    stores: 5,
    text: 'Para quem está começando a apresentar a Weper a alguns estabelecimentos.',
  },
  {
    id: 'growing',
    title: 'Parceiro em crescimento',
    stores: 20,
    text: 'Para quem já conversa com vários empreendedores e quer ampliar as indicações.',
  },
  {
    id: 'network',
    title: 'Parceiro com rede de contatos',
    stores: 50,
    text: 'Para quem tem uma rede ampla de estabelecimentos e criadores por perto.',
  },
];

export const PARTNER_SOLUTIONS = [
  { id: 'delivery-proprio', featureId: 'delivery-proprio', title: 'Delivery próprio' },
  { id: 'cardapio-digital', featureId: 'cardapio-digital', title: 'Cardápio digital' },
  { id: 'mesas-comandas', featureId: 'mesas-comandas', title: 'Gestão de mesas e comandas' },
  { id: 'app-garcom', featureId: 'app-garcom', title: 'Aplicativo para garçons' },
  { id: 'autoatendimento', featureId: 'autoatendimento', title: 'Autoatendimento' },
  { id: 'kds-cozinha', featureId: 'kds-cozinha', title: 'KDS' },
  { id: 'estoque', featureId: 'estoque', title: 'Estoque' },
  { id: 'pdv', featureId: 'pdv', title: 'PDV' },
  {
    id: 'impressao',
    title: 'Impressão de pedidos',
    description: 'Pedidos enviados para impressão na rotina do estabelecimento.',
  },
  { id: 'dashboard', featureId: 'dashboard', title: 'Dashboard de gestão' },
];

export const PARTNER_FAQS = [
  {
    question: 'Quem pode se tornar parceiro?',
    answer:
      'Pessoas, influenciadores, criadores de conteúdo e empreendedores que queiram indicar a Weper para estabelecimentos. A participação é confirmada em uma conversa com a nossa equipe, antes de qualquer indicação valer comissão.',
  },
  {
    question: 'Preciso ter um estabelecimento para participar?',
    answer:
      'Não. O programa é para quem indica estabelecimentos. Ter um negócio próprio não é necessário para manifestar interesse.',
  },
  {
    question: 'Como funcionam as indicações?',
    answer:
      'Você apresenta as soluções da Weper a restaurantes, lanchonetes, bares e outros estabelecimentos. Quando uma indicação elegível se torna cliente com assinatura paga, ela pode passar a gerar comissão, conforme as regras combinadas na parceria.',
  },
  {
    question: 'Como são calculadas as comissões?',
    answer:
      'A comissão incide sobre assinaturas elegíveis e pagas. O percentual, a base de cálculo e as demais regras serão apresentados na formalização. O simulador desta página usa percentuais ilustrativos para explorar cenários e não representa uma proposta comercial fechada.',
  },
  {
    question: 'Por quanto tempo posso receber?',
    answer:
      'Enquanto as mensalidades elegíveis continuarem pagas e as condições da parceria forem atendidas, a indicação pode seguir gerando comissão. Prazo e demais condições serão definidos no acordo da parceria.',
  },
  {
    question: 'O que acontece se o estabelecimento cancelar?',
    answer:
      'Se a assinatura for cancelada ou deixar de ser paga, a comissão daquela indicação deixa de ser devida a partir do que estiver previsto nas regras da parceria. Cancelamento e inadimplência podem alterar o resultado.',
  },
  {
    question: 'Preciso pagar alguma coisa para participar?',
    answer:
      'Nesta página não há taxa para manifestar interesse. Se existir alguma condição comercial, ela será explicada antes da formalização. Nada é cobrado por este site.',
  },
  {
    question: 'Como os pagamentos serão realizados?',
    answer:
      'As regras operacionais e financeiras dos repasses serão apresentadas durante a formalização da parceria. Esta página não cadastra dados bancários, não gera cobrança e não realiza pagamentos.',
  },
  {
    question: 'Posso indicar vários estabelecimentos?',
    answer:
      'Sim. Você pode indicar mais de um estabelecimento. Cada indicação elegível, com assinatura paga, pode contribuir para a comissão, de acordo com as regras da parceria.',
  },
  {
    question: 'Como posso começar?',
    answer:
      'Fale com a equipe Weper pelo WhatsApp. Vamos conhecer você, explicar o programa e combinar os próximos passos. O cadastro em uma área exclusiva de parceiros ainda não está disponível nesta página.',
  },
];

export function getPartnerPlans() {
  return PRICING_TIERS.map((tier) => ({
    id: tier.id,
    label: tier.label,
    monthlyPrice: tier.monthlyPrice,
    description: tier.description,
  }));
}

export function getPartnerReferencePlan(plans = getPartnerPlans()) {
  return (
    plans.find((plan) => plan.monthlyPrice === PARTNER_REFERENCE_PRICE)
    || plans[Math.floor((plans.length - 1) / 2)]
    || plans[0]
  );
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

export function priceToCents(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.round(number * 100);
}

export function commissionPerStoreCents(monthlyPrice, ratePercent) {
  const rate = Number(ratePercent);
  if (!Number.isFinite(rate) || rate < 0) return 0;
  return Math.round((priceToCents(monthlyPrice) * rate) / 100);
}

/**
 * Projeção ilustrativa.
 * Comissão por estabelecimento = mensalidade × percentual.
 * Comissão mensal = comissão por estabelecimento × estabelecimentos.
 * Acumulado = comissão mensal × meses.
 */
export function simulatePartnerEarnings({
  monthlyPrice,
  stores,
  ratePercent,
  months,
} = {}) {
  const safeStores = clampInteger(stores, PARTNER_MIN_STORES, PARTNER_MAX_STORES, PARTNER_DEFAULT_STORES);
  const safeMonths = clampInteger(months, 1, 120, PARTNER_DEFAULT_PERIOD);
  const safeRate = Number.isFinite(Number(ratePercent)) ? Number(ratePercent) : PARTNER_DEFAULT_RATE;
  const perStoreCents = commissionPerStoreCents(monthlyPrice, safeRate);
  const monthlyCents = perStoreCents * safeStores;
  const subscriptionCents = priceToCents(monthlyPrice) * safeStores;

  const series = Array.from({ length: safeMonths }, (_, index) => {
    const month = index + 1;
    return {
      month,
      label: `Mês ${month}`,
      accumulatedCents: monthlyCents * month,
      accumulated: (monthlyCents * month) / 100,
    };
  });

  const progress = PARTNER_PROGRESS_MONTHS
    .filter((milestone) => milestone <= safeMonths)
    .map((milestone) => ({
      months: milestone,
      accumulatedCents: monthlyCents * milestone,
      accumulated: (monthlyCents * milestone) / 100,
      share: milestone / safeMonths,
    }));

  return {
    stores: safeStores,
    months: safeMonths,
    ratePercent: safeRate,
    commissionPerStoreCents: perStoreCents,
    monthlyCommissionCents: monthlyCents,
    subscriptionRevenueCents: subscriptionCents,
    accumulatedCommissionCents: monthlyCents * safeMonths,
    annualEquivalentCents: monthlyCents * 12,
    commissionPerStore: perStoreCents / 100,
    monthlyCommission: monthlyCents / 100,
    subscriptionRevenue: subscriptionCents / 100,
    accumulatedCommission: (monthlyCents * safeMonths) / 100,
    annualEquivalent: (monthlyCents * 12) / 100,
    series,
    progress,
  };
}

export function buildPartnerExamples(
  plan = getPartnerReferencePlan(),
  ratePercent = PARTNER_DEFAULT_RATE,
) {
  return PARTNER_EXAMPLES.map((example) => ({
    ...example,
    estimate: simulatePartnerEarnings({
      monthlyPrice: plan.monthlyPrice,
      stores: example.stores,
      ratePercent,
      months: 12,
    }),
  }));
}
