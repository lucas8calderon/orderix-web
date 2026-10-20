import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SignupPage, {
  isPublicAsaasInvoiceUrl,
  normalizeSignupPix,
  pixQrImageSrc,
} from './SignupPage';

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(() => new Promise(() => {})),
}));

beforeEach(() => {
  window.sessionStorage.clear();
  axios.post.mockReset();
  axios.get.mockReset();
  axios.get.mockImplementation(() => new Promise(() => {}));
});

function setup(path = '/contratar?plan=PLAN_02') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SignupPage />
    </MemoryRouter>,
  );
}

function selectPlan(planCode = 'PLAN_02') {
  fireEvent.change(screen.getByLabelText(/faturamento mensal/i), {
    target: { value: planCode },
  });
}

test('starts without a preselected plan and blocks submit until one is chosen', () => {
  setup('/contratar');
  const planSelect = screen.getByLabelText(/faturamento mensal/i);
  expect(planSelect).toHaveValue('');
  expect(screen.getByRole('option', { name: /Selecione a faixa de faturamento/i })).toBeDisabled();
  expect(screen.getByText('Selecione um plano')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Continuar para o pagamento/i })).toBeDisabled();
  expect(axios.post).not.toHaveBeenCalled();
});

test('pix signup does not ask for address or send a price', async () => {
  axios.post.mockResolvedValue({
    data: {
      signupId: 42,
      pixPayload: '000201',
      invoiceUrl: 'https://sandbox.asaas.com/i/1',
      storeActive: false,
    },
  });
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
  expect(await screen.findByText('Pague com Pix para ativar')).toBeInTheDocument();
  expect(screen.getByTestId('pix-payload')).toHaveTextContent('000201');
  expect(screen.getByTestId('signup-waiting')).toHaveTextContent(/Aguardando o pagamento do Pix/i);
  expect(screen.queryByRole('link', { name: /Abrir fatura/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/public/billing/signup/42/status'));
});

test('public Asaas invoice urls are recognized; portal login is rejected', () => {
  expect(isPublicAsaasInvoiceUrl('https://sandbox.asaas.com/i/abc')).toBe(true);
  expect(isPublicAsaasInvoiceUrl('https://www.asaas.com/i/abc')).toBe(true);
  expect(isPublicAsaasInvoiceUrl('https://www.asaas.com/login/auth')).toBe(false);
  expect(isPublicAsaasInvoiceUrl('https://evil.example/i/1')).toBe(false);
});

test('normalizeSignupPix accepts payload aliases and builds qr image src', () => {
  expect(normalizeSignupPix({ payload: '000201', encodedImage: 'abc' })).toEqual({
    pixPayload: '000201',
    pixEncodedImage: 'abc',
    invoiceUrl: '',
  });
  expect(pixQrImageSrc('abc')).toBe('data:image/png;base64,abc');
  expect(pixQrImageSrc('data:image/png;base64,xyz')).toBe('data:image/png;base64,xyz');
});

test('generates QR from pix payload when Asaas omits encodedImage', async () => {
  axios.post.mockResolvedValue({
    data: {
      signupId: 55,
      pixPayload: '0002012655',
      storeActive: false,
    },
  });
  setup('/contratar?plan=PLAN_TEST');
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Lucas' } });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'lucas@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar para o pagamento/i }));
  expect(await screen.findByTestId('pix-payload')).toHaveTextContent('0002012655');
  expect(screen.getByRole('button', { name: /Copiar código Pix/i })).toBeInTheDocument();
  expect(document.querySelector('svg')).toBeTruthy();
});

test('status poll fills missing pix payload', async () => {
  axios.post.mockResolvedValue({
    data: { signupId: 56, storeActive: false },
  });
  axios.get.mockResolvedValue({
    data: {
      signupId: 56,
      paid: false,
      storeActive: false,
      pixPayload: '000201STATUS',
    },
  });
  setup('/contratar?plan=PLAN_TEST');
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Lucas' } });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'lucas@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar para o pagamento/i }));
  expect(await screen.findByTestId('pix-missing')).toBeInTheDocument();
  expect(await screen.findByTestId('pix-payload')).toHaveTextContent('000201STATUS');
});

test('card without postal code stays on the form', () => {
  setup('/contratar');
  selectPlan();
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

test('commercial dropdown omits PLAN_TEST without deep link', () => {
  setup('/contratar');
  expect(screen.queryByRole('option', { name: /Homologação/i })).not.toBeInTheDocument();
});

test('deep link PLAN_TEST preselects homologation plan and can submit', async () => {
  axios.post.mockResolvedValue({
    data: {
      signupId: 7,
      pixPayload: '000201',
      invoiceUrl: 'https://sandbox.asaas.com/i/test',
      storeActive: false,
    },
  });
  setup('/contratar?plan=PLAN_TEST');
  expect(screen.getByLabelText(/Plano selecionado|faturamento mensal/i)).toHaveValue('PLAN_TEST');
  expect(screen.getByText(/Plano de homologação Asaas/i)).toBeInTheDocument();
  expect(screen.getByRole('option', { name: /Homologação/i })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Lucas Homologação' } });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'lucas@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Continuar para o pagamento/i }));
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  expect(axios.post.mock.calls[0][1].planCode).toBe('PLAN_TEST');
  expect(await screen.findByTestId('signup-waiting')).toBeInTheDocument();
});
