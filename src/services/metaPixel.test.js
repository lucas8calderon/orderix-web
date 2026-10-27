import {
  CONSENT_ACCEPTED,
  CONSENT_KEY,
  CONSENT_REJECTED,
  isMarketingPath,
  isMetaPixelHost,
  trackMetaEvent,
  trackPageView,
} from './metaPixel';

const PROD = 'www.weper.com.br';

beforeEach(() => {
  window.localStorage.clear();
  delete window.fbq;
  delete window._fbq;
  document.head.innerHTML = '<script></script>';
});

it('só considera o domínio de produção', () => {
  expect(isMetaPixelHost('weper.com.br')).toBe(true);
  expect(isMetaPixelHost(PROD)).toBe(true);
  expect(isMetaPixelHost('staging.weper.com.br')).toBe(false);
  expect(isMetaPixelHost('localhost')).toBe(false);
});

it('só considera as páginas institucionais', () => {
  expect(isMarketingPath('/')).toBe(true);
  expect(isMarketingPath('/demo/weper-burger')).toBe(true);
  expect(isMarketingPath('/contratar')).toBe(true);
  expect(isMarketingPath('/delivery/minions')).toBe(false);
  expect(isMarketingPath('/cardapio/minions')).toBe(false);
  expect(isMarketingPath('/app/atendimento')).toBe(false);
  expect(isMarketingPath('/democracia')).toBe(false);
});

it('não carrega o pixel sem o aceite de cookies', () => {
  trackPageView('/', PROD);
  window.localStorage.setItem(CONSENT_KEY, CONSENT_REJECTED);
  trackPageView('/', PROD);
  expect(window.fbq).toBeUndefined();
});

it('não carrega o pixel fora da produção ou fora das páginas institucionais', () => {
  window.localStorage.setItem(CONSENT_KEY, CONSENT_ACCEPTED);
  trackPageView('/', 'localhost');
  trackPageView('/delivery/minions', PROD);
  expect(window.fbq).toBeUndefined();
});

it('com aceite, inicia o pixel sem configuração automática e registra a visita e os eventos', () => {
  window.localStorage.setItem(CONSENT_KEY, CONSENT_ACCEPTED);
  trackPageView('/', PROD);
  trackMetaEvent('InitiateCheckout', { value: 39.9, currency: 'BRL' }, '/contratar', PROD);
  const calls = window.fbq.queue.map((args) => Array.from(args));
  expect(calls).toEqual([
    ['set', 'autoConfig', false, '998466659961823'],
    ['init', '998466659961823'],
    ['track', 'PageView'],
    ['track', 'InitiateCheckout', { value: 39.9, currency: 'BRL' }],
  ]);
});
