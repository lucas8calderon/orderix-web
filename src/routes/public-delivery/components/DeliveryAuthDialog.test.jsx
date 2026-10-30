import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeliveryAuthDialog from './DeliveryAuthDialog';
import { registerDeliveryCustomer } from '../../../services/deliveryCustomerService';

jest.mock('../../../services/deliveryCustomerService', () => ({
  loginDeliveryCustomer: jest.fn(),
  registerDeliveryCustomer: jest.fn(),
}));

jest.mock('../../../services/deliveryCustomerSession', () => ({
  saveDeliveryCustomerSession: jest.fn(),
}));

describe('criação de conta do delivery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exige senhas iguais e não pede e-mail', async () => {
    render(<DeliveryAuthDialog open onClose={jest.fn()} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }));

    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana');
    await userEvent.type(screen.getByLabelText('Telefone'), '11988887777');
    await userEvent.type(screen.getByLabelText('Senha'), 'secret1');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'secret2');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByText('As senhas não conferem.')).toBeInTheDocument();
    expect(registerDeliveryCustomer).not.toHaveBeenCalled();
  });

  it('cria a conta quando a senha confirmada é igual', async () => {
    registerDeliveryCustomer.mockResolvedValue({ data: { token: 't', name: 'Ana', phone: '11988887777' } });
    const onClose = jest.fn();
    render(<DeliveryAuthDialog open onClose={onClose} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }));

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana');
    await userEvent.type(screen.getByLabelText('Telefone'), '11988887777');
    await userEvent.type(screen.getByLabelText('Senha'), 'secret1');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'secret1');
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(registerDeliveryCustomer).toHaveBeenCalledWith({
      name: 'Ana',
      phone: '11988887777',
      password: 'secret1',
    });
  });
});
