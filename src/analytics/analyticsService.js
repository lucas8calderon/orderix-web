/**
 * Ponto único de rastreamento do site institucional.
 * Sem consentimento de estatística nada é gravado nem enviado.
 * Sem identificador, o evento fica só na fila local e nenhum script externo entra.
 */
import { getPlanTier } from '../config/pricingTiers';
import { hasAnalyticsConsent } from './analyticsConsent';
import { campaignEventFields } from './campaignTracking';
import { EVENTS, isCommercialPath, sanitizeParams, sanitizeSearch } from './analyticsEvents';
import { maybeLoadProviders } from './analyticsProviders';

const VISITOR_KEY = 'weper.analytics.visitor';
const SESSION_KEY = 'weper.analytics.session';
const ONCE_PREFIX = 'weper.analytics.once.';

let listening = false;
const recent = new Map();

export function resetAnalyticsRuntime() {
  recent.clear();
}

function randomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function readId(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeId(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Sem storage o evento segue sem identificador persistente.
  }
}

function visitorId() {
  const current = readId(window.localStorage, VISITOR_KEY);
  if (current) return current;
  const created = randomId();
  writeId(window.localStorage, VISITOR_KEY, created);
  return created;
}

function sessionId() {
  const current = readId(window.sessionStorage, SESSION_KEY);
  if (current) return current;
  const created = randomId();
  writeId(window.sessionStorage, SESSION_KEY, created);
  return created;
}

function burstKey(name, params) {
  return [name, params.page_path, params.plan_id, params.transaction_id, params.signup_id].filter(Boolean).join('|');
}

function isBurst(name, params) {
  const key = burstKey(name, params);
  const now = Date.now();
  const previous = recent.get(key) || 0;
  recent.set(key, now);
  return previous > 0 && now - previous < 50;
}

function onceKey(key) {
  return `${ONCE_PREFIX}${key}`;
}

function alreadyRecorded(key, persistent) {
  const storage = persistent ? window.localStorage : window.sessionStorage;
  return readId(storage, onceKey(key)) === '1';
}

function rememberOnce(key, persistent) {
  const storage = persistent ? window.localStorage : window.sessionStorage;
  writeId(storage, onceKey(key), '1');
}

function pageLocation(pathname, search) {
  const origin = window.location?.origin || 'https://www.weper.com.br';
  return `${origin}${pathname}${sanitizeSearch(search)}`;
}

export function track(name, params = {}, context = {}) {
  try {
    if (process.env.REACT_APP_ANALYTICS_DISABLED === 'true') return { sent: false, reason: 'disabled' };
    if (!hasAnalyticsConsent()) return { sent: false, reason: 'consent' };
    const pathname = context.pathname || window.location.pathname;
    if (!isCommercialPath(pathname)) return { sent: false, reason: 'path' };
    const payload = sanitizeParams({
      ...campaignEventFields(),
      ...params,
      visitor_id: visitorId(),
      session_id: sessionId(),
    });
    if (context.dedupKey && alreadyRecorded(context.dedupKey, context.persistent)) {
      return { sent: false, reason: 'duplicate' };
    }
    if (isBurst(name, payload)) return { sent: false, reason: 'duplicate' };
    window.dataLayer = window.dataLayer || [];
    maybeLoadProviders({
      hostname: context.hostname || window.location.hostname,
    });
    window.dataLayer.push({ event: name, ...payload });
    if (context.dedupKey) rememberOnce(context.dedupKey, context.persistent);
    return { sent: true, payload };
  } catch {
    return { sent: false, reason: 'error' };
  }
}

export function trackAnalyticsPageView(pathname = window.location.pathname, search = window.location.search) {
  return track(EVENTS.PAGE_VIEW, {
    page_path: pathname,
    page_location: pageLocation(pathname, search),
    page_title: typeof document !== 'undefined' ? document.title : '',
  }, { pathname });
}

export function trackPlansView(pathname = window.location.pathname) {
  return track(EVENTS.PLANS_VIEW, {
    page_path: pathname,
    source_section: 'homepage_plans',
  }, { pathname, dedupKey: `plans_view:${pathname}` });
}

export function trackPlanSelected(planCode, sourceSection = 'page') {
  const tier = getPlanTier(planCode);
  if (!tier || tier.isTestPlan) return { sent: false, reason: 'plan' };
  return track(EVENTS.PLAN_SELECTED, {
    plan_id: tier.code,
    plan_name: tier.label,
    plan_price: tier.monthlyPrice,
    currency: 'BRL',
    source_section: sourceSection,
  });
}

export function trackWhatsAppClick(sourcePath = window.location.pathname) {
  return track(EVENTS.WHATSAPP_CLICK, { source_path: sourcePath }, { pathname: sourcePath });
}

export function trackSubscriptionModalOpened(planCode) {
  const tier = getPlanTier(planCode);
  if (!tier || tier.isTestPlan) return { sent: false, reason: 'plan' };
  return track(EVENTS.OPEN_SUBSCRIPTION_MODAL, {
    plan_id: tier.code,
    plan_name: tier.label,
    plan_price: tier.monthlyPrice,
    currency: 'BRL',
    source_section: 'homepage_plans',
  });
}

/** Lead comercial. Não recebe nome, telefone nem e-mail. */
export function trackGenerateLead(formId = 'commercial', planCode) {
  const options = typeof formId === 'object' && formId !== null ? formId : { formId, planCode };
  const tier = options.planCode ? getPlanTier(options.planCode) : null;
  if (tier?.isTestPlan) return { sent: false, reason: 'plan' };
  const params = { form_id: options.formId || 'commercial' };
  if (tier) {
    params.plan_id = tier.code;
    params.plan_name = tier.label;
    params.value = tier.monthlyPrice;
    params.currency = 'BRL';
  }
  return track(EVENTS.GENERATE_LEAD, params, tier ? { dedupKey: `generate_lead:${params.form_id}:${tier.code}` } : {});
}

function sourceSection(node) {
  if (node.closest?.('#plans, [data-plans-sentinel]')) return 'homepage_plans';
  if (node.closest?.('header')) return 'header';
  if (node.closest?.('footer')) return 'footer';
  return 'page';
}

function planCodeFromAnchor(anchor) {
  const href = anchor.getAttribute?.('href') || '';
  if (!href || href.startsWith('#')) return null;
  try {
    const url = new URL(href, 'https://www.weper.com.br');
    if (url.pathname !== '/contratar') return null;
    return url.searchParams.get('plan');
  } catch {
    return null;
  }
}

function isPlansLink(anchor) {
  const href = anchor.getAttribute?.('href') || '';
  if (href === '#plans' || href === '/#plans') return true;
  try {
    const url = new URL(href, 'https://www.weper.com.br');
    return url.hash === '#plans' && (url.pathname === '/' || url.pathname === '');
  } catch {
    return false;
  }
}

export function handleCommercialClick(event) {
  try {
    const anchor = event.target?.closest?.('a');
    if (!anchor) return;
    if (isPlansLink(anchor)) {
      track(EVENTS.PLANS_CTA_CLICK, { source_section: sourceSection(anchor) });
    }
    const planCode = planCodeFromAnchor(anchor);
    if (planCode) trackPlanSelected(planCode, sourceSection(anchor));
  } catch {
    // O clique segue para o destino mesmo se a medição falhar.
  }
}

export function startCommercialListeners() {
  if (typeof document === 'undefined' || listening) return () => {};
  listening = true;
  document.addEventListener('click', handleCommercialClick, true);
  return () => {
    document.removeEventListener('click', handleCommercialClick, true);
    listening = false;
  };
}
