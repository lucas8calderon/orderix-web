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

export function receiptHtml(account, { test = false, placeLabel = '' } = {}) {
  const orders = account?.orders || [];
  if (!orders.length || !orders.some(o => o.products?.length)) throw new Error('Não há itens carregados para imprimir.');
  const storeName = text(getCurrentUser()?.storeName);
  const place = text(placeLabel);
  const body = orders.map(order => {
    const heading = orderHeading(order);
    const cancelled = String(order?.status || '').toUpperCase() === 'CANCELLED';
    const reason = text(order?.cancelReason);
    return `<section><h2>${escape(heading.title)}</h2>
    ${heading.codeLine ? `<p>${escape(heading.codeLine)}</p>` : ''}
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
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Weper — comanda 80 mm</title><style>
    @page { margin: 0; } * { box-sizing: border-box; }
    html, body { width: 80mm; margin: 0; } body { padding: 4mm; color: #000; background: #fff; font: 12pt/1.35 monospace; overflow-wrap: anywhere; }
    h1 { font-size: 16pt; } h2 { font-size: 13pt; } p { margin: 2mm 0; white-space: pre-wrap; overflow-wrap: anywhere; } section { border-top: 1px dashed; padding-top: 2mm; } article { margin: 3mm 0; }
    .line { display: flex; align-items: flex-start; gap: 2mm; justify-content: space-between; } .line strong { flex: 1 1 0; min-width: 0; overflow-wrap: anywhere; } .line span { flex: 0 0 auto; white-space: nowrap; }
    nav { font: 11pt sans-serif; margin-bottom: 5mm; } @media print { nav { display: none; } }
    </style></head><body><nav><button id="print" type="button">Imprimir</button><p>Selecione a KP-IM609, papel 80 mm, escala 100%, margens nenhuma e desative cabeçalhos e rodapés. Cancelar esta janela não imprime. Feche a aba ao terminar.</p></nav>
    <h1>WEPER${test ? ' — TESTE' : ''}</h1>
    ${storeName ? `<p>${escape(storeName)}</p>` : ''}
    <p><strong>COMANDA</strong></p>
    <p>NÃO É DOCUMENTO FISCAL</p>
    <p>NÃO É COMPROVANTE DE PAGAMENTO</p>
    ${place ? `<p>${escape(place)}</p>` : ''}
    ${body}<p>Fim da comanda${test ? ' · Confira se todas as linhas saíram.' : ''}</p></body></html>`;
}

export function openThermalPrint(account, options = {}) {
  if (!thermalEnabled()) throw new Error('Impressão térmica desativada para esta loja.');
  const html = receiptHtml(account, options);
  const popup = window.open('', '_blank');
  if (!popup) throw new Error('Permita pop-ups para a Weper e tente novamente.');
  try {
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  } catch {
    try { popup.close(); } catch { /* a janela já estava inacessível */ }
    throw new Error('Não foi possível abrir a impressão. Tente novamente.');
  }
  try { popup.opener = null; } catch { /* segue mesmo se o navegador impedir a alteração */ }
  try {
    const button = popup.document.getElementById('print');
    if (button) {
      button.addEventListener('click', () => {
        try { popup.focus(); } catch { /* o diálogo ainda pode abrir */ }
        try { popup.print(); } catch { /* o botão continua na janela */ }
      });
    }
  } catch { /* a janela já tem o conteúdo para imprimir */ }
  // print() permanece neste clique para o navegador permitir o diálogo.
  // Abrir, fechar ou afterprint não comprovam papel, spooler nem cancelamento.
  try { popup.focus(); } catch { /* a janela segue aberta */ }
  try {
    popup.print();
  } catch {
    throw new Error('A janela abriu, mas o diálogo não apareceu. Use o botão Imprimir nessa janela.');
  }
  return { version: PRINT_VERSION, time: new Date().toISOString(), state: 'print_requested' };
}

export function diagnosticReport({ result, notes, attempt }) {
  return JSON.stringify({ version: PRINT_VERSION, time: new Date().toISOString(), browser: navigator.userAgent, paper: '80mm', transport: 'browser-windows-driver', attempt: attempt || null, result, notes: String(notes || '').slice(0, 1500), physicalPrintVerified: false }, null, 2);
}
