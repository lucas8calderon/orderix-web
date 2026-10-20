import * as QRCodeModule from 'qrcode';
import {
  DEFAULT_QR_DOWNLOAD_SIZE_ID,
  QR_DOWNLOAD_SIZES,
  downloadQrPng,
  getQrDownloadSize,
} from './qrDownloadSizes';

jest.mock('qrcode', () => {
  const toDataURL = jest.fn().mockResolvedValue('data:image/png;base64,abc');
  return {
    __esModule: true,
    default: { toDataURL },
    toDataURL,
  };
});

describe('qrDownloadSizes', () => {
  beforeEach(() => {
    QRCodeModule.toDataURL.mockClear();
    QRCodeModule.toDataURL.mockResolvedValue('data:image/png;base64,abc');
  });

  it('expõe presets com larguras crescentes para impressão', () => {
    expect(QR_DOWNLOAD_SIZES.length).toBeGreaterThanOrEqual(3);
    const widths = QR_DOWNLOAD_SIZES.map((size) => size.width);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
    expect(getQrDownloadSize(DEFAULT_QR_DOWNLOAD_SIZE_ID).id).toBe('medium');
  });

  it('faz fallback para o médio quando o id é inválido', () => {
    expect(getQrDownloadSize('inexistente').id).toBe(DEFAULT_QR_DOWNLOAD_SIZE_ID);
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
    });

    expect(QRCodeModule.toDataURL).toHaveBeenCalledWith(
      'https://example.com/m',
      expect.objectContaining({ width: 591, margin: 2 })
    );
    expect(anchor.download).toBe('cardapio-loja.png');
    expect(anchor.href).toBe('data:image/png;base64,abc');
    expect(click).toHaveBeenCalled();

    createSpy.mockRestore();
  });
});
