/** Presets de tamanho para exportar QR Code visando impressão (~300 dpi). */
export const QR_DOWNLOAD_SIZES = [
  { id: 'small', label: 'Pequeno', hint: '≈ 3 cm', sizeCm: 3, width: 354 },
  { id: 'medium', label: 'Médio', hint: '≈ 5 cm', sizeCm: 5, width: 591 },
  { id: 'large', label: 'Grande', hint: '≈ 8 cm', sizeCm: 8, width: 945 },
  { id: 'xlarge', label: 'Extra grande', hint: '≈ 10 cm', sizeCm: 10, width: 1181 },
];

export const DEFAULT_QR_DOWNLOAD_SIZE_ID = 'medium';

/** A4 em pontos PDF (1 pt = 1/72 in). */
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;

export function getQrDownloadSize(sizeId) {
  return (
    QR_DOWNLOAD_SIZES.find((size) => size.id === sizeId) ||
    QR_DOWNLOAD_SIZES.find((size) => size.id === DEFAULT_QR_DOWNLOAD_SIZE_ID) ||
    QR_DOWNLOAD_SIZES[0]
  );
}

/** Pixels por metro para o tamanho físico desejado (chunk pHYs). */
export function pixelsPerMeterForSize(widthPx, sizeCm) {
  const cm = Number(sizeCm);
  const px = Number(widthPx);
  if (!Number.isFinite(cm) || cm <= 0 || !Number.isFinite(px) || px <= 0) {
    return Math.round(300 / 0.0254); // 300 dpi fallback
  }
  return Math.round((px * 100) / cm);
}

