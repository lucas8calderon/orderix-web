import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SignupPage from './SignupPage';

jest.mock('axios', () => ({ post: jest.fn() }));

function setup(path = '/contratar?plan=PLAN_02') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SignupPage />
    </MemoryRouter>,
  );
}

test('pix signup does not ask for address or send a price', async () => {
  axios.post.mockResolvedValue({ data: { pixPayload: '000201', invoiceUrl: 'https://sandbox.asaas.com/i/1', storeActive: false } });
  setup();
  expect(screen.queryByLabelText('CEP')).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/CNPJ do estabelecimento/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/boleto/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/7 dias grátis|teste gratuito|trial/i)).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria' } });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar para o pagamento/i }));
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  const payload = axios.post.mock.calls[0][1];
  expect(axios.post.mock.calls[0][0]).toBe('/api/public/billing/signup');
  expect(payload.planCode).toBe('PLAN_02');
  expect(payload.billingType).toBe('PIX');
  expect(payload.price).toBeUndefined();
  expect(payload.postalCode).toBeUndefined();
  expect(await screen.findByText('Pagamento em confirmação')).toBeInTheDocument();
  expect(screen.getByTestId('pix-payload')).toHaveTextContent('000201');
  expect(screen.getByText('A loja ainda não está ativa.')).toBeInTheDocument();
});

test('card without postal code stays on the form', () => {
  setup('/contratar');
  fireEvent.click(screen.getByLabelText('Cartão'));
  expect(screen.getByLabelText('CEP')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria' } });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar para o pagamento/i }));
  expect(screen.getByRole('alert')).toHaveTextContent('telefone, CEP e número');
  expect(axios.post).not.toHaveBeenCalled();
});

test('api error stays visible and does not claim the store is active', async () => {
  axios.post.mockRejectedValue({ response: { data: { message: 'Plano inexistente.' } } });
  setup();
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria' } });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar para o pagamento/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Plano inexistente.');
  expect(screen.queryByText('Pagamento em confirmação')).not.toBeInTheDocument();
});

test('shows commercial comparison outside the checkout form', () => {
  setup('/contratar');
  expect(screen.getByText((_, node) => (
    node?.tagName === 'EM' && /SEM COMISSÕES POR VENDA/i.test(node.textContent || '')
  ))).toBeInTheDocument();
  expect(screen.getByText(/Marketplaces de delivery/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Contratar a Weper' })).toBeInTheDocument();
  const form = screen.getByRole('button', { name: /Continuar para o pagamento/i }).closest('form');
  expect(form).not.toHaveTextContent('iFood');
});
