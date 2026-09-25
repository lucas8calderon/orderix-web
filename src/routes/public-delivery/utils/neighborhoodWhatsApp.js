import { buildWhatsAppUrl } from '../orderTrackingConfig';

export function isValidStoreWhatsApp(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export function neighborhoodRequestMessage(storeName, neighborhood) {
  const store = String(storeName || '').trim() || 'loja';
  const area = String(neighborhood || '').trim();
  return `Olá! Gostaria de fazer um pedido na ${store}, mas não encontrei o bairro ${area} na lista de entregas. Vocês entregam nesse bairro? Se sim, poderiam cadastrá-lo?`;
}

export function neighborhoodWhatsAppUrl(phone, storeName, neighborhood) {
  if (!isValidStoreWhatsApp(phone)) return null;
  const base = buildWhatsAppUrl(phone);
  if (!base) return null;
  const message = neighborhoodRequestMessage(storeName, neighborhood);
  return `${base}?text=${encodeURIComponent(message)}`;
}
