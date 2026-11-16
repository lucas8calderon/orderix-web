import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';
/**
 * O painel edita o primeiro contato. O backend escolhe o texto ao abrir:
 * Novo lead e Contatado usam esse template; Aguardando retorno usa o follow-up;
 * as outras colunas abrem o chat sem mensagem.
 */
export function whatsAppOpenHint(status) {
  if (status === 'NEW' || status === 'CONTACTED') {
    return 'A mensagem de primeiro contato já vem preenchida.';
  }
  if (status === 'WAITING_RESPONSE') {
    return 'A mensagem de retorno já vem preenchida.';
  }
  return 'Esta coluna abre o WhatsApp sem mensagem pronta.';
}

/** Texto inicial do primeiro contato. O painel usa a mensagem salva no backend. */
export const DEFAULT_WHATSAPP_MESSAGE = `Olá! Tudo bem?

Somos da Weper e gostaríamos de apresentar uma oportunidade para ajudar o seu negócio a crescer, vender mais e ter mais autonomia!

A Weper é uma plataforma completa de gestão e vendas, desenvolvida para facilitar a rotina de estabelecimentos de diferentes segmentos, reunindo diversas soluções em um só lugar:

*Delivery próprio* — Receba pedidos diretamente dos seus clientes, sem depender de aplicativos de terceiros.

*Cardápio Digital* — Personalizado com a identidade da sua marca.

*Gestão de Mesas e Comandas* — Mais organização e agilidade nos atendimentos.

*Aplicativo de Garçom e Painel de Cozinha* — Controle seus pedidos em tempo real.

*Controle de Estoque e Vendas* — Acompanhe sua operação e seu faturamento.

*Autoatendimento* — Mais praticidade e autonomia para seus clientes.

*E sabe qual é o nosso grande diferencial?*

Diferentemente de marketplaces como iFood, Keeta e 99Food, que trabalham com modelos de cobrança de comissões e taxas, a Weper não cobra comissão sobre suas vendas!

- 100% do valor das vendas pertence ao seu estabelecimento, sem descontos de comissão da Weper.
- Sem taxas por pedido ou percentual sobre seu faturamento cobrados pela Weper.
- Mais liberdade para vender e fortalecer sua própria marca.

Taxas de processamento de pagamentos de parceiros financeiros, quando aplicáveis, são independentes da Weper.

*Experimente 7 dias grátis!*

*Planos completos a partir de R$ 39,90/mês*, com soluções para ajudar seu negócio a crescer sem comprometer seu faturamento.

Mais do que oferecer tecnologia, queremos construir parcerias de verdade! Nosso compromisso é ajudar empreendedores a simplificar suas operações, conquistar clientes e crescer de forma sustentável.

Acreditamos que, quando nossos parceiros crescem, a Weper cresce junto!

*Que tal conhecer a Weper e descobrir como podemos ajudar o seu estabelecimento?*

Será um prazer apresentar nossas soluções, sem compromisso!`;

export function whatsAppDigits(phone) {
  if (!phone) return '';
  const international = /^\s*(\+|00)/.test(String(phone));
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (!international && digits.length >= 10 && digits.length <= 11) {
    digits = `55${digits}`;
  }
  return digits;
}

export function buildWhatsAppUrl(phone) {
  const number = whatsAppDigits(phone);
  if (!number) return null;
  return `https://wa.me/${number}`;
}

export function prepareWhatsAppOpen(phone) {
  const url = buildWhatsAppUrl(phone);
  return url ? { url } : null;
}

export const whatsappApi = {
 get: path => axios.get(API_BASE_URL + '/api/crm/whatsapp' + path),
 post: path => axios.post(API_BASE_URL + '/api/crm/whatsapp' + path),
 put: (path, body) => axios.put(API_BASE_URL + '/api/crm/whatsapp' + path, body),
};

export async function openWhatsAppLead(id, propagate = false) {
 const tab = window.open('about:blank', '_blank');
 if (tab) tab.opener = null;
 try {
   if (!tab) throw new Error('Permita pop-ups para abrir o WhatsApp.');
   const { data } = await whatsappApi.post('/leads/' + id + '/open');
   tab.location.href = data.url;
 } catch (error) {
   if (tab) tab.close();
   if (propagate) throw error;
   window.alert(error.response?.data?.message || error.message || 'Não foi possível preparar o WhatsApp.');
 }
}
