import { fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import DeliveryCardCheckout from './DeliveryCardCheckout';

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
      return { encryptedCard: 'tok-teste', hasErrors: false };
    },
  };
  axios.post.mockResolvedValue({ data: { status: 'APPROVED', id: 1 } });

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
    fireEvent.change(screen.getByLabelText(/Número do cartão/i), { target: { value: '0000' } });
    fireEvent.change(screen.getByLabelText(/Mês/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/Ano/i), { target: { value: '2030' } });
    fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '000' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Pagar à vista' }).closest('form'));

    expect(await screen.findByRole('heading', { name: 'Pagamento aprovado' })).toBeInTheDocument();
    expect(sawProcessing).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/payments/card'),
      expect.objectContaining({ cardToken: 'tok-teste', installments: 1 }),
      expect.any(Object),
    );
  } finally {
    window.requestAnimationFrame = previousRaf;
    axios.post.mockReset();
    if (previous) {
      window.PagSeguro = previous;
    } else {
      delete window.PagSeguro;
    }
  }
});
