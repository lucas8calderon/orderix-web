/**
 * Checkout e compra do funil comercial.
 *
 * begin_checkout sai quando a API cria a tentativa de contratação.
 * purchase sai só para a primeira assinatura paga, confirmada pelo status
 * que o backend preenche a partir do webhook Asaas. Renovação, plano de
 * homologação e retorno da fatura sem `paid` não entram.
 * A atribuição fica numa chave local da tentativa, sem cookie de terceiro.
 */
import { getPlanTier } from '../config/pricingTiers';
import { campaignSnapshot } from './campaignTracking';
import { EVENTS } from './analyticsEvents';
import { track } from './analyticsService';

const CHECKOUT_PREFIX = 'weper.analytics.checkout.';

export function shouldRecordAcquisition({
  paid = false,
  signupId,
  isTestPlan = false,
  isRenewal = false,
  alreadyRecorded = false,
} = {}) {
  if (!paid || signupId == null || signupId === '') return false;
  if (isTestPlan || isRenewal || alreadyRecorded) return false;
  return true;
}

function checkoutKey(signupId) {
  return `${CHECKOUT_PREFIX}${signupId}`;
}

function rememberCheckout(signupId, data) {
  try {
    window.localStorage.setItem(checkoutKey(signupId), JSON.stringify(data));
  } catch {
    // A tentativa continua no fluxo de pagamento mesmo sem atribuição salva.
  }
}

function readCheckout(signupId) {
  try {
    const raw = window.localStorage.getItem(checkoutKey(signupId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function filled(fields) {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value != null && value !== ''));
}

function campaignFromSnapshot() {
  const snapshot = campaignSnapshot();
  const last = snapshot?.last || {};
  const first = snapshot?.first || {};
  return filled({
    source: last.source,
    medium: last.medium,
    channel: last.channel,
    utm_source: last.utm_source,
    utm_medium: last.utm_medium,
    utm_campaign: last.utm_campaign,
    utm_content: last.utm_content,
    utm_term: last.utm_term,
    first_channel: first.channel,
    first_utm_source: first.utm_source,
    first_utm_campaign: first.utm_campaign,
  });
}

export function trackBeginCheckout({ signupId, planCode, sourceSection = 'signup' } = {}) {
  const tier = getPlanTier(planCode);
  if (!tier || tier.isTestPlan || signupId == null || signupId === '') {
    return { sent: false, reason: 'plan' };
  }
  const campaign = campaignFromSnapshot();
  const result = track(EVENTS.BEGIN_CHECKOUT, {
    signup_id: String(signupId),
    plan_id: tier.code,
    plan_name: tier.label,
    value: tier.monthlyPrice,
    currency: 'BRL',
    source_section: sourceSection,
    ...campaign,
  }, { dedupKey: `begin_checkout:${signupId}` });
  if (result.sent) {
    rememberCheckout(signupId, {
      plan_id: tier.code,
      value: tier.monthlyPrice,
      currency: 'BRL',
      at: new Date().toISOString(),
      ...campaign,
    });
  }
  return result;
}

export function trackConfirmedPurchase({
  paid = false,
  signupId,
  planCode,
  isRenewal = false,
} = {}) {
  const tier = getPlanTier(planCode);
  const isTestPlan = !tier || Boolean(tier.isTestPlan);
  let alreadyRecorded = false;
  try {
    alreadyRecorded = window.localStorage.getItem(`weper.analytics.once.purchase:${signupId}`) === '1';
  } catch {
    alreadyRecorded = false;
  }
  if (!shouldRecordAcquisition({ paid, signupId, isTestPlan, isRenewal, alreadyRecorded })) {
    return { sent: false, reason: 'not_acquisition' };
  }
  const stored = readCheckout(signupId) || {};
  return track(EVENTS.PURCHASE, {
    transaction_id: String(signupId),
    signup_id: String(signupId),
    plan_id: tier.code,
    plan_name: tier.label,
    value: stored.value || tier.monthlyPrice,
    currency: 'BRL',
    acquisition: 'first_subscription',
    ...filled({
      source: stored.source,
      medium: stored.medium,
      channel: stored.channel,
      utm_source: stored.utm_source,
      utm_medium: stored.utm_medium,
      utm_campaign: stored.utm_campaign,
      utm_content: stored.utm_content,
      utm_term: stored.utm_term,
      first_channel: stored.first_channel,
      first_utm_source: stored.first_utm_source,
      first_utm_campaign: stored.first_utm_campaign,
    }),
  }, { dedupKey: `purchase:${signupId}`, persistent: true });
}
