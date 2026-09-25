import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const PAYMENT_METHOD_ORDER = ['PIX', 'DEBIT', 'CREDIT', 'CASH', 'VOUCHER', 'OTHER'];

export const PAYMENT_METHOD_LABELS = {
  PIX: 'PIX',
  DEBIT: 'Cartão de Débito',
  CREDIT: 'Cartão de Crédito',
  CASH: 'Dinheiro',
  VOUCHER: 'Vale',
  OTHER: 'Outro',
};

export const CHARGE_TIMING_OPTIONS = [
  { id: 'AFTER_KITCHEN', label: 'Depois da cozinha' },
  { id: 'BEFORE_KITCHEN', label: 'Antes da cozinha (hold)' },
  { id: 'OPTIONAL', label: 'Opcional' },
];

export const CHANNEL_CHARGE_TIMING_OPTIONS = [
  { id: 'AFTER_KITCHEN', label: 'No fechamento da conta' },
  { id: 'BEFORE_KITCHEN', label: 'Antes de enviar à cozinha' },
];

export const PAYMENT_MODE_OPTIONS = [
  {
    id: 'ORDER_ONLY',
    label: 'Somente lançar pedidos',
    hint: 'O Weper só lança. Sem tela de pagamento. O momento da cobrança não se aplica.',
  },
  {
    id: 'MANUAL_CONFIRMATION',
    label: 'Confirmação manual',
    hint: 'Pagamento fora do Weper (outra maquininha, dinheiro ou Pix). O operador confirma. Não registra como InfinitePay.',
  },
  {
    id: 'INTEGRATED_PAYMENT',
    label: 'Pagamento integrado',
    hint: 'O aparelho cobra de verdade via InfinitePay, se a loja e o dispositivo permitirem.',
  },
];

export const PAYMENT_FALLBACK_OPTIONS = [
  {
    id: 'BLOCK',
    label: 'Bloquear',
    hint: 'Sem InfinitePay no aparelho: o operador tenta de novo ou cancela. A conta não é marcada como paga.',
  },
  {
    id: 'MANUAL_CONFIRMATION',
    label: 'Confirmação manual',
    hint: 'Sem InfinitePay no aparelho: o operador confirma que o pagamento foi feito fora do Weper. Nunca é automático.',
  },
];

export const INTEGRATED_PROVIDER = 'INFINITEPAY';

export const QUICK_SALE_PROVIDERS = ['GETNET', 'INFINITEPAY'];

export function isQuickCounterProvider(provider) {
  return QUICK_SALE_PROVIDERS.includes(String(provider || '').toUpperCase());
}

export function toChannelTiming(value, fallback = 'AFTER_KITCHEN') {
  const raw = String(value || fallback || 'AFTER_KITCHEN').toUpperCase();
  if (raw === 'BEFORE_KITCHEN' || raw === 'BEFORE_SEND') {
    return 'BEFORE_KITCHEN';
  }
  return 'AFTER_KITCHEN';
}

export function toFallbackMode(value, fallback = 'BLOCK') {
  const raw = String(value || '').toUpperCase();
  if (raw === 'MANUAL_CONFIRMATION' || raw === 'MANUAL' || raw === 'EXTERNAL') {
    return 'MANUAL_CONFIRMATION';
  }
  if (raw === 'BLOCK' || raw === 'BLOQUEAR' || raw === 'RETRY') {
    return 'BLOCK';
  }
  return fallback;
}

export function toPaymentProvider(value, fallback = 'NONE') {
  const raw = String(value || '').toUpperCase();
  if (raw === 'INFINITEPAY' || raw === 'INFINITE_PAY') {
    return 'INFINITEPAY';
  }
  if (raw === 'GETNET') {
    return 'GETNET';
  }
  if (raw === 'MANUAL' || raw === 'NONE' || raw === '') {
    return 'NONE';
  }
  return fallback;
}

