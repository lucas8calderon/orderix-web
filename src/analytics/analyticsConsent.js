/**
 * Consentimento dos cookies opcionais da Weper.
 *
 * O valor antigo ("accepted" / "rejected") continua válido: aceite libera
 * estatística e marketing; recusa desliga os dois. Preferência mista fica em JSON.
 * Fechar o aviso não grava escolha.
 */
import { forgetCampaign } from './campaignTracking';

export const CONSENT_KEY = 'weper-cookie-consent';
export const CONSENT_ACCEPTED = 'accepted';
export const CONSENT_REJECTED = 'rejected';
export const CONSENT_EVENT = 'weper-consent-changed';

const ANALYTICS_PREFIX = 'weper.analytics.';
const PURCHASE_ONCE_PREFIX = 'weper.analytics.once.purchase:';

export function getConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function readConsentRecord() {
  const raw = getConsent();
  if (!raw) return null;
  if (raw === CONSENT_ACCEPTED) return { analytics: true, marketing: true };
  if (raw === CONSENT_REJECTED) return { analytics: false, marketing: false };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  return readConsentRecord()?.analytics === true;
}

export function hasMarketingConsent() {
  return readConsentRecord()?.marketing === true;
}

function notifyConsent() {
  try {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    // Ambiente sem DOM: a medição simplesmente não começa.
  }
}

function clearAnalyticsStorage() {
  const drop = (storage) => {
    if (!storage) return;
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) keys.push(storage.key(index));
    keys.forEach((key) => {
      if (!key || !key.startsWith(ANALYTICS_PREFIX)) return;
      if (key.startsWith(PURCHASE_ONCE_PREFIX)) return;
      storage.removeItem(key);
    });
  };
  try {
    drop(window.localStorage);
    drop(window.sessionStorage);
  } catch {
    // Storage bloqueado: a recusa continua valendo na memória da página.
  }
}

export function setConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Sem armazenamento o aviso volta na próxima visita e a medição segue desligada.
  }
  if (!hasAnalyticsConsent()) {
    clearAnalyticsStorage();
    forgetCampaign();
  }
  notifyConsent();
}

export function acceptAll() {
  setConsent(CONSENT_ACCEPTED);
}

export function rejectOptional() {
  setConsent(CONSENT_REJECTED);
}

export function savePreferences({ analytics = false, marketing = false } = {}) {
  if (analytics && marketing) {
    setConsent(CONSENT_ACCEPTED);
    return;
  }
  if (!analytics && !marketing) {
    setConsent(CONSENT_REJECTED);
    return;
  }
  setConsent(JSON.stringify({
    v: 1,
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
    updatedAt: new Date().toISOString(),
  }));
}
