/** Template centralizado da primeira mensagem. O envio continua manual no WhatsApp. */
export const DEFAULT_WHATSAPP_MESSAGE = [
  'Olá! Tudo bem?',
  '',
  'Sou da Weper e gostaria de apresentar uma solução que pode ajudar na operação do seu estabelecimento.',
  '',
  'A Weper reúne gestão de pedidos, aplicativo para atendimento, cardápio digital, delivery próprio, controle de estoque, autoatendimento e integrações de pagamento.',
  '',
  'Posso te explicar rapidamente como funciona?',
].join('\n');

export function whatsAppDigits(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith('55')) {
    digits = `55${digits}`;
  }
  return digits;
}

export function buildWhatsAppUrl(phone, message = DEFAULT_WHATSAPP_MESSAGE) {
  const number = whatsAppDigits(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(phoneOrUrl, message = DEFAULT_WHATSAPP_MESSAGE) {
  const url = phoneOrUrl && String(phoneOrUrl).startsWith('http')
    ? phoneOrUrl
    : buildWhatsAppUrl(phoneOrUrl, message);
  if (!url || typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
