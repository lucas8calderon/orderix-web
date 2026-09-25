import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeliveryPaymentGroups, { PREPAY_NO_ONLINE_MSG } from './DeliveryPaymentGroups';

const baseCheckout = {
  paymentMethod: 'PIX',
  onlinePayment: false,
  needsChange: false,
  changeFor: '',
};

describe('DeliveryPaymentGroups', () => {
  it('esconde Pix online quando a loja não habilitou', () => {
    render(
      <DeliveryPaymentGroups
        checkout={baseCheckout}
        onChange={jest.fn()}
        onlinePixEnabled={false}
        total={20}
      />
    );
    expect(screen.queryByText('Pague online')).not.toBeInTheDocument();
    expect(screen.getByText('Pague na entrega')).toBeInTheDocument();
  });

  it('mostra Pix online e na entrega quando habilitado', async () => {
    const onChange = jest.fn();
    render(
      <DeliveryPaymentGroups
        checkout={baseCheckout}
        onChange={onChange}
        onlinePixEnabled
        total={20}
      />
    );
    expect(screen.getByText('Pague online')).toBeInTheDocument();
    expect(screen.getByText('Pague na entrega')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Pix — aprovação rápida'));
    expect(onChange).toHaveBeenCalled();
  });

  it('esconde pagamento na entrega quando a loja exige antecipado', () => {
    render(
      <DeliveryPaymentGroups
        checkout={{ ...baseCheckout, onlinePayment: true, paymentMethod: 'PIX' }}
        onChange={jest.fn()}
        onlinePixEnabled
        acceptPayOnFulfillment={false}
        acceptPrepaid
        total={20}
      />
    );
    expect(screen.getByText('Pague online')).toBeInTheDocument();
    expect(screen.queryByText('Pague na entrega')).not.toBeInTheDocument();
  });

  it('explica quando exige antecipado e não há meio online', () => {
    render(
      <DeliveryPaymentGroups
        checkout={baseCheckout}
        onChange={jest.fn()}
        onlinePixEnabled={false}
        onlineCardEnabled={false}
        acceptPayOnFulfillment={false}
        acceptPrepaid
        total={20}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(PREPAY_NO_ONLINE_MSG);
    expect(screen.queryByText('Pague na entrega')).not.toBeInTheDocument();
    expect(screen.queryByText('Pague online')).not.toBeInTheDocument();
  });

  it('mostra pagar na retirada e esconde o online quando a loja não aceita antecipado', () => {
    render(
      <DeliveryPaymentGroups
        checkout={baseCheckout}
        onChange={jest.fn()}
        onlinePixEnabled
        acceptPayOnFulfillment
        acceptPrepaid={false}
        fulfillment="PICKUP"
        total={20}
      />
    );
    expect(screen.getByText('Pague na retirada')).toBeInTheDocument();
    expect(screen.queryByText('Pague online')).not.toBeInTheDocument();
    expect(screen.queryByText('Pague na entrega')).not.toBeInTheDocument();
  });
});