export function toPaymentMode(value, fallback = 'MANUAL_CONFIRMATION') {
  const raw = String(value || '').toUpperCase();
  if (raw === 'ORDER_ONLY' || raw === 'ONLY_ORDERS' || raw === 'LAUNCH_ONLY') {
    return 'ORDER_ONLY';
  }
  if (raw === 'INTEGRATED_PAYMENT' || raw === 'INTEGRATED' || raw === 'GETNET' || raw === 'INFINITEPAY') {
    return 'INTEGRATED_PAYMENT';
  }
  if (raw === 'MANUAL_CONFIRMATION' || raw === 'MANUAL' || raw === 'EXTERNAL') {
    return 'MANUAL_CONFIRMATION';
  }
  return fallback;
}

export function channelPaymentMode(dto, channel) {
  if (channel === 'table') return toPaymentMode(dto.tablePaymentMode, modeFromLegacy(dto, 'table'));
  if (channel === 'comanda') return toPaymentMode(dto.comandaPaymentMode, modeFromLegacy(dto, 'comanda'));
  return toPaymentMode(dto.counterPaymentMode, modeFromLegacy(dto, 'counter'));
}

function modeFromLegacy(dto, channel) {
  const provider = String(dto.defaultProvider || 'MANUAL').toUpperCase();
  if ((channel === 'table' || channel === 'comanda') && dto.waiterPaymentEnabled === false) {
    return 'ORDER_ONLY';
  }
  if (provider === 'GETNET' || provider === 'INFINITEPAY') {
    return 'INTEGRATED_PAYMENT';
  }
  return 'MANUAL_CONFIRMATION';
}

export const PAYMENT_PROVIDER_OPTIONS = [
  { id: 'NONE', label: 'Nenhum' },
  { id: 'INFINITEPAY', label: 'InfinitePay' },
  { id: 'GETNET', label: 'Getnet (legado)' },
];

const PAYMENT_CONFIG_URL = `${API_BASE_URL}/stores/me/payment-config`;

export function getStorePaymentConfig() {
  return axios.get(PAYMENT_CONFIG_URL);
}

export function updateStorePaymentConfig(payload) {
  return axios.put(PAYMENT_CONFIG_URL, payload);
}

export function serviceFeePercentToUi(percent) {
  const n = Number(percent);
  if (!Number.isFinite(n)) return 10;
  return Math.round(n * 100);
}

export function serviceFeeUiToPercent(uiPercent) {
  const n = Number(uiPercent);
  if (!Number.isFinite(n)) return 0.1;
  return Number((Math.min(100, Math.max(0, n)) / 100).toFixed(4));
}

export function methodsToToggleMap(acceptedMethods) {
  const list = Array.isArray(acceptedMethods) ? acceptedMethods : [];
  const enabled = new Set(list.map((method) => String(method).toUpperCase()));
  const useAll = enabled.size === 0;
  return PAYMENT_METHOD_ORDER.reduce((acc, method) => {
    acc[method] = useAll ? true : enabled.has(method);
    return acc;
  }, {});
}

export function toggleMapToMethods(map) {
  return PAYMENT_METHOD_ORDER.filter((method) => Boolean(map?.[method]));
}

