import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeliveryPixCheckout from './DeliveryPixCheckout';

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

    expect(screen.getByText(/Total/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Aguardando pagamento');
    expect(screen.queryByRole('button', { name: /Já paguei/i })).not.toBeInTheDocument();
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
});
