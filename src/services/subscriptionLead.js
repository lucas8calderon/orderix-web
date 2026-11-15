/**
 * Captura do lead de contratação. O servidor é a fonte do registro.
 * A sessão só reaproveita a mesma tentativa (idempotência) e o preenchimento
 * depois que a API confirmou o cadastro.
 */
import axios from 'axios';

const ATTEMPTS_KEY = 'weper.lead.attempts';
const SESSION_KEY = 'weper.subscriptionLead';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function maskWhatsApp(value) {
  const digits = String(value || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').replace(/^0/, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

function letterCount(value) {
  return [...value].filter((char) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(char)).length;
}

export function normalizeLeadName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function validateName(value) {
  const name = normalizeLeadName(value);
  if (name.length < 2 || letterCount(name) < 2 || name.length > 120) {
    return 'Informe o nome completo.';
  }
  return '';
}

export function validateWhatsApp(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  if (digits.startsWith('0') && (digits.length === 11 || digits.length === 12)) digits = digits.slice(1);
  const ddd = Number(digits.slice(0, 2));
  if (digits.length !== 11 || digits[2] !== '9' || ddd < 11 || ddd > 99) {
    return 'Informe um WhatsApp com DDD, no formato (00) 00000-0000.';
  }
  return '';
}

export function leadIsReady(name, whatsapp) {
  return !validateName(name) && !validateWhatsApp(whatsapp);
}

function newId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `lead${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function attemptKey(scope) {
  let all = {};
  try {
    all = JSON.parse(window.sessionStorage.getItem(ATTEMPTS_KEY) || '{}') || {};
  } catch {
    all = {};
  }
  if (!all[scope]) {
    all[scope] = newId();
    try {
      window.sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all));
    } catch {
      // Sem sessão, a chave vale só nesta chamada e o servidor ainda deduplica se ela se repetir.
    }
  }
  return all[scope];
}

export function readLeadSession() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null');
    return parsed && parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

export function writeLeadSession(lead) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(lead));
  } catch {
    // O cadastro já foi aceito pelo servidor.
  }
}

function utmFromLocation() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const utm = {};
  UTM_KEYS.forEach((key) => {
    const value = (params.get(key) || '').trim().slice(0, 120);
    if (value && !value.includes('@')) utm[key] = value;
  });
  return utm;
}

export async function captureSubscriptionLead({
  name,
  whatsapp,
  planCode,
  marketingOptIn = false,
  source = 'signup_page',
  idempotencyKey,
}) {
  const nameError = validateName(name);
  const phoneError = validateWhatsApp(whatsapp);
  if (nameError || phoneError) {
    const error = new Error(nameError || phoneError);
    error.validation = true;
    throw error;
  }
  const key = idempotencyKey || attemptKey(`${source}:${planCode}`);
  const response = await axios.post('/api/public/billing/leads', {
    idempotencyKey: key,
    name: normalizeLeadName(name),
    whatsapp,
    planCode,
    marketingOptIn: Boolean(marketingOptIn),
    source,
    ...utmFromLocation(),
  }, {
    headers: { 'Idempotency-Key': key },
  });
  const data = response.data || {};
  const stored = {
    token: data.leadToken,
    planCode: data.planCode || planCode,
    name: normalizeLeadName(name),
    whatsapp: maskWhatsApp(whatsapp),
    marketingOptIn: Boolean(marketingOptIn),
    idempotencyKey: key,
    source,
    created: data.created === true,
  };
  writeLeadSession(stored);
  return stored;
}

/** Abre o WhatsApp com texto pronto. Quem envia é a pessoa, não o sistema. */
export function operationalWhatsAppLink(name, whatsapp) {
  const digits = String(whatsapp || '').replace(/\D/g, '');
  if (digits.length < 12) return '';
  const text = `Olá, ${name}! Tudo bem? Aqui é da Weper. Vimos que você iniciou uma contratação do nosso sistema e gostaríamos de saber se precisa de alguma ajuda para concluir.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
