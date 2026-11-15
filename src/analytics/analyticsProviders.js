/**
 * Carrega GTM e Clarity só com identificador válido, consentimento já decidido
 * pelo chamador, e fora de desenvolvimento — salvo habilitação explícita.
 * O GA4 não é carregado direto: o contêiner do GTM é o único caminho.
 */

const PRODUCTION_HOSTS = new Set(['weper.com.br', 'www.weper.com.br']);
const GTM_ID = /^GTM-[A-Z0-9]+$/;
const CLARITY_ID = /^[a-z0-9]{4,32}$/i;

function envFlag(value) {
  return value === 'true';
}

export function isProductionAnalyticsHost(hostname = '') {
  return PRODUCTION_HOSTS.has(String(hostname || '').toLowerCase());
}

export function isLocalHost(hostname = '') {
  const host = String(hostname || '').toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
}

export function canLoadTagManager(hostname, { analyticsDebug = process.env.REACT_APP_ANALYTICS_DEBUG } = {}) {
  if (envFlag(analyticsDebug)) return true;
  return isProductionAnalyticsHost(hostname);
}

export function canLoadClarity(hostname, {
  clarityEnabled = process.env.REACT_APP_CLARITY_ENABLED,
  analyticsDebug = process.env.REACT_APP_ANALYTICS_DEBUG,
} = {}) {
  const host = String(hostname || '').toLowerCase();
  if (isLocalHost(host)) return envFlag(clarityEnabled);
  if (envFlag(clarityEnabled) || envFlag(analyticsDebug)) return true;
  if (host.includes('staging') || host.endsWith('.onrender.com')) return false;
  return isProductionAnalyticsHost(host);
}

export function loadGtm(containerId, doc = document) {
  if (!GTM_ID.test(containerId || '')) return false;
  if (doc.getElementById('weper-gtm')) return false;
  const win = doc.defaultView || window;
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = doc.createElement('script');
  script.id = 'weper-gtm';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  doc.head.appendChild(script);
  return true;
}

export function loadClarity(projectId, doc = document) {
  if (!CLARITY_ID.test(projectId || '')) return false;
  const win = doc.defaultView || window;
  if (typeof win.clarity === 'function' && doc.getElementById('weper-clarity')) return false;
  win.clarity = win.clarity || function clarity() {
    (win.clarity.q = win.clarity.q || []).push(arguments);
  };
  if (doc.getElementById('weper-clarity')) return false;
  const script = doc.createElement('script');
  script.id = 'weper-clarity';
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  doc.head.appendChild(script);
  return true;
}

export function maybeLoadProviders({
  hostname = typeof window !== 'undefined' ? window.location.hostname : '',
  gtmId = process.env.REACT_APP_GTM_CONTAINER_ID,
  clarityId = process.env.REACT_APP_CLARITY_PROJECT_ID,
  clarityEnabled = process.env.REACT_APP_CLARITY_ENABLED,
  analyticsDebug = process.env.REACT_APP_ANALYTICS_DEBUG,
  disabled = process.env.REACT_APP_ANALYTICS_DISABLED,
  document: doc = typeof document !== 'undefined' ? document : null,
} = {}) {
  if (envFlag(disabled) || !doc) return { gtm: false, clarity: false };
  const gtm = canLoadTagManager(hostname, { analyticsDebug })
    ? loadGtm(String(gtmId || '').trim(), doc)
    : false;
  const clarity = canLoadClarity(hostname, { clarityEnabled, analyticsDebug })
    ? loadClarity(String(clarityId || '').trim(), doc)
    : false;
  return { gtm, clarity };
}
