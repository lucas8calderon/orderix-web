/** Mensagem padrão do botão Abrir no WhatsApp. O texto pode ser editado antes de abrir. */
export const WEPER_WHATSAPP_MESSAGE = [
  'Olá! Tudo bem? 💙',
  '',
  'Somos da Weper, uma plataforma de gestão desenvolvida para ajudar estabelecimentos a organizar pedidos, vender com mais autonomia e simplificar a operação.',
  '',
  'Com a Weper, seu negócio pode contar com:',
  '',
  '• Delivery próprio sem comissões por pedido cobradas pela Weper.',
  '• Cardápio digital personalizado.',
  '• Gestão de mesas, comandas e pedidos.',
  '• Painel de cozinha em tempo real.',
  '• Controle de estoque e vendas.',
  '• Integrações de pagamento.',
  '',
  'Tudo em uma única plataforma, com planos a partir de R$ 39,90/mês.',
  '',
  'Gostaria de conhecer uma demonstração de como a Weper pode ajudar seu estabelecimento? 🚀',
  '',
  'www.weper.com.br',
].join('\n');

/**
 * Telefone BR para wa.me: DDI 55 + DDD + 8 ou 9 dígitos.
 * Não acrescenta outro 55 quando o número já começa com 55.
 * Nove dígitos sem DDD, vazio ou estrangeiro retornam null.
 */
export function normalizeBrazilWhatsAppPhone(raw) {
  if (raw == null || String(raw).trim() === '') {
    return null;
  }
  const original = String(raw).trim();
  let digits = original.replace(/\D/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  const international = original.startsWith('+') || original.startsWith('00');
  if (!international && digits.length >= 10 && digits.length <= 11) {
    digits = `55${digits}`;
  }
  if (!digits.startsWith('55') || digits.length < 12 || digits.length > 13) {
    return null;
  }
  const ddd = Number(digits.slice(2, 4));
  if (!Number.isInteger(ddd) || ddd < 11 || ddd > 99) {
    return null;
  }
  const local = digits.slice(4);
  if (local.length !== 8 && local.length !== 9) {
    return null;
  }
  return digits;
}

export function buildWhatsAppUrl(phone, message) {
  const number = normalizeBrazilWhatsAppPhone(phone);
  if (!number) {
    return null;
  }
  const text = message == null ? '' : String(message);
  if (!text.trim()) {
    return `https://wa.me/${number}`;
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
