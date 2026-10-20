import { fireEvent, render, screen } from '@testing-library/react';
import DeliveryCardCheckout from './DeliveryCardCheckout';

jest.mock('../../../services/deliveryPaymentService', () => {
  const actual = jest.requireActual('../../../services/deliveryPaymentService');
  return {
    ...actual,
    tokenizeDeliveryAsaasCard: jest.fn(),
    createDeliveryCardPayment: jest.fn(),
    getDeliveryPixPayment: jest.fn(),
  };
});

const {
  tokenizeDeliveryAsaasCard,
  createDeliveryCardPayment,
} = require('../../../services/deliveryPaymentService');

test('PagBank mostra o formulário à vista e não carrega o Mercado Pago', () => {
  render(
    <DeliveryCardCheckout
      open
      slug="loja"
      orderId={10}
      amount={20}
      publicKey="chave-publica"
      provider="PAGBANK"
      onClose={() => {}}
      onApproved={() => {}}
      onChooseOther={() => {}}
    />,
  );

  expect(screen.getByRole('textbox', { name: /Nome impresso no cartão/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Pagar à vista' })).toBeInTheDocument();
  expect(document.querySelector('script[data-mp-sdk="1"]')).toBeNull();
});

test('Asaas tokeniza pelo backend Weper sem chamar a API Asaas no navegador', async () => {
  tokenizeDeliveryAsaasCard.mockResolvedValue({
    data: {
      creditCardToken: 'tok_asaas_abc123xyz890',
      providerCustomerId: 'cus_asaas_1',
    },
  });
  createDeliveryCardPayment.mockResolvedValue({ data: { status: 'APPROVED', id: 2 } });
  const previousFetch = global.fetch;
  global.fetch = jest.fn();
  const previousRaf = window.requestAnimationFrame;
  window.requestAnimationFrame = (callback) => {
    callback();
    return 0;
  };

  try {
    render(
      <DeliveryCardCheckout
        open
        slug="loja"
        orderId={11}
        amount={30}
        provider="ASAAS"
        asaasEnvironment="sandbox"
        onClose={() => {}}
        onApproved={() => {}}
        onChooseOther={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: 'Pagar à vista' })).toBeInTheDocument();
    expect(document.querySelector('script[data-mp-sdk="1"]')).toBeNull();

    fireEvent.change(screen.getByLabelText(/Nome impresso no cartão/i), { target: { value: 'Cliente' } });
    fireEvent.change(screen.getByLabelText(/Número do cartão/i), { target: { value: '4111111111111111' } });
    fireEvent.change(screen.getByLabelText(/Mês/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/Ano/i), { target: { value: '2030' } });
    fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '123' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Pagar à vista' }).closest('form'));

    expect(await screen.findByRole('heading', { name: 'Pagamento aprovado' })).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(tokenizeDeliveryAsaasCard).toHaveBeenCalledWith(
      'loja',
      11,
      expect.objectContaining({
        holderName: 'Cliente',
        number: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2030',
        ccv: '123',
      }),
    );
    expect(createDeliveryCardPayment).toHaveBeenCalledWith(
      'loja',
      11,
      expect.any(String),
      expect.objectContaining({
        cardToken: 'tok_asaas_abc123xyz890',
        providerCustomerId: 'cus_asaas_1',
      }),
    );
    expect(createDeliveryCardPayment.mock.calls[0][3].cardToken).not.toContain('411111');
  } finally {
    global.fetch = previousFetch;
    window.requestAnimationFrame = previousRaf;
    tokenizeDeliveryAsaasCard.mockReset();
    createDeliveryCardPayment.mockReset();
  }
});

test('PagBank mostra Processando e desabilita o pagamento antes de criptografar', async () => {
  const previous = window.PagSeguro;
  const previousRaf = window.requestAnimationFrame;
  let sawProcessing = false;
  window.requestAnimationFrame = (callback) => {
    callback();
    return 0;
  };
  window.PagSeguro = {
    encryptCard: () => {
      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('Processando...');
      expect(status).toHaveClass('delivery-card-processing');
      expect(screen.getByLabelText(/Nome impresso no cartão/i, { hidden: true })).toBeDisabled();
      expect(screen.getByLabelText(/Número do cartão/i, { hidden: true })).toBeDisabled();
      sawProcessing = true;
      return { encryptedCard: 'tok-teste-pagbank-encrypted-xx', hasErrors: false };
    },
  };
  createDeliveryCardPayment.mockResolvedValue({ data: { status: 'APPROVED', id: 1 } });

  try {
    render(
      <DeliveryCardCheckout
        open
        slug="loja"
        orderId={10}
        amount={20}
        publicKey="chave-publica"
        provider="PAGBANK"
        onClose={() => {}}
        onApproved={() => {}}
        onChooseOther={() => {}}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Nome impresso no cartão/i), { target: { value: 'Cliente' } });
    fireEvent.change(screen.getByLabelText(/Número do cartão/i), { target: { value: '4111111111111111' } });
    fireEvent.change(screen.getByLabelText(/Mês/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/Ano/i), { target: { value: '2030' } });
    fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '123' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Pagar à vista' }).closest('form'));

    expect(await screen.findByRole('heading', { name: 'Pagamento aprovado' })).toBeInTheDocument();
    expect(sawProcessing).toBe(true);
  } finally {
    window.PagSeguro = previous;
    window.requestAnimationFrame = previousRaf;
    createDeliveryCardPayment.mockReset();
  }
});
