/** Presets de tamanho para exportar QR Code visando impressão (~300 dpi). */
export const QR_DOWNLOAD_SIZES = [
  { id: 'small', label: 'Pequeno', hint: '≈ 3 cm', width: 354 },
  { id: 'medium', label: 'Médio', hint: '≈ 5 cm', width: 591 },
  { id: 'large', label: 'Grande', hint: '≈ 8 cm', width: 945 },
  { id: 'xlarge', label: 'Extra grande', hint: '≈ 10 cm', width: 1181 },
];

export const DEFAULT_QR_DOWNLOAD_SIZE_ID = 'medium';

export function getQrDownloadSize(sizeId) {
  return (
    QR_DOWNLOAD_SIZES.find((size) => size.id === sizeId) ||
    QR_DOWNLOAD_SIZES.find((size) => size.id === DEFAULT_QR_DOWNLOAD_SIZE_ID) ||
    QR_DOWNLOAD_SIZES[0]
  );
}

/**
 * Gera PNG do QR e dispara download no navegador.
 * @returns {Promise<string>} data URL gerada
 */
export async function downloadQrPng({
  value,
  fileName,
  width,
  level = 'M',
}) {
  if (!value) {
    throw new Error('Conteúdo do QR Code ausente.');
  }
  const mod = await import('qrcode');
  const toDataURL = mod.toDataURL || mod.default?.toDataURL;
  if (typeof toDataURL !== 'function') {
    throw new Error('Gerador de QR Code indisponível.');
  }
  const dataUrl = await toDataURL(value, {
    width,
    margin: 2,
    errorCorrectionLevel: level,
    color: { dark: '#000000', light: '#ffffff' },
  });
  const safeName = String(fileName || 'qrcode').replace(/\.png$/i, '');
  const link = document.createElement('a');
  link.download = `${safeName}.png`;
  link.href = dataUrl;
  link.click();
  return dataUrl;
}