export function toPaymentUi(dto = {}) {
  const legacy = dto.timing || 'AFTER_KITCHEN';
  const tablePaymentMode = channelPaymentMode(dto, 'table');
  const comandaPaymentMode = channelPaymentMode(dto, 'comanda');
  const counterPaymentMode = channelPaymentMode(dto, 'counter');
  const tablePaymentProvider = providerForMode(tablePaymentMode, dto.tablePaymentProvider, dto.defaultProvider);
  const comandaPaymentProvider = providerForMode(comandaPaymentMode, dto.comandaPaymentProvider, dto.defaultProvider);
  const counterPaymentProvider = providerForMode(counterPaymentMode, dto.counterPaymentProvider, dto.defaultProvider);
  return {
    timing: legacy,
    tableTiming: tablePaymentMode === 'ORDER_ONLY' ? 'AFTER_KITCHEN' : toChannelTiming(dto.tableTiming, legacy),
    comandaTiming: comandaPaymentMode === 'ORDER_ONLY' ? 'AFTER_KITCHEN' : toChannelTiming(dto.comandaTiming, legacy),
    counterTiming: counterPaymentMode === 'ORDER_ONLY' ? 'AFTER_KITCHEN' : toChannelTiming(dto.counterTiming, legacy),
    tablePaymentMode,
    comandaPaymentMode,
    counterPaymentMode,
    tablePaymentProvider,
    comandaPaymentProvider,
    counterPaymentProvider,
    tableFallbackMode: tablePaymentMode === 'INTEGRATED_PAYMENT' ? toFallbackMode(dto.tableFallbackMode) : 'BLOCK',
    comandaFallbackMode: comandaPaymentMode === 'INTEGRATED_PAYMENT' ? toFallbackMode(dto.comandaFallbackMode) : 'BLOCK',
    counterFallbackMode: counterPaymentMode === 'INTEGRATED_PAYMENT' ? toFallbackMode(dto.counterFallbackMode) : 'BLOCK',
    waiterPaymentEnabled: tablePaymentMode !== 'ORDER_ONLY' || comandaPaymentMode !== 'ORDER_ONLY',
    paymentMethods: methodsToToggleMap(dto.acceptedMethods),
    defaultProvider: inferDefaultProvider(tablePaymentMode, comandaPaymentMode, counterPaymentMode, tablePaymentProvider, comandaPaymentProvider, counterPaymentProvider),
    serviceFee: serviceFeePercentToUi(dto.serviceFeePercent ?? 0.1),
    infinitePayHandle: dto.infinitePayHandle || '',
    infinitePayDocument: dto.infinitePayDocument || '',
    onlinePixEnabled: Boolean(dto.onlinePixEnabled),
    onlineCardEnabled: Boolean(dto.onlineCardEnabled),
    mercadoPagoConfigured: Boolean(dto.mercadoPagoConfigured),
    mercadoPagoAccessTokenConfigured: Boolean(dto.mercadoPagoAccessTokenConfigured),
    mercadoPagoPublicKeyConfigured: Boolean(dto.mercadoPagoPublicKeyConfigured),
    mercadoPagoWebhookSecretConfigured: Boolean(dto.mercadoPagoWebhookSecretConfigured),
    mercadoPagoStoreAccessTokenConfigured: Boolean(dto.mercadoPagoStoreAccessTokenConfigured),
    mercadoPagoServerTestCredentialsAvailable: Boolean(dto.mercadoPagoServerTestCredentialsAvailable),
    mercadoPagoServerTestPublicKeyAvailable: Boolean(dto.mercadoPagoServerTestPublicKeyAvailable),
    mercadoPagoEnvironment: dto.mercadoPagoEnvironment === 'prod' ? 'prod' : 'test',
    mercadoPagoAccessTokenLength: Number(dto.accessTokenLength) || 0,
    mercadoPagoPublicKeyLength: Number(dto.publicKeyLength) || 0,
    mercadoPagoWebhookSecretLength: Number(dto.webhookSecretLength) || 0,
    mercadoPagoAccessToken: '',
    mercadoPagoPublicKey: '',
    mercadoPagoWebhookSecret: '',
  };
}

function providerForMode(mode, configured, legacyDefault) {
  if (mode !== 'INTEGRATED_PAYMENT') {
    return 'NONE';
  }
  const fromChannel = toPaymentProvider(configured, '');
  if (fromChannel === 'INFINITEPAY' || fromChannel === 'GETNET') {
    return fromChannel;
  }
  const fromLegacy = toPaymentProvider(legacyDefault, 'NONE');
  if (fromLegacy === 'INFINITEPAY' || fromLegacy === 'GETNET') {
    return fromLegacy;
  }
  return 'NONE';
}

