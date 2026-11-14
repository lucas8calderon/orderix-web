import { getCurrentUser } from '../services/session';
import { formatCurrency } from '../services/accessControl';
import { orderNumberLabel } from '../services/salesChannel';
import { productLineTotal, resolveMandatorySelections } from '../routes/dashboard/atendimento/utils/accountTotals';
import { apiErrorMessage, ensureDeliveryReceiptRoute } from '../services/deliveryRouteApi';

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
  const customer = text(order?.customerName);
  // O número que a loja lê na comanda é o do dia (displayCode). O id interno só aparece quando não há código.
  const number = orderNumberLabel(order);
  const title = `${number ? `Pedido #${number}` : 'Pedido'}${customer ? ` · ${customer}` : ''}`;
  return { title, codeLine: '' };
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

function streetLine(order) {
  return [filled(order?.deliveryStreet), filled(order?.deliveryNumber)].filter(Boolean).join(', ');
}

function cityLine(order) {
  const neighborhood = filled(order?.deliveryNeighborhood);
  const city = [filled(order?.deliveryCity), filled(order?.deliveryState)].filter(Boolean).join('/');
  if (neighborhood && city) return `${neighborhood} - ${city}`;
  return neighborhood || city;
}

function formatReceiptWhen(value) {
  const raw = String(value ?? '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (match && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) {
    return `${match[3]}/${match[2]}/${match[1]} - ${match[4]}:${match[5]}`;
  }
  const date = new Date(raw);
  if (!raw || Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value || '';
  if (!part('day') || !part('hour')) return '';
  return `${part('day')}/${part('month')}/${part('year')} - ${part('hour')}:${part('minute')}`;
}

export function isDeliveryReceiptAccount(account) {
  const orders = account?.orders || [];
  return orders.length > 0 && orders.every((order) => fulfillmentMode(order) === 'DELIVERY');
}

function routeQrFor(order, options) {
  const map = options?.routeQrByOrderId || {};
  if (order?.id == null) return '';
  return map[order.id] || map[String(order.id)] || '';
}

function productArticles(order) {
  return (order.products || []).map((product) => {
    const extras = product.extras || [];
    const selections = resolveMandatorySelections(product);
    const name = text(product?.name) || 'Item';
    return `<article><div class="line"><strong>${escape(formatQty(product?.quantity))}x ${escape(name)}</strong><span>${escape(money(productLineTotal(product)))}</span></div>
      ${selections.map((selection) => `<p>${escape(selection.groupName)}: ${escape(selection.itemName)}${selection.price > 0 ? ` (+${escape(money(selection.price))})` : ''}</p>`).join('')}
      ${extras.map((extra) => {
        const extraName = text(extra?.name) || 'Adicional';
        const price = Number(extra?.price) > 0 ? ` (+${escape(money(extra.price))})` : '';
        return `<p>Extra: ${escape(formatQty(extra?.quantity))}x ${escape(extraName)}${price}</p>`;
      }).join('')}
      ${text(product?.observation) ? `<p><strong>Obs.:</strong> ${escape(product.observation)}</p>` : ''}</article>`;
  }).join('');
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
    return [id, orderNumberLabel(order)].filter(Boolean)
      .some((value) => normalized === `pedido ${value}`.toLowerCase() || normalized === `pedido #${value}`.toLowerCase());
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

function deliveryFeeAmount(order) {
  const fee = Number(order?.deliveryFee);
  return Number.isFinite(fee) && fee > 0 ? fee : 0;
}

const RECEIPT_PAYMENT_LABELS = {
  PIX: 'Pix',
  CASH: 'Dinheiro',
  CREDIT: 'Cartão de crédito',
  DEBIT: 'Cartão de débito',
  VOUCHER: 'Vale',
  OTHER: 'Outro',
};

function isSettledCoverage(status) {
  const raw = String(status || '').toUpperCase();
  return raw === 'APPROVED' || raw === 'PAID' || raw === 'PAID_EXTERNALLY';
}

function receiptPaymentLabel(order) {
  const key = String(order?.paymentMethod || '').trim().toUpperCase();
  return RECEIPT_PAYMENT_LABELS[key] || '';
}

/** Cobertura quitada no ledger, ou a cobrança combinada na entrega/retirada. A forma escolhida sozinha não quita. */
function paymentReceiptHtml(order) {
  const method = receiptPaymentLabel(order);
  if (isSettledCoverage(order?.paymentStatus)) {
    const title = method ? `Pago · ${method}` : 'Pago';
    return `<p class="pay"><strong>${escape(title)}</strong></p>`;
  }
  const collectOnFulfillment = order?.onlinePayment !== true;
  const moment = collectOnFulfillment ? fulfillmentMode(order) : '';
  const title = moment === 'DELIVERY'
    ? 'A receber na entrega'
    : moment === 'PICKUP'
      ? 'A receber na retirada'
      : 'Não pago';
  return `<p class="pay"><strong>${escape(title)}</strong></p>${method ? `<p class="pay">${escape(method)}</p>` : ''}`;
}

function deliveryOrderBlock(order, options) {
  const number = orderNumberLabel(order);
  const when = formatReceiptWhen(order?.createdAt);
  const customer = text(order?.customerName);
  const street = streetLine(order);
  const city = cityLine(order);
  const complement = filled(order?.deliveryComplement);
  const reference = filled(order?.deliveryReference);
  const cancelled = String(order?.status || '').toUpperCase() === 'CANCELLED';
  const reason = text(order?.cancelReason);
  const qr = routeQrFor(order, options);
  const fee = deliveryFeeAmount(order);
  return `<section class="delivery-order">
    <h2>PEDIDO ${number ? `#${escape(number)}` : ''}</h2>
    ${when ? `<p class="center">${escape(when)}</p>` : ''}
    <h3>ENTREGA</h3>
    <p>Cliente: ${escape(customer || 'Cliente')}</p>
    ${street ? `<p>${escape(street)}</p>` : ''}
    ${city ? `<p>${escape(city)}</p>` : ''}
    ${complement ? `<p>Compl.: ${escape(complement)}</p>` : ''}
    ${reference ? `<p>Ref.: ${escape(reference)}</p>` : ''}
    ${cancelled ? `<strong>Cancelado${reason ? `: ${escape(reason)}` : ''}</strong>` : ''}
    ${productArticles(order)}
    ${text(order?.observation) ? `<p><strong>Observação do pedido:</strong> ${escape(order.observation)}</p>` : ''}
    <div class="line"><span>Taxa entrega</span><span>${escape(money(fee))}</span></div>
    <div class="line"><strong>TOTAL</strong><span>${escape(money(orderPrintTotal(order)))}</span></div>
    ${paymentReceiptHtml(order)}
    <h3 class="center route-title">ROTA DE ENTREGA</h3>
    ${qr ? `<img class="qr" src="${escape(qr)}" alt="QR Code da rota" width="280" height="280" />` : ''}
    <p class="center">Escaneie para abrir a rota</p>
    </section>`;
}

const CLASSIC_STYLE = `<style>
    @page { margin: 0; } * { box-sizing: border-box; }
    html, body { width: 80mm; margin: 0; } body { padding: 4mm; color: #000; background: #fff; font: 12pt/1.35 monospace; overflow-wrap: anywhere; }
    h1 { font-size: 16pt; } h2 { font-size: 13pt; } p { margin: 2mm 0; white-space: pre-wrap; overflow-wrap: anywhere; } section { border-top: 1px dashed; padding-top: 2mm; } article { margin: 3mm 0; }
    .line { display: flex; align-items: flex-start; gap: 2mm; justify-content: space-between; } .line strong { flex: 1 1 0; min-width: 0; overflow-wrap: anywhere; } .line span { flex: 0 0 auto; white-space: nowrap; }
    p.pay { margin: 2mm 0 0; text-align: center; } p.pay + p.pay { margin-top: 0; }
    </style>`;

const DELIVERY_STYLE = `<style>
    @page { margin: 0; } * { box-sizing: border-box; }
    html, body { width: 80mm; margin: 0; } body { padding: 4mm; color: #000; background: #fff; font: 12pt/1.35 monospace; overflow-wrap: anywhere; }
    h1.store { font-size: 16pt; text-align: center; margin: 0 0 2mm; }
    h2 { font-size: 13pt; text-align: center; margin: 1mm 0; }
    h3 { font-size: 12pt; margin: 3mm 0 1mm; }
    p { margin: 2mm 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    .center { text-align: center; }
    section { border-top: 1px dashed; padding-top: 2mm; margin-top: 2mm; }
    article { margin: 3mm 0; }
    .line { display: flex; align-items: flex-start; gap: 2mm; justify-content: space-between; }
    .line strong, .line span:first-child { flex: 1 1 0; min-width: 0; overflow-wrap: anywhere; }
    .line span:last-child { flex: 0 0 auto; white-space: nowrap; }
    img.qr { display: block; width: 48mm; height: 48mm; max-width: 100%; margin: 4mm auto; page-break-inside: avoid; break-inside: avoid; }
    p.pay { margin: 2mm 0 0; text-align: center; } p.pay + p.pay { margin-top: 0; }
    </style>`;

function deliveryReceiptHtml(account, options) {
  const orders = account?.orders || [];
  const storeName = text(options.storeName) || text(getCurrentUser()?.storeName);
  const body = orders.map((order) => deliveryOrderBlock(order, options)).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Comanda</title>${DELIVERY_STYLE}</head><body>
    ${storeName ? `<h1 class="store">${escape(storeName.toLocaleUpperCase('pt-BR'))}</h1>` : ''}
    ${body}
    </body></html>`;
}

function isSafeRouteUrl(value) {
  try {
    const url = new URL(value, 'https://www.weper.com.br');
    if (url.username || url.password) return false;
    if (url.search || url.hash) return false;
    return /^\/rotas\/[^/]+$/.test(url.pathname);
  } catch {
    return false;
  }
}

export async function loadDeliveryReceiptOptions(account) {
  const orders = (account?.orders || []).filter((order) => fulfillmentMode(order) === 'DELIVERY');
  if (!orders.length) return {};
  const QRCode = (await import('qrcode')).default;
  const routeQrByOrderId = {};
  let storeName = '';
  for (const order of orders) {
    let response;
    try {
      response = await ensureDeliveryReceiptRoute(order.id);
    } catch (error) {
      throw new Error(apiErrorMessage(error, 'Não foi possível gerar o QR da rota.'));
    }
    const publicUrl = text(response?.data?.publicUrl);
    if (!isSafeRouteUrl(publicUrl)) {
      throw new Error('Não foi possível gerar o QR da rota.');
    }
    if (!storeName) storeName = text(response?.data?.storeName);
    routeQrByOrderId[order.id] = await QRCode.toDataURL(publicUrl, {
      margin: 2,
      width: 280,
      errorCorrectionLevel: 'M',
    });
  }
  return { storeName, routeQrByOrderId };
}

export function receiptHtml(account, options = {}) {
  const { test = false, placeLabel = '' } = options;
  const orders = account?.orders || [];
  if (!orders.length || !orders.some(o => o.products?.length)) throw new Error('Não há itens carregados para imprimir.');
  if (isDeliveryReceiptAccount(account)) return deliveryReceiptHtml(account, options);
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
    ${productArticles(order)}
    ${text(order?.observation) ? `<p><strong>Observação do pedido:</strong> ${escape(order.observation)}</p>` : ''}</section>`;
  }).join('');
  const total = accountPrintTotal(orders);
  const payment = orders
    .filter((order) => fulfillmentMode(order))
    .map((order) => paymentReceiptHtml(order))
    .join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Comanda</title>${CLASSIC_STYLE}</head><body>
    <p><strong>COMANDA</strong>${test ? ' — TESTE' : ''}</p>
    ${showPlace ? `<p>${escape(place)}</p>` : ''}
    ${body}
    <div class="line"><strong>TOTAL</strong><span>${escape(money(total))}</span></div>
    ${payment}
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
  if (isDeliveryReceiptAccount(account)) {
    const missing = (account?.orders || []).some((order) => !routeQrFor(order, options));
    if (missing) throw new Error('Não foi possível gerar o QR da rota.');
  }
  const html = receiptHtml(account, options);
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('title', 'Comanda');
  const frameHeight = isDeliveryReceiptAccount(account) ? '600mm' : '200mm';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:80mm;height:${frameHeight};border:0;`;
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
