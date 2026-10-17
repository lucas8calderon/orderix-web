import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeliveryPixCheckout, { mergePixCharge } from './DeliveryPixCheckout';

jest.mock('../../../services/deliveryPaymentService', () => ({
  PIX_POLL_INTERVAL_MS: 60_000,
  getDeliveryPixPaymentByToken: jest.fn(),
  isPixPaid: (status) => status === 'APPROVED' || status === 'PAID',
  isPixTerminal: (status) => ['APPROVED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'].includes(status),
}));

const basePayment = {
  id: 9,
  orderId: 42,
  amount: 25.5,
  status: 'PENDING',
  publicToken: 'tok-public-token-xyz',
  qrCode: '000201pix',
  qrCodeBase64: 'abc',
};

describe('DeliveryPixCheckout', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('permite gerar novo Pix quando a cobrança falhou e só há orderId', async () => {
    const onRetry = jest.fn();
    render(
      <DeliveryPixCheckout
        open
        payment={{ orderId: 42, publicToken: 'tok-public-token-xyz' }}
        error="Não foi possível gerar o Pix."
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Não foi possível gerar o Pix.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Gerar novo Pix/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('mostra QR e aguardando quando a cobrança existe', () => {
    render(
      <DeliveryPixCheckout
        open
        payment={basePayment}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText('000201pix')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'QR Code do Pix' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando pagamento');
    expect(screen.queryByRole('button', { name: /Já paguei/i })).not.toBeInTheDocument();
  });

  it('explica quando a cobrança chega sem código', () => {
    render(
      <DeliveryPixCheckout
        open
        payment={{ ...basePayment, qrCode: '', qrCodeBase64: '', ticketUrl: '' }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/não devolveu o código/i)).toBeInTheDocument();
  });

  it('mantém o código quando a consulta seguinte volta vazia', () => {
    const merged = mergePixCharge(
      { qrCode: '000201pix', qrCodeBase64: 'abc', ticketUrl: 'https://mp.test/ticket' },
      { status: 'PENDING', qrCode: null, qrCodeBase64: '', ticketUrl: null },
      basePayment,
    );

    expect(merged.qrCode).toBe('000201pix');
    expect(merged.qrCodeBase64).toBe('abc');
    expect(merged.ticketUrl).toBe('https://mp.test/ticket');
    expect(merged.status).toBe('PENDING');
  });

  it('mostra tempo restante quando expiresAt está no futuro', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-22T12:00:00'));

    render(
      <DeliveryPixCheckout
        open
        payment={{
          ...basePayment,
          expiresAt: '2026-09-22T12:29:42',
          createdAt: '2026-09-22T12:00:00',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/Tempo restante:\s*29:42/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow');
    const value = Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'));
    expect(value).toBeGreaterThan(90);
  });

  it('mostra código expirado quando expiresAt já passou', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-22T12:30:00'));

    render(
      <DeliveryPixCheckout
        open
        payment={{
          ...basePayment,
          expiresAt: '2026-09-22T12:00:00',
          createdAt: '2026-09-22T11:30:00',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/Código expirado/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Pix expirado/i);
    expect(screen.getByRole('button', { name: /Gerar novo Pix/i })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('mostra código expirado quando status é EXPIRED', () => {
    render(
      <DeliveryPixCheckout
        open
        payment={{
          ...basePayment,
          status: 'EXPIRED',
          expiresAt: '2026-09-22T12:00:00',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/Código expirado/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Pix expirado/i);
    expect(screen.getByRole('button', { name: /Gerar novo Pix/i })).toBeInTheDocument();
  });

  it('atualiza o tempo restante a cada segundo', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-22T12:00:00'));

    render(
      <DeliveryPixCheckout
        open
        payment={{
          ...basePayment,
          expiresAt: '2026-09-22T12:01:00',
          createdAt: '2026-09-22T12:00:00',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/Tempo restante:\s*01:00/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Tempo restante:\s*00:59/i)).toBeInTheDocument();
  });

  it('não volta o prazo para 30 minutos quando a consulta traz um expiresAt mais tarde', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-22T12:00:00'));

    const view = render(
      <DeliveryPixCheckout
        open
        payment={{
          ...basePayment,
          expiresAt: '2026-09-22T12:30:00',
          createdAt: '2026-09-22T12:00:00',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/Tempo restante:\s*30:00/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/Tempo restante:\s*29:55/i)).toBeInTheDocument();

    view.rerender(
      <DeliveryPixCheckout
        open
        payment={{
          ...basePayment,
          expiresAt: '2026-09-22T12:35:00',
          createdAt: '2026-09-22T12:05:00',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/Tempo restante:\s*29:55/i)).toBeInTheDocument();
  });

  it('no PagBank mostra o código legível e o PNG do QR, sem link do Mercado Pago', () => {
    render(
      <DeliveryPixCheckout
        open
        provider="PAGBANK"
        payment={{
          ...basePayment,
          qrCode: '000201pix',
          qrCodeBase64: 'https://api.pagseguro.com/qr/charge.b64',
          ticketUrl: 'https://api.pagseguro.com/qr/charge.png',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText('000201pix')).toHaveClass('delivery-pix-code');
    expect(screen.getByRole('img', { name: 'QR Code do Pix' })).toHaveAttribute(
      'src',
      'https://api.pagseguro.com/qr/charge.png',
    );
    expect(screen.queryByRole('link', { name: /Mercado Pago/i })).not.toBeInTheDocument();
  });

  it('sem imagem de QR desenha o código a partir do copia-e-cola', () => {
    render(
      <DeliveryPixCheckout
        open
        provider="PAGBANK"
        payment={{
          ...basePayment,
          qrCode: '000201pix',
          qrCodeBase64: '',
          ticketUrl: 'https://api.pagseguro.com/charges/1',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    const qr = screen.getByRole('img', { name: 'QR Code do Pix' });
    expect(qr.tagName).toBe('svg');
    expect(qr.closest('.delivery-pix-qr-frame')).not.toBeNull();
    expect(qr.querySelector('path[fill="#000000"]')?.getAttribute('d')).toBeTruthy();
    expect(screen.getByText('000201pix')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar código/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando pagamento');
    expect(screen.queryByRole('link', { name: /Mercado Pago/i })).not.toBeInTheDocument();
  });

  it('usa a imagem PNG do PagBank mesmo quando a URL termina em /png', () => {
    render(
      <DeliveryPixCheckout
        open
        provider="PAGBANK"
        payment={{
          ...basePayment,
          qrCode: '000201pix',
          qrCodeBase64: 'https://api.pagseguro.com/qrcode/charge/base64',
          ticketUrl: 'https://api.pagseguro.com/qrcode/charge/png',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByRole('img', { name: 'QR Code do Pix' })).toHaveAttribute(
      'src',
      'https://api.pagseguro.com/qrcode/charge/png',
    );
  });

  it('se a imagem do QR falha, desenha o código a partir do copia-e-cola', () => {
    render(
      <DeliveryPixCheckout
        open
        provider="PAGBANK"
        payment={{
          ...basePayment,
          qrCode: '000201pix',
          qrCodeBase64: '',
          ticketUrl: 'https://api.pagseguro.com/qrcode/charge/png',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    fireEvent.error(screen.getByRole('img', { name: 'QR Code do Pix' }));

    const qr = screen.getByRole('img', { name: 'QR Code do Pix' });
    expect(qr.tagName).toBe('svg');
    expect(screen.getByRole('button', { name: /Copiar código/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando pagamento');
  });

  it('no Mercado Pago mantém o link da cobrança', () => {
    render(
      <DeliveryPixCheckout
        open
        provider="MERCADOPAGO"
        payment={{
          ...basePayment,
          ticketUrl: 'https://www.mercadopago.com.br/payments/1/ticket',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByRole('link', { name: /Abrir cobrança no Mercado Pago/i })).toHaveAttribute(
      'href',
      'https://www.mercadopago.com.br/payments/1/ticket',
    );
    expect(screen.getByRole('img', { name: 'QR Code do Pix' })).toHaveAttribute(
      'src',
      'data:image/png;base64,abc',
    );
  });

  it('não marca expirado quando a data vem ausente, inválida ou em segundos', () => {
    const view = render(
      <DeliveryPixCheckout
        open
        payment={basePayment}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.queryByText(/Código expirado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Calculando prazo/i)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando pagamento');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    view.rerender(
      <DeliveryPixCheckout
        open
        payment={{ ...basePayment, expiresAt: 'nao-e-data' }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );
    expect(screen.queryByText(/Código expirado/i)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando pagamento');

    view.rerender(
      <DeliveryPixCheckout
        open
        payment={{ ...basePayment, expiresAt: 1800 }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );
    expect(screen.queryByText(/Código expirado/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gerar novo Pix/i })).not.toBeInTheDocument();
  });

  it('lê expiração ISO com fuso sem marcar o código novo como expirado', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-22T15:00:00Z'));

    render(
      <DeliveryPixCheckout
        open
        payment={{
          ...basePayment,
          expiresAt: '2026-09-22T15:29:42Z',
          createdAt: '2026-09-22T15:00:00Z',
        }}
        error=""
        creating={false}
        onClose={jest.fn()}
        onPaid={jest.fn()}
        onRetry={jest.fn()}
      />
    );

    expect(screen.getByText(/Tempo restante:\s*29:42/i)).toBeInTheDocument();
    expect(screen.queryByText(/Código expirado/i)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando pagamento');
  });
});
