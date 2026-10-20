import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';
/** Template centralizado da primeira mensagem. O envio continua manual no WhatsApp. */
export const DEFAULT_WHATSAPP_MESSAGE = `Olá! Tudo bem? 👋

Somos da Weper, uma plataforma que ajuda estabelecimentos a organizar pedidos, comandas, estoque, delivery próprio e cardápio digital.

Estamos buscando empreendedores para conhecer nossas soluções e possíveis parcerias.

Posso te apresentar rapidamente como funciona?

Se preferir não receber mensagens, é só me avisar.`;

const EMOJI_RE = /\p{Extended_Pictographic}/u;

export function containsEmoji(text) {
  return Boolean(text && EMOJI_RE.test(text));
}

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

/** Limite duro da URL wa.me (emojis expandem após encode). */
export const WA_ME_MAX_URL_LENGTH = 3800;
/** URL codificada acima disso → clipboard (sem emoji). */
export const WA_ME_SAFE_URL_LENGTH = 2000;
/** Texto plano acima disso → clipboard (emojis já forçam clipboard). */
export const WA_ME_MAX_TEXT_CHARS_IN_URL = 1500;

const CLIPBOARD_NOTICE =
  'A mensagem tem emojis ou é longa demais para ir na URL do WhatsApp. Abrimos só o contato e copiamos o texto — cole na conversa.';

export function buildWhatsAppUrl(phone, message = DEFAULT_WHATSAPP_MESSAGE) {
  const number = whatsAppDigits(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function whatsAppContactOnlyUrl(url) {
  if (!url) return url;
  const q = url.indexOf('?');
  return q === -1 ? url : url.slice(0, q);
}

export function shouldUseWhatsAppClipboard(plainMessage, urlWithText) {
  const text = plainMessage ?? '';
  return (
    containsEmoji(text)
    || text.length > WA_ME_MAX_TEXT_CHARS_IN_URL
    || (urlWithText && urlWithText.length > WA_ME_SAFE_URL_LENGTH)
  );
}

export function prepareWhatsAppOpen(phone, message) {
  const number = whatsAppDigits(phone);
  if (!number) return null;
  const safeMessage = message ?? '';
  const base = `https://wa.me/${number}`;
  const withText = `${base}?text=${encodeURIComponent(safeMessage)}`;
  if (shouldUseWhatsAppClipboard(safeMessage, withText)) {
    return {
      url: base,
      message: safeMessage,
      copyMessage: true,
      notice: CLIPBOARD_NOTICE,
    };
  }
  if (withText.length <= WA_ME_MAX_URL_LENGTH) {
    return { url: withText };
  }
  return {
    url: base,
    message: safeMessage,
    copyMessage: true,
    notice:
      'A mensagem é longa demais para ir na URL do WhatsApp. Abrimos só o contato e copiamos o texto — cole na conversa.',
  };
}

async function copyTextToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback abaixo */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** Modal leve para copiar manualmente quando a API de clipboard falha. */
export function showManualCopyDialog(text, notice) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '10000',
      background: 'rgba(0,0,0,0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      background: '#fff',
      color: '#111',
      maxWidth: '520px',
      width: '100%',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      fontFamily: 'system-ui, sans-serif',
    });

    const title = document.createElement('p');
    title.textContent = notice || 'Copie a mensagem abaixo e cole no WhatsApp.';
    title.style.marginTop = '0';

    const area = document.createElement('textarea');
    area.value = text;
    area.readOnly = true;
    area.rows = 12;
    Object.assign(area.style, {
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      fontSize: '14px',
    });

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
      marginTop: '12px',
    });

    const close = () => {
      overlay.remove();
      resolve();
    };

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = 'Selecionar texto';
    copyBtn.onclick = () => {
      area.focus();
      area.select();
    };

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.textContent = 'Abrir WhatsApp';
    okBtn.onclick = close;

    actions.append(copyBtn, okBtn);
    panel.append(title, area, actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    area.focus();
    area.select();
  });
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
   const targetUrl = data.copyMessage
     ? whatsAppContactOnlyUrl(data.url)
     : data.url;
   if (data.copyMessage && data.message) {
     const copied = await copyTextToClipboard(data.message);
     if (copied && data.notice) {
       window.alert(data.notice);
     } else if (!copied) {
       await showManualCopyDialog(data.message, data.notice);
     }
   }
   tab.location.href = targetUrl;
 } catch (error) {
   if (tab) tab.close();
   if (propagate) throw error;
   window.alert(error.response?.data?.message || error.message || 'Não foi possível preparar o WhatsApp.');
 }
}
