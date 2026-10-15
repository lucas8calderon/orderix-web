import { render, screen } from '@testing-library/react';
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
