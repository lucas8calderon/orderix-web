import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';
/** Template centralizado da primeira mensagem. O envio continua manual no WhatsApp. */
export const DEFAULT_WHATSAPP_MESSAGE = "Olá! Somos a Weper. Estamos oferecendo uma parceria gratuita, com todos os módulos e benefícios, para você conhecer nossa solução de gestão. Podemos conversar? Se preferir não receber contatos, é só avisar.";

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

export function buildWhatsAppUrl(phone, message = DEFAULT_WHATSAPP_MESSAGE) {
  const number = whatsAppDigits(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
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
