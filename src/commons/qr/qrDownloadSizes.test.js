import * as QRCodeModule from 'qrcode';
import {
  A4_HEIGHT_PT,
  A4_WIDTH_PT,
  DEFAULT_QR_DOWNLOAD_SIZE_ID,
  QR_DOWNLOAD_SIZES,
  buildA4CenteredJpegPdf,
  buildQrPrintDocumentHtml,
  cmToPdfPoints,
  downloadQrPng,
  embedPngPhys,
  getQrDownloadSize,
  pixelsPerMeterForSize,
  printQrOnA4,
} from './qrDownloadSizes';

/** PNG 1×1 mínimo válido (para testes de pHYs / download). */
const MINI_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

jest.mock('qrcode', () => {
  const toDataURL = jest.fn();
  return {
    __esModule: true,
    default: { toDataURL },
    toDataURL,
  };
});

describe('qrDownloadSizes', () => {
  beforeEach(() => {
    QRCodeModule.toDataURL.mockClear();
    QRCodeModule.toDataURL.mockResolvedValue(MINI_PNG_DATA_URL);
  });

  it('expõe presets com larguras crescentes e sizeCm para impressão', () => {
    expect(QR_DOWNLOAD_SIZES.length).toBeGreaterThanOrEqual(3);
    const widths = QR_DOWNLOAD_SIZES.map((size) => size.width);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
    expect(getQrDownloadSize(DEFAULT_QR_DOWNLOAD_SIZE_ID).id).toBe('medium');
    expect(getQrDownloadSize('xlarge')).toEqual(
      expect.objectContaining({ sizeCm: 10, width: 1181 })
    );
  });

  it('faz fallback para o médio quando o id é inválido', () => {
    expect(getQrDownloadSize('inexistente').id).toBe(DEFAULT_QR_DOWNLOAD_SIZE_ID);
  });

  it('calcula pixels/metro a partir do tamanho físico em cm', () => {
    expect(pixelsPerMeterForSize(1181, 10)).toBe(11810);
    expect(pixelsPerMeterForSize(591, 5)).toBe(11820);
  });

  it('embute chunk pHYs no PNG', () => {
    const withPhys = embedPngPhys(MINI_PNG_DATA_URL, 11811);
    expect(withPhys.startsWith('data:image/png;base64,')).toBe(true);
    expect(withPhys).not.toBe(MINI_PNG_DATA_URL);
    const binary = atob(withPhys.split(',')[1]);
    expect(binary.includes('pHYs')).toBe(true);
  });

  it('gera HTML A4 com width/height em cm (sem stretch)', () => {
    const html = buildQrPrintDocumentHtml({
      dataUrl: MINI_PNG_DATA_URL,
      sizeCm: 8,
      title: 'cardapio-minions',
    });
    expect(html).toContain('@page { size: A4');
    expect(html).toContain('width: 8cm');
    expect(html).toContain('height: 8cm');
    expect(html).toContain(MINI_PNG_DATA_URL);
  });

  it('monta PDF A4 com MediaBox e transformação no tamanho cm', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const pdf = buildA4CenteredJpegPdf({
      jpegBytes: jpeg,
      sizeCm: 5,
      pixelWidth: 591,
      pixelHeight: 591,
    });
    const text = new TextDecoder().decode(pdf);
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain(`/MediaBox [0 0 ${A4_WIDTH_PT} ${A4_HEIGHT_PT}]`);
    expect(text).toContain('/Width 591');
    expect(text).toContain('/Height 591');
    const imgPt = cmToPdfPoints(5).toFixed(2);
    expect(text).toContain(`${imgPt} 0 0 ${imgPt}`);
    expect(text).toContain('%%EOF');
  });

  it('gera PNG e dispara download com a largura pedida', async () => {
    const click = jest.fn();
    const anchor = { click, download: '', href: '' };
    const originalCreate = Document.prototype.createElement;
    const createSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation(function createElement(tag, options) {
        if (tag === 'a') return anchor;
        return originalCreate.call(this, tag, options);
      });

    await downloadQrPng({
      value: 'https://example.com/m',
      fileName: 'cardapio-loja.png',
      width: 591,
      sizeCm: 5,
    });

    expect(QRCodeModule.toDataURL).toHaveBeenCalledWith(
      'https://example.com/m',
      expect.objectContaining({ width: 591, margin: 2 })
    );
    expect(anchor.download).toBe('cardapio-loja.png');
    expect(anchor.href.startsWith('data:image/png;base64,')).toBe(true);
    expect(atob(anchor.href.split(',')[1]).includes('pHYs')).toBe(true);
    expect(click).toHaveBeenCalled();

    createSpy.mockRestore();
  });

  it('abre janela de impressão A4 com o tamanho selecionado', async () => {
    const print = jest.fn();
    const focus = jest.fn();
    const close = jest.fn();
    const open = jest.fn();
    const write = jest.fn();
    const fakeDoc = {
      open,
      write,
      close,
      readyState: 'complete',
    };
    const fakeWin = {
      document: fakeDoc,
      print,
      focus,
      onload: null,
    };
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(fakeWin);
    jest.useFakeTimers();

    await printQrOnA4({
      value: 'https://example.com/m',
      width: 945,
      sizeCm: 8,
      title: 'cardapio-minions',
    });

    expect(openSpy).toHaveBeenCalled();
    expect(write).toHaveBeenCalled();
    const html = write.mock.calls[0][0];
    expect(html).toContain('width: 8cm');
    expect(html).toContain('@page { size: A4');

    jest.runAllTimers();
    expect(print).toHaveBeenCalled();

    jest.useRealTimers();
    openSpy.mockRestore();
  });
});
