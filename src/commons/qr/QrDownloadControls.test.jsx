import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QrDownloadControls } from './QrDownloadControls';
import * as qrDownloadSizes from './qrDownloadSizes';

jest.mock('./qrDownloadSizes', () => {
  const actual = jest.requireActual('./qrDownloadSizes');
  return {
    ...actual,
    downloadQrPng: jest.fn().mockResolvedValue('data:image/png;base64,abc'),
    downloadQrPrintPdf: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    printQrOnA4: jest.fn().mockResolvedValue('data:image/png;base64,abc'),
  };
});

describe('QrDownloadControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permite escolher tamanho e baixa PNG com a largura correspondente', async () => {
    const onSuccess = jest.fn();
    render(
      <QrDownloadControls
        value="https://weper.test/m/loja"
        fileName="cardapio-loja"
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByLabelText(/tamanho para imprimir/i)).toBeInTheDocument();
    expect(screen.getByText(/591×591 px/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('combobox', { name: /tamanho para imprimir/i }));
    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: /Grande \(≈ 8 cm\)/i }));

    expect(screen.getByText(/945×945 px/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /baixar png/i }));

    expect(qrDownloadSizes.downloadQrPng).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'https://weper.test/m/loja',
        fileName: 'cardapio-loja',
        width: 945,
        sizeCm: 8,
      })
    );
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'large', width: 945, sizeCm: 8 })
    );
  });

  it('oferece PDF para impressão A4 no tamanho cm selecionado', async () => {
    const onSuccess = jest.fn();
    render(
      <QrDownloadControls
        value="https://weper.test/m/loja"
        fileName="cardapio-minions"
        onSuccess={onSuccess}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /baixar pdf para impressão/i }));

    expect(qrDownloadSizes.downloadQrPrintPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'https://weper.test/m/loja',
        fileName: 'cardapio-minions',
        width: 591,
        sizeCm: 5,
      })
    );
    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ format: 'pdf' }));
  });

  it('abre impressão A4 com o tamanho selecionado', async () => {
    render(
      <QrDownloadControls value="https://weper.test/m/loja" fileName="cardapio-minions" />
    );

    await userEvent.click(screen.getByRole('combobox', { name: /tamanho para imprimir/i }));
    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: /Extra grande/i }));

    await userEvent.click(screen.getByRole('button', { name: /imprimir em a4/i }));

    expect(qrDownloadSizes.printQrOnA4).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'https://weper.test/m/loja',
        width: 1181,
        sizeCm: 10,
        title: 'cardapio-minions',
      })
    );
  });
});
