import axios from 'axios';

export const MERCADO_PAGO_SDK_URL = 'https://sdk.mercadopago.com/js/v2';

/** Carrega o MercadoPago.js v2 uma vez por página. */
export function loadMercadoPago() {
  if (window.MercadoPago) {
    return Promise.resolve(window.MercadoPago);
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-mp-sdk="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.MercadoPago), { once: true });
      existing.addEventListener('error', () => reject(new Error('sdk')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = MERCADO_PAGO_SDK_URL;
    script.async = true;
    script.dataset.mpSdk = '1';
    script.onload = () => resolve(window.MercadoPago);
    script.onerror = () => reject(new Error('sdk'));
    document.body.appendChild(script);
  });
}

const ASAAS_CHECKOUT = { gateway: 'ASAAS', available: true, mercadoPagoPublicKey: '', message: '', pixAvailable: true };

/**
 * Gateway das contratações novas. Com Mercado Pago, traz só a public key da conta Weper.
 * Falha de rede mantém o fluxo atual do Asaas.
 */
export async function fetchSignupGateway() {
  try {
    const response = await axios.get('/api/public/billing/gateway');
    const data = response?.data || {};
    if (data.gateway !== 'MERCADO_PAGO') return ASAAS_CHECKOUT;
    return {
      gateway: 'MERCADO_PAGO',
      available: Boolean(data.available && data.mercadoPagoPublicKey),
      mercadoPagoPublicKey: String(data.mercadoPagoPublicKey || ''),
      message: String(data.message || ''),
      // Ausente em API antiga: trata como disponível para não esconder o Pix sem motivo.
      pixAvailable: data.pixAvailable !== false,
    };
  } catch {
    return ASAAS_CHECKOUT;
  }
}

/**
 * Gera o token do cartão no navegador com a public key da Weper.
 * Número, validade e CVV vão direto ao Mercado Pago; a Weper recebe só o token.
 */
export async function createMercadoPagoCardToken(publicKey, card) {
  const MercadoPago = await loadMercadoPago();
  if (!MercadoPago) throw new Error('sdk');
  const mp = new MercadoPago(publicKey, { locale: 'pt-BR' });
  const digits = String(card.document || '').replace(/\D/g, '');
  const year = String(card.expiryYear || '').trim();
  const token = await mp.createCardToken({
    cardNumber: String(card.number || '').replace(/\D/g, ''),
    cardholderName: String(card.holderName || '').trim(),
    cardExpirationMonth: String(card.expiryMonth || '').padStart(2, '0'),
    cardExpirationYear: year.length === 2 ? `20${year}` : year,
    securityCode: String(card.ccv || '').trim(),
    identificationType: digits.length > 11 ? 'CNPJ' : 'CPF',
    identificationNumber: digits,
  });
  if (!token || !token.id) throw new Error('token');
  return String(token.id);
}
