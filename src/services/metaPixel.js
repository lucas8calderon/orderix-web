/**
 * Meta Pixel dos anúncios da Weper.
 *
 * Só roda no domínio de produção, nas páginas institucionais (home, demos e contratação)
 * e depois que a pessoa aceita os cookies de marketing. Nunca roda no painel, no cardápio
 * ou no delivery das lojas clientes, e nunca envia dados pessoais.
 */
export const META_PIXEL_ID = '998466659961823';
export const CONSENT_KEY = 'weper-cookie-consent';
export const CONSENT_ACCEPTED = 'accepted';
export const CONSENT_REJECTED = 'rejected';

const PIXEL_HOSTS = new Set(['weper.com.br', 'www.weper.com.br']);
const MARKETING_PREFIXES = ['/demo', '/contratar'];

export function isMetaPixelHost(hostname = window.location.hostname) {
  return PIXEL_HOSTS.has(String(hostname || '').toLowerCase());
}

export function isMarketingPath(pathname = '') {
  if (pathname === '/') return true;
  return MARKETING_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Sem armazenamento: o aviso volta na próxima visita, e o pixel segue desligado.
  }
}

function canTrack(pathname, hostname) {
  return isMetaPixelHost(hostname) && isMarketingPath(pathname) && getConsent() === CONSENT_ACCEPTED;
}

/** Código base da Meta, sem o PageView automático (as trocas de página do SPA são rastreadas à parte). */
function loadMetaPixel() {
  if (window.fbq) return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  // Sem leitura automática de botões e formulários da página (a tela de contratação tem CPF e e-mail).
  window.fbq('set', 'autoConfig', false, META_PIXEL_ID);
  window.fbq('init', META_PIXEL_ID);
}

export function trackPageView(pathname = window.location.pathname, hostname = window.location.hostname) {
  if (!canTrack(pathname, hostname)) return;
  loadMetaPixel();
  window.fbq('track', 'PageView');
}

/** Evento padrão da Meta (ex.: InitiateCheckout, Subscribe). Params sem dados pessoais. */
export function trackMetaEvent(name, params = {}, pathname = window.location.pathname, hostname = window.location.hostname) {
  if (!name || !canTrack(pathname, hostname)) return;
  loadMetaPixel();
  window.fbq('track', name, params);
}
