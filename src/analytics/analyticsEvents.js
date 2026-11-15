/** Nomes estáveis dos eventos. page_view, begin_checkout, generate_lead e purchase seguem o GA4. */
export const EVENTS = {
  PAGE_VIEW: 'page_view',
  PLANS_VIEW: 'plans_view',
  PLANS_CTA_CLICK: 'plans_cta_click',
  PLAN_SELECTED: 'plan_selected',
  OPEN_SUBSCRIPTION_MODAL: 'open_subscription_modal',
  BEGIN_CHECKOUT: 'begin_checkout',
  WHATSAPP_CLICK: 'whatsapp_click',
  GENERATE_LEAD: 'generate_lead',
  PURCHASE: 'purchase',
};

const ALLOWED_PARAMS = new Set([
  'page_path',
  'page_location',
  'page_title',
  'plan_id',
  'plan_name',
  'plan_price',
  'currency',
  'value',
  'source_section',
  'source_path',
  'signup_id',
  'transaction_id',
  'acquisition',
  'form_id',
  'visitor_id',
  'session_id',
  'source',
  'medium',
  'channel',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'first_source',
  'first_medium',
  'first_channel',
  'first_utm_source',
  'first_utm_medium',
  'first_utm_campaign',
  'has_partner_ref',
]);

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function cleanToken(value, max = 120) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().slice(0, max);
  if (!trimmed || trimmed.includes('@') || /[<>]/.test(trimmed)) return '';
  return trimmed;
}

/** Descarta chaves desconhecidas, e-mails e marcações. Identificadores anônimos passam. */
export function sanitizeParams(params = {}) {
  const clean = {};
  Object.entries(params).forEach(([key, value]) => {
    if (!ALLOWED_PARAMS.has(key) || value == null) return;
    if (typeof value === 'number') {
      if (Number.isFinite(value)) clean[key] = value;
      return;
    }
    if (typeof value === 'boolean') {
      clean[key] = value;
      return;
    }
    if (typeof value !== 'string') return;
    if (value.includes('@')) return;
    const text = cleanToken(value, key.startsWith('page_') || key.endsWith('_name') ? 160 : 120);
    if (text) clean[key] = text;
  });
  return clean;
}

/** Mantém só UTM na URL enviada às ferramentas. Código de parceiro e outros parâmetros ficam de fora. */
export function sanitizeSearch(search = '') {
  const raw = String(search || '');
  const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
  const kept = new URLSearchParams();
  UTM_KEYS.forEach((key) => {
    const value = cleanToken(params.get(key) || '');
    if (value) kept.set(key, value);
  });
  const text = kept.toString();
  return text ? `?${text}` : '';
}

export const COMMERCIAL_PATHS = new Set([
  '/',
  '/contratar',
  '/contratar/retorno',
  '/delivery-sem-comissao',
  '/app-garcom',
  '/cozinha-kds',
  '/controle-de-estoque',
  '/autoatendimento',
  '/parceiros',
  '/privacy',
  '/terms',
  '/links',
]);

/** Páginas da Weper, não o cardápio, o delivery nem o painel das lojas. */
export function isCommercialPath(pathname = '') {
  if (COMMERCIAL_PATHS.has(pathname)) return true;
  return pathname === '/demo' || pathname.startsWith('/demo/');
}
