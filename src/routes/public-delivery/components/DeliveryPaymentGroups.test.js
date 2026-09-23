import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeliveryPaymentGroups from './DeliveryPaymentGroups';

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
});
