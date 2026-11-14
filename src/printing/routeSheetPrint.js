function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function removeFrame(frame) {
  try { frame.remove(); } catch { /* o iframe já saiu do documento */ }
}

export function routeSheetHtml({
  storeName,
  routeLabel,
  stopCount,
  originAddress,
  courierName,
  stops,
  publicUrl,
  pin,
  qrDataUrl,
}) {
  const rows = (stops || []).map((stop) => `
    <article>
      <p><strong>${escapeHtml(stop.sequence)}. Pedido ${escapeHtml(stop.orderLabel)}</strong></p>
      <p>${escapeHtml(stop.address || stop.addressLine || '')}</p>
      ${stop.neighborhood ? `<p>${escapeHtml(stop.neighborhood)}</p>` : ''}
      ${stop.complement ? `<p>Compl.: ${escapeHtml(stop.complement)}</p>` : ''}
    </article>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Rota de entregas</title><style>
    @page { size: 80mm auto; margin: 4mm; }
    * { box-sizing: border-box; }
    html, body { width: 80mm; margin: 0; }
    body { padding: 4mm; color: #000; background: #fff; font: 12pt/1.35 monospace; overflow-wrap: anywhere; }
    h1 { font-size: 16pt; margin: 0 0 2mm; }
    h2 { font-size: 13pt; margin: 0 0 3mm; }
    p { margin: 2mm 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    article { border-top: 1px dashed #000; padding-top: 2mm; margin-top: 2mm; }
    img { display: block; width: 48mm; height: 48mm; margin: 4mm auto; }
    </style></head><body>
    <h1>WEPER</h1>
    <h2>ROTA DE ENTREGAS</h2>
    <p>Rota ${escapeHtml(routeLabel || '')}</p>
    <p>${escapeHtml(stopCount)} paradas</p>
    <p>Saída: ${escapeHtml(storeName || '')}</p>
    ${originAddress ? `<p>${escapeHtml(originAddress)}</p>` : ''}
    ${courierName ? `<p>Motoboy: ${escapeHtml(courierName)}</p>` : ''}
    ${rows}
    <p>Escaneie para abrir a rota</p>
    <img src="${escapeHtml(qrDataUrl || '')}" alt="QR Code da rota" width="240" height="240" />
    <p>${escapeHtml(publicUrl || '')}</p>
    <p><strong>PIN ${escapeHtml(pin || '')}</strong></p>
    </body></html>`;
}

/**
 * Mesma técnica de iframe da comanda, sem passar pela flag da impressora térmica
 * e sem alterar o comprovante individual.
 */
export async function openRouteSheetPrint(model) {
  const QRCode = (await import('qrcode')).default;
  const qrDataUrl = await QRCode.toDataURL(model.publicUrl, {
    margin: 2,
    width: 280,
    errorCorrectionLevel: 'M',
  });
  const html = routeSheetHtml({ ...model, qrDataUrl });
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('title', 'Rota de entregas');
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
    throw new Error('Não foi possível preparar a rota. Tente novamente.');
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
    throw new Error('Não foi possível enviar a rota para a impressora.');
  }
  return { state: 'print_requested' };
}
