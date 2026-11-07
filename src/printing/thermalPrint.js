import { getCurrentUser } from '../services/session';
import { formatCurrency } from '../services/accessControl';
import { formatOrderDisplayCode } from '../services/salesChannel';
import { productLineTotal, resolveMandatorySelections } from '../routes/dashboard/atendimento/utils/accountTotals';

export const PRINT_VERSION = 'usb-browser-80mm-v1';

export function thermalEnabled(user = getCurrentUser(), scope = process.env.REACT_APP_THERMAL_PRINT_SCOPE || '') {
  const id = user?.storeId;
  if (id == null || id === '') return false;
  const normalized = String(scope ?? '').trim();
  if (!normalized) return false;
  if (normalized.toLowerCase() === 'all') return true;
  return normalized.split(',').map((item) => item.trim()).filter(Boolean).includes(String(id));
}

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const text = value => String(value ?? '').trim();
const money = value => formatCurrency(value);

function filled(value) {
  const normalized = text(value);
  if (!normalized || normalized === '-' || normalized === '—' || normalized === '–') return '';
  return normalized;
}

function formatQty(value) {
  const number = Number(value);
  const qty = Number.isFinite(number) && number > 0 ? number : 1;
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(qty);
}

export const TEST_ACCOUNT = { orders: [{ id: 'TESTE', customerName: 'Cliente de teste', products: [
  { name: 'Hambúrguer com queijo e descrição longa para conferir a quebra de linha', quantity: 2, value: 25.5, observation: 'Sem cebola. Acentos: ação, pão, açúcar, café.', extras: [{ name: 'Bacon', quantity: 1, price: 3 }] },
  { name: 'Água mineral', quantity: 1, value: 5 },
], observation: 'Comanda de teste — não preparar.' }] };

function orderHeading(order) {
  const id = order?.id == null || order.id === '' ? '' : String(order.id);
  const code = formatOrderDisplayCode(order);
  const customer = text(order?.customerName);
  const title = `${id ? `Pedido #${id}` : (code ? `Pedido #${code}` : 'Pedido')}${customer ? ` · ${customer}` : ''}`;
  const codeLine = code && id && code !== id ? `Código ${code}` : '';
  return { title, codeLine };
}

function fulfillmentMode(order) {
  const explicit = String(order?.deliveryFulfillment || '').trim().toUpperCase();
  if (explicit === 'DELIVERY' || explicit === 'PICKUP') return explicit;
  const source = String(order?.orderSource || '').trim().toUpperCase();
  if (source === 'PICKUP') return 'PICKUP';
  if (source === 'DELIVERY') return 'DELIVERY';
  return '';
}

function formatDeliveryAddress(order) {
  const street = [filled(order?.deliveryStreet), filled(order?.deliveryNumber)].filter(Boolean).join(', ');
  const city = [filled(order?.deliveryCity), filled(order?.deliveryState)].filter(Boolean).join('/');
  return [street, filled(order?.deliveryNeighborhood), city].filter(Boolean).join(' · ');
}

function fulfillmentBlock(order) {
  const mode = fulfillmentMode(order);
  if (mode === 'PICKUP') {
    return `<p><strong>RETIRADA NA LOJA</strong></p><p>O pedido será retirado na loja.</p>`;
  }
  if (mode !== 'DELIVERY') return '';
  const address = formatDeliveryAddress(order);
  const complement = filled(order?.deliveryComplement);
  const reference = filled(order?.deliveryReference);
  return [
    address ? `<p>Entrega: ${escape(address)}</p>` : '',
    complement ? `<p>Complemento: ${escape(complement)}</p>` : '',
    reference ? `<p>Referência: ${escape(reference)}</p>` : '',
  ].join('');
}

function placeRepeatsOrder(place, orders) {
  const normalized = text(place).replace(/\s+/g, ' ').toLowerCase();
  if (!normalized) return false;
  return (orders || []).some((order) => {
    const id = order?.id == null || order.id === '' ? '' : String(order.id).trim();
    if (!id) return false;
    return normalized === `pedido ${id}` || normalized === `pedido #${id}`;
  });
}

function orderPrintTotal(order) {
  const raw = order?.totalAmount;
  if (raw != null && raw !== '') {
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  }
  return (order?.products || []).reduce((sum, product) => sum + productLineTotal(product), 0);
}

function accountPrintTotal(orders) {
  return (orders || []).reduce((sum, order) => sum + orderPrintTotal(order), 0);
}