function inferDefaultProvider(tableMode, comandaMode, counterMode, tableProvider, comandaProvider, counterProvider) {
  if (tableMode === 'INTEGRATED_PAYMENT' && (tableProvider === 'INFINITEPAY' || tableProvider === 'GETNET')) {
    return tableProvider;
  }
  if (comandaMode === 'INTEGRATED_PAYMENT' && (comandaProvider === 'INFINITEPAY' || comandaProvider === 'GETNET')) {
    return comandaProvider;
  }
  if (counterMode === 'INTEGRATED_PAYMENT' && (counterProvider === 'INFINITEPAY' || counterProvider === 'GETNET')) {
    return counterProvider;
  }
  return 'NONE';
}

/** Caractere de máscara visual (comprimento = length real da credencial). */
export const SECRET_MASK_CHAR = '•';

/** Máscara de N caracteres; length 0/ausente → string vazia (não inventa tamanho). */
export function secretInputMask(length) {
  const n = Number(length);
  if (!Number.isFinite(n) || n <= 0) return '';
  return SECRET_MASK_CHAR.repeat(Math.floor(n));
}

/** @deprecated use secretInputMask(length); mantido para compat de imports. */
export const SECRET_INPUT_MASK = '*****';

export function isSecretInputMask(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return false;
  return /^[•*]+$/.test(trimmed);
}

/** Só envia segredo novo; nunca máscara, placeholder ou vazio. */
export function newSecretOrOmit(value) {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  if (isSecretInputMask(trimmed)) return undefined;
  if (/^configurado$/i.test(trimmed)) return undefined;
  return trimmed;
}

export function toPaymentPayload(ui) {
  const acceptedMethods = toggleMapToMethods(ui.paymentMethods);
  const tablePaymentMode = toPaymentMode(ui.tablePaymentMode);
  const comandaPaymentMode = toPaymentMode(ui.comandaPaymentMode);
  const counterPaymentMode = toPaymentMode(ui.counterPaymentMode);
  const tablePaymentProvider = providerForMode(tablePaymentMode, ui.tablePaymentProvider, ui.defaultProvider);
  const comandaPaymentProvider = providerForMode(comandaPaymentMode, ui.comandaPaymentProvider, ui.defaultProvider);
  const counterPaymentProvider = providerForMode(counterPaymentMode, ui.counterPaymentProvider, ui.defaultProvider);
  const payload = {
    timing: ui.timing || ui.tableTiming || 'AFTER_KITCHEN',
    tableTiming: tablePaymentMode === 'ORDER_ONLY' ? 'AFTER_KITCHEN' : toChannelTiming(ui.tableTiming),
    comandaTiming: comandaPaymentMode === 'ORDER_ONLY' ? 'AFTER_KITCHEN' : toChannelTiming(ui.comandaTiming),
    counterTiming: counterPaymentMode === 'ORDER_ONLY' ? 'AFTER_KITCHEN' : toChannelTiming(ui.counterTiming),
    tablePaymentMode,
    comandaPaymentMode,
    counterPaymentMode,
    tablePaymentProvider,
    comandaPaymentProvider,
    counterPaymentProvider,
    tableFallbackMode: tablePaymentMode === 'INTEGRATED_PAYMENT' ? toFallbackMode(ui.tableFallbackMode) : 'BLOCK',
    comandaFallbackMode: comandaPaymentMode === 'INTEGRATED_PAYMENT' ? toFallbackMode(ui.comandaFallbackMode) : 'BLOCK',
    counterFallbackMode: counterPaymentMode === 'INTEGRATED_PAYMENT' ? toFallbackMode(ui.counterFallbackMode) : 'BLOCK',
    waiterPaymentEnabled: tablePaymentMode !== 'ORDER_ONLY' || comandaPaymentMode !== 'ORDER_ONLY',
    acceptedMethods,
    defaultProvider: inferDefaultProvider(
      tablePaymentMode,
      comandaPaymentMode,
      counterPaymentMode,
      tablePaymentProvider,
      comandaPaymentProvider,
      counterPaymentProvider,
    ),
    serviceFeePercent: serviceFeeUiToPercent(ui.serviceFee),
    onlinePixEnabled: Boolean(ui.onlinePixEnabled),
    onlineCardEnabled: Boolean(ui.onlineCardEnabled),
    mercadoPagoEnvironment: ui.mercadoPagoEnvironment === 'prod' ? 'prod' : 'test',
  };
  if ([tablePaymentProvider, comandaPaymentProvider, counterPaymentProvider].includes('INFINITEPAY')) {
    payload.infinitePayHandle = ui.infinitePayHandle || '';
    payload.infinitePayDocument = ui.infinitePayDocument || '';
  }
  const accessToken = newSecretOrOmit(ui.mercadoPagoAccessToken);
  const publicKey = newSecretOrOmit(ui.mercadoPagoPublicKey);
  const webhookSecret = newSecretOrOmit(ui.mercadoPagoWebhookSecret);
  if (accessToken !== undefined) payload.mercadoPagoAccessToken = accessToken;
  if (publicKey !== undefined) payload.mercadoPagoPublicKey = publicKey;
  if (webhookSecret !== undefined) payload.mercadoPagoWebhookSecret = webhookSecret;
  return payload;
}

