/**
 * Atribuição de campanha (primeiro toque e último toque conhecido).
 *
 * Sem UTM, a origem vem do referrer. Referrer vazio é acesso direto.
 * Referrer do próprio site não vira uma origem nova.
 * O código de parceiro (?ref=) não é lido nem gravado aqui.
 */
import { cleanToken } from './analyticsEvents';
import { getStoredPartnerRef } from '../services/partnerReferral';

export const CAMPAIGN_KEY = 'weper.analytics.campaign';
const CONSENT_KEY = 'weper-cookie-consent';
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const PAID_MEDIUMS = new Set(['cpc', 'ppc', 'paid', 'paid_social', 'paidsocial', 'display', 'cpm', 'cpv']);

let memory = { first: null, last: null };
let hydrated = false;

function analyticsAllowed() {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (raw === 'accepted') return true;
    if (raw === 'rejected' || !raw) return false;
    return JSON.parse(raw)?.analytics === true;
  } catch {
    return false;
  }
}

export function forgetCampaign() {
  memory = { first: null, last: null };
  hydrated = false;
  try {
    window.localStorage.removeItem(CAMPAIGN_KEY);
  } catch {
    // A recusa já impede o envio mesmo se o navegador bloquear a limpeza.
  }
}

export function resetCampaignTracking() {
  forgetCampaign();
}

function readUtm(search) {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const utm = {};
  UTM_KEYS.forEach((key) => {
    const value = cleanToken(params.get(key) || '');
    if (value) utm[key] = value;
  });
  return Object.keys(utm).length ? utm : null;
}

export function channelFromUtm(utm) {
  const source = String(utm.utm_source || '').toLowerCase();
  const medium = String(utm.utm_medium || '').toLowerCase();
  const paid = PAID_MEDIUMS.has(medium) || medium.includes('paid');
  if (source.includes('instagram') && paid) return 'instagram_ads';
  if (source.includes('instagram')) return 'instagram_organic';
  if ((source.includes('facebook') || source === 'fb' || source === 'meta') && paid) return 'facebook_ads';
  if (source.includes('facebook') || source === 'fb' || source === 'meta') return 'facebook';
  if (source.includes('google') && paid) return 'google_ads';
  if (source.includes('google')) return 'google';
  if (source.includes('whatsapp') || medium.includes('whatsapp')) return 'whatsapp';
  if (medium.includes('influenc') || source.includes('influenc')) return 'influencer';
  if (['partner', 'parceiro', 'influencer', 'influenciador'].includes(medium) || ['partner', 'parceiro'].includes(source)) {
    return 'partner';
  }
  if (source || medium) return 'campaign';
  return 'unknown';
}

function utmTouch(utm) {
  return {
    kind: 'utm',
    ...utm,
    source: utm.utm_source || '',
    medium: utm.utm_medium || '',
    channel: channelFromUtm(utm),
  };
}

function namedTouch(source, medium, channel) {
  return { kind: 'referral', source, medium, channel };
}

export function classifyReferrer(referrer, hostname = '') {
  if (!referrer) return namedTouch('(direct)', '(none)', 'direct');
  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return namedTouch('(direct)', '(none)', 'direct');
  }
  if (hostname && host === String(hostname).toLowerCase()) return null;
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) return namedTouch('instagram', 'organic', 'instagram_organic');
  if (host === 'fb.com' || host.endsWith('.fb.com') || host === 'facebook.com' || host.endsWith('.facebook.com')) {
    return namedTouch('facebook', 'organic', 'facebook');
  }
  if (host === 'wa.me' || host === 'whatsapp.com' || host.endsWith('.whatsapp.com')) {
    return namedTouch('whatsapp', 'organic', 'whatsapp');
  }
  if (host === 'google.com' || host.endsWith('.google.com') || host.endsWith('.google.com.br')) {
    return namedTouch('google', 'organic', 'google');
  }
  return namedTouch(host, 'referral', 'referral');
}

function readStored() {
  try {
    const raw = window.localStorage.getItem(CAMPAIGN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  if (!analyticsAllowed()) return;
  const stored = readStored();
  if (!stored) return;
  memory = { first: stored.first || null, last: stored.last || null };
}

function persist() {
  if (!analyticsAllowed() || (!memory.first && !memory.last)) return;
  try {
    window.localStorage.setItem(CAMPAIGN_KEY, JSON.stringify({
      first: memory.first,
      last: memory.last,
      expiresAt: Date.now() + RETENTION_MS,
    }));
  } catch {
    // Sem persistência a origem vale só até o fim desta página.
  }
}

function nextTouch(search, referrer, hostname) {
  const utm = readUtm(search);
  if (utm) return utmTouch(utm);
  if (memory.last) return null;
  return classifyReferrer(referrer, hostname) || namedTouch('(unknown)', '(none)', 'unknown');
}

/**
 * Registra a origem da visita. Antes do consentimento fica só em memória e não é enviada.
 * @returns {object|null} campanha persistida, ou null sem consentimento
 */
export function noteArrival(search = '', referrer = '', hostname = '') {
  hydrate();
  const touch = nextTouch(search, referrer, hostname);
  if (touch) {
    if (!memory.first) memory.first = touch;
    memory.last = touch;
  }
  persist();
  return analyticsAllowed() ? campaignSnapshot() : null;
}

export function campaignSnapshot() {
  hydrate();
  if (!memory.first && !memory.last) return null;
  return { first: memory.first, last: memory.last };
}

function partnerFlag() {
  try {
    return Boolean(getStoredPartnerRef());
  } catch {
    return false;
  }
}

export function campaignEventFields() {
  if (!analyticsAllowed()) return {};
  const snapshot = campaignSnapshot();
  if (!snapshot) return { has_partner_ref: partnerFlag() };
  const last = snapshot.last || {};
  const first = snapshot.first || {};
  return {
    source: last.source || '',
    medium: last.medium || '',
    channel: last.channel || '',
    utm_source: last.utm_source || '',
    utm_medium: last.utm_medium || '',
    utm_campaign: last.utm_campaign || '',
    utm_content: last.utm_content || '',
    utm_term: last.utm_term || '',
    first_source: first.source || '',
    first_medium: first.medium || '',
    first_channel: first.channel || '',
    first_utm_source: first.utm_source || '',
    first_utm_medium: first.utm_medium || '',
    first_utm_campaign: first.utm_campaign || '',
    has_partner_ref: partnerFlag(),
  };
}