export function receiptHtml(account, { test = false, placeLabel = '' } = {}) {
  const orders = account?.orders || [];
  if (!orders.length || !orders.some(o => o.products?.length)) throw new Error('Não há itens carregados para imprimir.');
  const place = text(placeLabel);
  const showPlace = place && !placeRepeatsOrder(place, orders);
  const body = orders.map(order => {
    const heading = orderHeading(order);
    const cancelled = String(order?.status || '').toUpperCase() === 'CANCELLED';
    const reason = text(order?.cancelReason);
    return `<section><h2>${escape(heading.title)}</h2>
    ${heading.codeLine ? `<p>${escape(heading.codeLine)}</p>` : ''}
    ${fulfillmentBlock(order)}
    ${cancelled ? `<strong>Cancelado${reason ? `: ${escape(reason)}` : ''}</strong>` : ''}
    ${(order.products || []).map(product => {
      const extras = product.extras || [];
      const selections = resolveMandatorySelections(product);
      const name = text(product?.name) || 'Item';
      return `<article><div class="line"><strong>${escape(formatQty(product?.quantity))}x ${escape(name)}</strong><span>${escape(money(productLineTotal(product)))}</span></div>
      ${selections.map(s => `<p>${escape(s.groupName)}: ${escape(s.itemName)}${s.price > 0 ? ` (+${escape(money(s.price))})` : ''}</p>`).join('')}
      ${extras.map(extra => {
        const extraName = text(extra?.name) || 'Adicional';
        const price = Number(extra?.price) > 0 ? ` (+${escape(money(extra.price))})` : '';
        return `<p>Extra: ${escape(formatQty(extra?.quantity))}x ${escape(extraName)}${price}</p>`;
      }).join('')}
      ${text(product?.observation) ? `<p><strong>Obs.:</strong> ${escape(product.observation)}</p>` : ''}</article>`;
    }).join('')}
    ${text(order?.observation) ? `<p><strong>Observação do pedido:</strong> ${escape(order.observation)}</p>` : ''}</section>`;
  }).join('');
  const total = accountPrintTotal(orders);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Comanda</title><style>
    @page { margin: 0; } * { box-sizing: border-box; }
    html, body { width: 80mm; margin: 0; } body { padding: 4mm; color: #000; background: #fff; font: 12pt/1.35 monospace; overflow-wrap: anywhere; }
    h1 { font-size: 16pt; } h2 { font-size: 13pt; } p { margin: 2mm 0; white-space: pre-wrap; overflow-wrap: anywhere; } section { border-top: 1px dashed; padding-top: 2mm; } article { margin: 3mm 0; }
    .line { display: flex; align-items: flex-start; gap: 2mm; justify-content: space-between; } .line strong { flex: 1 1 0; min-width: 0; overflow-wrap: anywhere; } .line span { flex: 0 0 auto; white-space: nowrap; }
    </style></head><body>
    <p><strong>COMANDA</strong>${test ? ' — TESTE' : ''}</p>
    ${showPlace ? `<p>${escape(place)}</p>` : ''}
    ${body}
    <div class="line"><strong>TOTAL</strong><span>${escape(money(total))}</span></div>
    <p>Fim da comanda${test ? ' · Confira se todas as linhas saíram.' : ''}</p></body></html>`;
}

function removeFrame(frame) {
  try { frame.remove(); } catch { /* o iframe já saiu do documento */ }
}

/**
 * Chrome e Edge sempre abrem o diálogo em print() numa janela normal.
 * Não há API web para escolher a impressora USB. O trabalho sai num iframe
 * desta página, sem aba nova. Com o Chrome iniciado em --kiosk-printing,
 * o mesmo print() vai direto para a impressora padrão.
 */
export function openThermalPrint(account, options = {}) {
  if (!thermalEnabled()) throw new Error('Impressão térmica desativada para esta loja.');
  const html = receiptHtml(account, options);
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('title', 'Comanda');
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:80mm;height:200mm;border:0;';
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  const doc = frame.contentDocument || win?.document;
  if (!win || !doc) {
    removeFrame(frame);
    throw new Error('Não foi possível imprimir neste navegador.');
  }
  try {
    doc.open();
    doc.write(html);
    doc.close();
  } catch {
    removeFrame(frame);
    throw new Error('Não foi possível preparar a comanda. Tente novamente.');
  }
  if (typeof win.print !== 'function') {
    removeFrame(frame);
    throw new Error('Não foi possível imprimir neste navegador.');
  }
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    removeFrame(frame);
  };
  try { win.addEventListener('afterprint', finish); } catch { /* o diálogo ainda pode abrir */ }
  try {
    win.print();
  } catch {
    finish();
    throw new Error('Não foi possível enviar a comanda para a impressora.');
  }
  frame.dataset.printed = '1';
  return { version: PRINT_VERSION, time: new Date().toISOString(), state: 'print_requested' };
}

export function diagnosticReport({ result, notes, attempt }) {
  return JSON.stringify({ version: PRINT_VERSION, time: new Date().toISOString(), browser: navigator.userAgent, paper: '80mm', transport: 'browser-windows-driver', attempt: attempt || null, result, notes: String(notes || '').slice(0, 1500), physicalPrintVerified: false }, null, 2);
}