const SAVED_SECRET_FIELDS = [
  {
    valueKey: 'mercadoPagoAccessToken',
    lengthKey: 'mercadoPagoAccessTokenLength',
    flags: ['mercadoPagoAccessTokenConfigured', 'mercadoPagoConfigured', 'mercadoPagoStoreAccessTokenConfigured'],
  },
  {
    valueKey: 'mercadoPagoPublicKey',
    lengthKey: 'mercadoPagoPublicKeyLength',
    flags: ['mercadoPagoPublicKeyConfigured'],
  },
  {
    valueKey: 'mercadoPagoWebhookSecret',
    lengthKey: 'mercadoPagoWebhookSecretLength',
    flags: ['mercadoPagoWebhookSecretConfigured'],
  },
];

/**
 * O servidor não devolve o segredo. Campo vazio ou máscara mantém o length anterior;
 * valor novo preenche o length quando a resposta ainda veio zerada. O plaintext não fica no estado.
 */
export function hydrateSavedSecretLengths(ui = {}, submitted = {}) {
  const next = { ...ui };
  SAVED_SECRET_FIELDS.forEach(({ valueKey, lengthKey, flags }) => {
    const secret = newSecretOrOmit(submitted[valueKey]);
    next[valueKey] = '';
    if (secret) {
      if (!(Number(next[lengthKey]) > 0)) {
        next[lengthKey] = secret.length;
      }
      flags.forEach((flag) => {
        next[flag] = true;
      });
      return;
    }
    if (!(Number(next[lengthKey]) > 0) && Number(submitted[lengthKey]) > 0) {
      next[lengthKey] = Number(submitted[lengthKey]);
      flags.forEach((flag) => {
        if (submitted[flag]) next[flag] = true;
      });
    }
  });
  return next;
}

export function paymentMethodsFromConfig(dto) {
  const accepted = Array.isArray(dto?.acceptedMethods) && dto.acceptedMethods.length > 0
    ? dto.acceptedMethods.map((method) => String(method).toUpperCase())
    : PAYMENT_METHOD_ORDER;
  return accepted
    .filter((id) => PAYMENT_METHOD_LABELS[id])
    .map((id) => ({ id, label: PAYMENT_METHOD_LABELS[id] }));
}

const PAYMENTS_URL = `${API_BASE_URL}/payments`;

export function createPaymentIntent(payload, idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return axios.post(`${PAYMENTS_URL}/intents`, payload, { headers });
}

export function capturePayment(paymentId, body = {}) {
  return axios.post(`${PAYMENTS_URL}/${paymentId}/capture`, body);
}

export function confirmExternalPayment(payload, idempotencyKey) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return axios.post(`${PAYMENTS_URL}/confirm-external`, payload, { headers });
}

export function isSettledPaymentStatus(status) {
  const raw = String(status || '').toUpperCase();
  return raw === 'APPROVED' || raw === 'PAID' || raw === 'PAID_EXTERNALLY';
}