export function cmToPdfPoints(sizeCm) {
  return (Number(sizeCm) / 2.54) * 72;
}

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k += 1) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32be(value) {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = String(dataUrl).split(',')[1];
  if (!base64) {
    throw new Error('Data URL de imagem inválida.');
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToPngDataUrl(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

/**
 * Insere (ou substitui) o chunk pHYs no PNG para o visualizador/impressora
 * saber o tamanho físico pretendido. O Windows Photos ainda pode ignorar.
 */
export function embedPngPhys(dataUrl, pixelsPerMeter) {
  const ppm = Math.max(1, Math.round(Number(pixelsPerMeter) || 0));
  let input;
  try {
    input = dataUrlToUint8Array(dataUrl);
  } catch {
    return dataUrl;
  }
  if (input.length < 33 || input[0] !== 0x89 || input[1] !== 0x50) {
    return dataUrl;
  }

  const signature = input.subarray(0, 8);
  let offset = 8;
  const chunks = [];
  while (offset + 8 <= input.length) {
    const length =
      (input[offset] << 24) |
      (input[offset + 1] << 16) |
      (input[offset + 2] << 8) |
      input[offset + 3];
    const type = String.fromCharCode(
      input[offset + 4],
      input[offset + 5],
      input[offset + 6],
      input[offset + 7]
    );
    const chunkEnd = offset + 12 + length;
    if (chunkEnd > input.length) break;
    if (type !== 'pHYs') {
      chunks.push(input.subarray(offset, chunkEnd));
    }
    offset = chunkEnd;
    if (type === 'IEND') break;
  }

  const physData = new Uint8Array([
    ...u32be(ppm),
    ...u32be(ppm),
    1, // unit: meter
  ]);
  const physType = [0x70, 0x48, 0x59, 0x73]; // pHYs
  const physCrc = crc32(new Uint8Array([...physType, ...physData]));
  const physChunk = new Uint8Array([
    ...u32be(9),
    ...physType,
    ...physData,
    ...u32be(physCrc),
  ]);

  // pHYs logo após IHDR
  const ihdr = chunks[0];
  const rest = chunks.slice(1);
  const out = new Uint8Array(
    signature.length + physChunk.length + chunks.reduce((n, c) => n + c.length, 0)
  );
  let pos = 0;
  out.set(signature, pos);
  pos += signature.length;
  if (ihdr) {
    out.set(ihdr, pos);
    pos += ihdr.length;
  }
  out.set(physChunk, pos);
  pos += physChunk.length;
  rest.forEach((chunk) => {
    out.set(chunk, pos);
    pos += chunk.length;
  });
  return uint8ArrayToPngDataUrl(out.subarray(0, pos));
}

async function generateQrDataUrl({ value, width, level = 'M' }) {
  if (!value) {
    throw new Error('Conteúdo do QR Code ausente.');
  }
  const mod = await import('qrcode');
  const toDataURL = mod.toDataURL || mod.default?.toDataURL;
  if (typeof toDataURL !== 'function') {
    throw new Error('Gerador de QR Code indisponível.');
  }
  return toDataURL(value, {
    width,
    margin: 2,
    errorCorrectionLevel: level,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

function triggerDownload(href, downloadName) {
  const link = document.createElement('a');
  link.download = downloadName;
  link.href = href;
  link.click();
}

/**
 * Gera PNG do QR e dispara download no navegador.
 * Embutir pHYs ajuda alguns apps; o Windows Photos pode ignorar e esticar.
 * @returns {Promise<string>} data URL gerada
 */
export async function downloadQrPng({
  value,
  fileName,
  width,
  sizeCm,
  level = 'M',
}) {
  const rawDataUrl = await generateQrDataUrl({ value, width, level });
  const ppm = pixelsPerMeterForSize(width, sizeCm ?? getQrDownloadSize().sizeCm);
  const dataUrl = embedPngPhys(rawDataUrl, ppm);
  const safeName = String(fileName || 'qrcode').replace(/\.png$/i, '');
  triggerDownload(dataUrl, `${safeName}.png`);
  return dataUrl;
}

/** HTML A4 com QR centralizado no tamanho físico (cm) — não estica. */
export function buildQrPrintDocumentHtml({ dataUrl, sizeCm, title = 'QR Code' }) {
  const cm = Number(sizeCm) > 0 ? Number(sizeCm) : 5;
  const safeTitle = String(title || 'QR Code')
    .replace(/</g, '')
    .replace(/>/g, '');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    @page { size: A4; margin: 0; }
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      background: #fff;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    img {
      width: ${cm}cm;
      height: ${cm}cm;
      object-fit: contain;
      image-rendering: pixelated;
    }
    @media print {
      html, body { width: 210mm; height: 297mm; }
    }
  </style>
</head>
<body>
  <img src="${dataUrl}" alt="${safeTitle}" width="${cm}cm" height="${cm}cm" />
</body>
</html>`;
}

/**
 * Abre janela de impressão A4 com o QR no tamanho cm selecionado.
 * No diálogo do Windows, use a impressora ou "Microsoft Print to PDF".
 */
export async function printQrOnA4({
  value,
  width,
  sizeCm,
  level = 'M',
  title = 'QR Code',
}) {
  const rawDataUrl = await generateQrDataUrl({ value, width, level });
  const ppm = pixelsPerMeterForSize(width, sizeCm);
  const dataUrl = embedPngPhys(rawDataUrl, ppm);
  const html = buildQrPrintDocumentHtml({ dataUrl, sizeCm, title });
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=800,height=900');
  if (!printWindow) {
    throw new Error('Pop-up bloqueado. Permita janelas pop-up para imprimir.');
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  const doPrint = () => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      /* ignore */
    }
  };
  if (printWindow.document.readyState === 'complete') {
    setTimeout(doPrint, 250);
  } else {
    printWindow.onload = () => setTimeout(doPrint, 250);
  }
  return dataUrl;
}

function concatUint8Arrays(parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  parts.forEach((part) => {
    out.set(part, pos);
    pos += part.length;
  });
  return out;
}

function encodeUtf8(text) {
  return new TextEncoder().encode(text);
}

/**
 * PDF A4 mínimo com JPEG centralizado no tamanho físico (cm).
 * Função pura (sem DOM) — fácil de testar.
 */
export function buildA4CenteredJpegPdf({
  jpegBytes,
  sizeCm,
  pixelWidth,
  pixelHeight,
}) {
  if (!jpegBytes?.length) {
    throw new Error('Imagem JPEG ausente.');
  }
  const imgPt = cmToPdfPoints(sizeCm);
  if (!Number.isFinite(imgPt) || imgPt <= 0) {
    throw new Error('Tamanho em cm inválido.');
  }
  const px = Number(pixelWidth) > 0 ? Math.round(Number(pixelWidth)) : Math.round(imgPt);
  const py = Number(pixelHeight) > 0 ? Math.round(Number(pixelHeight)) : Math.round(imgPt);
  const x = (A4_WIDTH_PT - imgPt) / 2;
  const y = (A4_HEIGHT_PT - imgPt) / 2;
  const content = `q\n${imgPt.toFixed(2)} 0 0 ${imgPt.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
  const contentBytes = encodeUtf8(content);

  const parts = [];
  const offsets = [0];

  const push = (bytes) => {
    parts.push(bytes);
  };

  push(encodeUtf8('%PDF-1.4\n'));

  const writeObj = (id, bodyParts) => {
    offsets[id] = parts.reduce((n, p) => n + p.length, 0);
    push(encodeUtf8(`${id} 0 obj\n`));
    bodyParts.forEach((p) => push(p));
    push(encodeUtf8('\nendobj\n'));
  };

  writeObj(1, [encodeUtf8('<< /Type /Catalog /Pages 2 0 R >>')]);
  writeObj(2, [encodeUtf8('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')]);
  writeObj(3, [
    encodeUtf8(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_WIDTH_PT} ${A4_HEIGHT_PT}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`
    ),
  ]);
  writeObj(4, [
    encodeUtf8(
      `<< /Type /XObject /Subtype /Image /Width ${px} /Height ${py} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
    ),
    jpegBytes,
    encodeUtf8('\nendstream'),
  ]);
  writeObj(5, [
    encodeUtf8(`<< /Length ${contentBytes.length} >>\nstream\n`),
    contentBytes,
    encodeUtf8('endstream'),
  ]);

  const xrefStart = parts.reduce((n, p) => n + p.length, 0);
  const objectCount = 5;
  let xref = `xref\n0 ${objectCount + 1}\n`;
  xref += '0000000000 65535 f \n';
  for (let id = 1; id <= objectCount; id += 1) {
    xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  push(encodeUtf8(xref));
  push(
    encodeUtf8(
      `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
    )
  );

  return concatUint8Arrays(parts);
}

/** Converte data URL PNG/JPEG em bytes JPEG via canvas (browser). */
export async function dataUrlToJpegBytes(dataUrl, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas indisponível.'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Falha ao gerar JPEG.'));
              return;
            }
            const buffer = await blob.arrayBuffer();
            resolve({
              bytes: new Uint8Array(buffer),
              width: canvas.width,
              height: canvas.height,
            });
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem do QR.'));
    img.src = dataUrl;
  });
}

/**
 * Gera PDF A4 com QR no tamanho cm e dispara download.
 * Preferível ao PNG sozinho para impressão no Windows.
 */
export async function downloadQrPrintPdf({
  value,
  fileName,
  width,
  sizeCm,
  level = 'M',
}) {
  const rawDataUrl = await generateQrDataUrl({ value, width, level });
  const { bytes, width: px, height: py } = await dataUrlToJpegBytes(rawDataUrl);
  const pdfBytes = buildA4CenteredJpegPdf({
    jpegBytes: bytes,
    sizeCm,
    pixelWidth: px,
    pixelHeight: py,
  });
  const safeName = String(fileName || 'qrcode').replace(/\.(png|pdf)$/i, '');
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  try {
    triggerDownload(url, `${safeName}-impressao.pdf`);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  return pdfBytes;
}
