/** Template centralizado da primeira mensagem. O envio continua manual no WhatsApp. */
export const DEFAULT_WHATSAPP_MESSAGE = [
  'Olá, tudo bem? 😊💙',
  '',
  'Hoje vocês já utilizam algum software para ajudar na gestão?',
  '',
  'A Weper junta a operação do estabelecimento em um só sistema:',
  '',
  '📱 *App Garçom* — mesas, comandas e pedidos no celular',
  '🍽️ *Cardápio digital* — o cliente escolhe pelo QR Code',
  '🛵 *Delivery próprio* — pedido, retirada e entrega no seu canal',
  '🍳 *Cozinha* — cada pedido na etapa certa',
  '📦 *Estoque* — o que entra e o que sai',
  '💳 *PDV e pagamentos* — caixa e impressão no balcão',
  '📊 *Painel administrativo* — faturamento, equipe e indicadores',
  '',
  'Estamos selecionando alguns estabelecimentos para uma *parceria com condições especiais*, incluindo *módulos gratuitos*, de acordo com a operação.',
  '',
  'Que tal conversarmos para entender como vocês trabalham hoje e avaliar uma parceria? 💙🚀',
  '',
  '🌐 https://www.instagram.com/weper.com.br/',
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
