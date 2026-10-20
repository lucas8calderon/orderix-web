import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QrDownloadControls } from './QrDownloadControls';
import * as qrDownloadSizes from './qrDownloadSizes';

jest.mock('./qrDownloadSizes', () => {
  const actual = jest.requireActual('./qrDownloadSizes');
  return {
    ...actual,
    downloadQrPng: jest.fn().mockResolvedValue('data:image/png;base64,abc'),
  };
});

describe('QrDownloadControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permite escolher tamanho e baixa com a largura correspondente', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: /baixar qr code/i }));

    expect(qrDownloadSizes.downloadQrPng).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'https://weper.test/m/loja',
        fileName: 'cardapio-loja',
        width: 945,
      })
    );
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'large', width: 945 })
    );
  });
});
