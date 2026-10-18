import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { SubscriptionRenewalCard } from './SubscriptionRenewalCard';
import { getCurrentUser } from '../../../../services/authService';

jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('../../../../services/apiConfig', () => ({}));
jest.mock('../../../../services/authService', () => ({ getCurrentUser: jest.fn() }));

test('store admin cancels renewal and keeps access through the paid cycle', async () => {
  getCurrentUser.mockReturnValue({ role: 'STORE_ADMIN' });
  axios.post.mockResolvedValue({ status: 202 });
  render(<SubscriptionRenewalCard />);

  expect(screen.getByText(/acesso desta loja segue até o fim do ciclo já pago/i)).toBeInTheDocument();
  expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar renovação' }));
  fireEvent.click(screen.getByRole('button', { name: 'Encerrar renovação' }));

  await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/billing/subscription/cancel'));
  expect(await screen.findByText(/acesso segue até o fim do ciclo pago/i)).toBeInTheDocument();
  expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
});

test('waiter kitchen and cashier do not see the cancellation', () => {
  for (const role of ['WAITER', 'KITCHEN', 'CASHIER']) {
    getCurrentUser.mockReturnValue({ role });
    const view = render(<SubscriptionRenewalCard />);
    expect(screen.queryByRole('button', { name: 'Cancelar renovação' })).not.toBeInTheDocument();
    view.unmount();
  }
});

test('api error stays on the card', async () => {
  getCurrentUser.mockReturnValue({ role: 'ADMIN' });
  axios.post.mockRejectedValue({ response: { data: { message: 'Assinatura não encontrada para esta loja.' } } });
  render(<SubscriptionRenewalCard />);
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar renovação' }));
  fireEvent.click(screen.getByRole('button', { name: 'Encerrar renovação' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Assinatura não encontrada para esta loja.');
});
