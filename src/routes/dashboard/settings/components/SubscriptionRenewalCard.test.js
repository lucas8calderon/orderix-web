import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { SubscriptionRenewalCard } from './SubscriptionRenewalCard';
import { getCurrentUser } from '../../../../services/authService';

jest.mock('axios', () => ({ post: jest.fn(), get: jest.fn() }));
jest.mock('../../../../services/apiConfig', () => ({}));
jest.mock('../../../../services/authService', () => ({ getCurrentUser: jest.fn() }));

const ACTIVE = {
  plan: 'PLAN_01',
  price: 39.9,
  status: 'ACTIVE',
  access: 'FULL',
  billingType: 'PIX',
  expiresAt: '2026-11-18',
  renewalCanceled: false,
};

beforeEach(() => {
  axios.post.mockReset();
  axios.get.mockResolvedValue({ data: ACTIVE });
});

test('store admin cancels renewal and keeps access through the paid cycle', async () => {
  getCurrentUser.mockReturnValue({ role: 'STORE_ADMIN' });
  axios.post.mockResolvedValue({ status: 202 });
  render(<SubscriptionRenewalCard />);

  expect(screen.getByText(/acesso desta loja segue até o fim do ciclo já pago/i)).toBeInTheDocument();
  expect(await screen.findByText(/Mensalidade: R\$ 39,90/)).toBeInTheDocument();
  expect(screen.getByText(/Meio: Pix/)).toBeInTheDocument();
  expect(screen.getByText(/Próxima cobrança: 18\/11\/2026/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cancelar renovação' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar renovação' }));
  fireEvent.click(screen.getByRole('button', { name: 'Encerrar renovação' }));

  await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/billing/subscription/cancel'));
  expect(await screen.findByText(/renovação já foi encerrada/i)).toBeInTheDocument();
  expect(screen.getByText(/Acesso até: 18\/11\/2026/)).toBeInTheDocument();
});

test('waiter kitchen and cashier do not see the cancellation', () => {
  for (const role of ['WAITER', 'KITCHEN', 'CASHIER']) {
    getCurrentUser.mockReturnValue({ role });
    const view = render(<SubscriptionRenewalCard />);
    expect(screen.queryByRole('button', { name: 'Cancelar renovação' })).not.toBeInTheDocument();
    view.unmount();
  }
});

test('returning to the page keeps the canceled state', async () => {
  getCurrentUser.mockReturnValue({ role: 'STORE_ADMIN' });
  axios.get.mockResolvedValue({ data: { ...ACTIVE, status: 'CANCELED', renewalCanceled: true } });
  render(<SubscriptionRenewalCard />);
  expect(await screen.findByText(/renovação já foi encerrada/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cancelar renovação' })).not.toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

test('date sent as a list is shown as a day', async () => {
  getCurrentUser.mockReturnValue({ role: 'STORE_ADMIN' });
  axios.get.mockResolvedValue({ data: { ...ACTIVE, expiresAt: [2026, 11, 18] } });
  render(<SubscriptionRenewalCard />);
  expect(await screen.findByText(/Próxima cobrança: 18\/11\/2026/)).toBeInTheDocument();
});

test('grace and the eighth day explain the access without offering boleto', async () => {
  getCurrentUser.mockReturnValue({ role: 'STORE_ADMIN' });
  axios.get.mockResolvedValue({
    data: { ...ACTIVE, access: 'GRACE', billingType: null, status: 'OVERDUE' },
  });
  render(<SubscriptionRenewalCard />);
  expect(await screen.findByText(/até 7 dias/i)).toBeInTheDocument();
  expect(screen.queryByText(/Boleto/)).not.toBeInTheDocument();
});

test('api error stays on the card', async () => {
  getCurrentUser.mockReturnValue({ role: 'ADMIN' });
  axios.post.mockRejectedValue({ response: { data: { message: 'Assinatura não encontrada para esta loja.' } } });
  render(<SubscriptionRenewalCard />);
  fireEvent.click(await screen.findByRole('button', { name: 'Cancelar renovação' }));
  fireEvent.click(screen.getByRole('button', { name: 'Encerrar renovação' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Assinatura não encontrada para esta loja.');
});
