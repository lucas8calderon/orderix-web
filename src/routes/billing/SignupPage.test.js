import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  });
  axios.post.mockReset();
  axios.get.mockReset();
  axios.get.mockImplementation(() => new Promise(() => {}));
});

function fillContact(name = 'Maria') {
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '11988887777' } });
}

function signupCall() {
  return axios.post.mock.calls.find((call) => call[0] === '/api/public/billing/signup');
}

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
  expect(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i })).toBeDisabled();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.queryByText(/contatos promocionais/i)).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Termos de Uso' })).toBeInTheDocument();
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
  fireEvent.click(screen.getByLabelText('Pix'));
  expect(screen.queryByLabelText('CEP')).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/CNPJ do estabelecimento/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/boleto/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/7 dias grátis|teste gratuito|trial/i)).not.toBeInTheDocument();
  fillContact();
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  await waitFor(() => expect(signupCall()).toBeTruthy());
  const payload = signupCall()[1];
  expect(axios.post.mock.calls[0][0]).toBe('/api/public/billing/leads');
  expect(axios.post.mock.calls[0][1].marketingOptIn).toBe(false);
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

test('referral field is prefilled from ref, editable, and shows a notice without blocking payment', async () => {
  axios.post.mockResolvedValue({
    data: {
      signupId: 7,
      pixPayload: '000201',
      partnerReferralNotice: 'Código de indicação inválido. A contratação segue sem comissão de parceiro.',
    },
  });
  setup('/contratar?plan=PLAN_02&ref=WPR-BK9ASD');
  const field = await screen.findByLabelText('Indicação? Insira o código');
  await waitFor(() => expect(field).toHaveValue('WPR-BK9ASD'));
  fireEvent.change(field, { target: { value: 'nao-existe' } });
  fillContact();
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  await waitFor(() => expect(signupCall()).toBeTruthy());
  expect(signupCall()[1].partnerReferralCode).toBe('NAO-EXISTE');
  expect(await screen.findByTestId('partner-referral-notice')).toHaveTextContent(/sem comissão de parceiro/i);
  expect(screen.getByTestId('pix-payload')).toHaveTextContent('000201');
});

test('ref da URL prevalece sobre código antigo e segue no pagamento junto com o lead', async () => {
  axios.post.mockImplementation((url) => {
    if (url === '/api/public/billing/leads') {
      return Promise.resolve({
        data: {
          leadToken: '06c21c5b-1544-4b93-a78c-9da9cd81e7c3',
          planCode: 'PLAN_05',
          created: false,
        },
      });
    }
    return Promise.resolve({ data: { signupId: 9, pixPayload: '000201' } });
  });
  window.sessionStorage.setItem('weper.partnerRef', '3Z2D853K');
  document.cookie = 'weper_partner_ref=3Z2D853K; Path=/';
  setup('/contratar?plan=PLAN_05&lead=06c21c5b-1544-4b93-a78c-9da9cd81e7c3&ref=E3FUVE');
  const field = screen.getByLabelText('Indicação? Insira o código');
  expect(field).toHaveValue('E3FUVE');
  fillContact('Lucas Calderon');
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'lucas@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  await waitFor(() => expect(signupCall()).toBeTruthy());
  expect(signupCall()[1].partnerReferralCode).toBe('E3FUVE');
  expect(signupCall()[1].leadToken).toBe('06c21c5b-1544-4b93-a78c-9da9cd81e7c3');
  expect(signupCall()[1].planCode).toBe('PLAN_05');
  expect(window.sessionStorage.getItem('weper.partnerRef')).toBe('E3FUVE');
});

test('sem ref o campo começa vazio e o código digitado é o que segue no pagamento', async () => {
  axios.post.mockResolvedValue({ data: { signupId: 10, pixPayload: '000201' } });
  setup('/contratar?plan=PLAN_05&lead=06c21c5b-1544-4b93-a78c-9da9cd81e7c3');
  const field = screen.getByLabelText('Indicação? Insira o código');
  expect(field).toHaveValue('');
  fireEvent.change(field, { target: { value: 'digitado' } });
  expect(field).toHaveValue('DIGITADO');
  fillContact();
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  await waitFor(() => expect(signupCall()).toBeTruthy());
  expect(signupCall()[1].partnerReferralCode).toBe('DIGITADO');
  expect(axios.post.mock.calls[0][0]).toBe('/api/public/billing/leads');
});

test('cleared referral field is not sent even when ref was stored', async () => {
  axios.post.mockResolvedValue({
    data: { signupId: 8, pixPayload: '000201' },
  });
  setup('/contratar?plan=PLAN_02&ref=K7M4NP');
  const field = await screen.findByLabelText('Indicação? Insira o código');
  await waitFor(() => expect(field).toHaveValue('K7M4NP'));
  fireEvent.change(field, { target: { value: '' } });
  fillContact();
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  await waitFor(() => expect(signupCall()).toBeTruthy());
  expect(signupCall()[1].partnerReferralCode).toBeUndefined();
  expect(screen.queryByTestId('partner-referral-notice')).not.toBeInTheDocument();
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
  fillContact('Lucas');
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'lucas@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
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
  fillContact('Lucas');
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'lucas@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  expect(await screen.findByTestId('pix-missing')).toBeInTheDocument();
  expect(await screen.findByTestId('pix-payload')).toHaveTextContent('000201STATUS');
});

test('card without postal code stays on the form', () => {
  setup('/contratar');
  selectPlan();
  fireEvent.click(screen.getByLabelText('Cartão de crédito'));
  expect(screen.getByLabelText('CEP')).toBeInTheDocument();
  fillContact();
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  expect(screen.getByRole('alert')).toHaveTextContent('telefone, CEP e número');
  expect(axios.post).not.toHaveBeenCalled();
});

test('api error stays visible and does not claim the store is active', async () => {
  axios.post.mockRejectedValue({ response: { data: { message: 'Plano inexistente.' } } });
  setup();
  fillContact();
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Plano inexistente.');
  expect(screen.getByLabelText('Nome completo')).toHaveValue('Maria');
  expect(screen.getByLabelText('WhatsApp')).toHaveValue('(11) 98888-7777');
  expect(screen.queryByText('Pagamento em confirmação')).not.toBeInTheDocument();
});

test('shows commercial comparison outside the checkout form', () => {
  setup('/contratar');
  expect(screen.getByText((_, node) => (
    node?.tagName === 'EM' && /SEM COMISSÕES POR VENDA/i.test(node.textContent || '')
  ))).toBeInTheDocument();
  expect(screen.getByText(/Marketplaces de delivery/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Contratar a Weper' })).toBeInTheDocument();
  const form = screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }).closest('form');
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
  fillContact('Lucas Homologação');
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'lucas@example.com' } });
  fireEvent.click(screen.getByLabelText('Pix'));
  fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));
  await waitFor(() => expect(signupCall()).toBeTruthy());
  expect(signupCall()[1].planCode).toBe('PLAN_TEST');
  expect(await screen.findByTestId('signup-waiting')).toBeInTheDocument();
});

describe('com Mercado Pago ativo', () => {
  let createCardToken;

  beforeEach(() => {
    createCardToken = jest.fn().mockResolvedValue({ id: 'tok_mp_123' });
    window.MercadoPago = jest.fn(() => ({ createCardToken }));
  });

  afterEach(() => {
    delete window.MercadoPago;
  });

  function mockGateway(data) {
    axios.get.mockImplementation((url) => (
      url === '/api/public/billing/gateway' ? Promise.resolve({ data }) : new Promise(() => {})
    ));
  }

  function fillCard() {
    fireEvent.change(screen.getByLabelText('Nome do titular'), { target: { value: 'MARIA SILVA' } });
    fireEvent.change(screen.getByLabelText('Número do cartão'), { target: { value: '5031433215406351' } });
    fireEvent.change(screen.getByLabelText('Mês'), { target: { value: '11' } });
    fireEvent.change(screen.getByLabelText('Ano'), { target: { value: '2030' } });
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '01310100' } });
    fireEvent.change(screen.getByLabelText('Número'), { target: { value: '100' } });
  }

  test('gera o token no navegador e não envia o número do cartão à Weper', async () => {
    mockGateway({ gateway: 'MERCADO_PAGO', available: true, mercadoPagoPublicKey: 'APP_USR-public' });
    axios.post.mockResolvedValue({ data: { signupId: 77 } });
    setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/public/billing/gateway'));
    await act(async () => {});
    fireEvent.click(screen.getByLabelText('Cartão de crédito'));
    fillContact();
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
    fillCard();
    fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));

    await waitFor(() => expect(signupCall()).toBeTruthy());
    expect(window.MercadoPago).toHaveBeenCalledWith('APP_USR-public', { locale: 'pt-BR' });
    expect(createCardToken).toHaveBeenCalledWith(expect.objectContaining({
      cardNumber: '5031433215406351',
      cardExpirationMonth: '11',
      cardExpirationYear: '2030',
      identificationType: 'CPF',
      identificationNumber: '52998224725',
    }));
    const payload = signupCall()[1];
    expect(payload.billingType).toBe('CREDIT_CARD');
    expect(payload.creditCardToken).toBe('tok_mp_123');
    expect(payload.card).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain('5031433215406351');
  });

  test('conta da Weper não conectada bloqueia antes de chamar o Mercado Pago', async () => {
    mockGateway({ gateway: 'MERCADO_PAGO', available: false, message: 'A contratação com cartão está temporariamente indisponível.' });
    setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/public/billing/gateway'));
    await act(async () => {});
    fireEvent.click(screen.getByLabelText('Cartão de crédito'));
    fillContact();
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
    fillCard();
    fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('temporariamente indisponível');
    expect(createCardToken).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('Pix com Mercado Pago gera o QR sem pedir cartão nem token', async () => {
    mockGateway({ gateway: 'MERCADO_PAGO', available: true, mercadoPagoPublicKey: 'APP_USR-public' });
    axios.post.mockResolvedValue({ data: { signupId: 88, pixPayload: '000201MPPIX', pixEncodedImage: 'iVBORw0KGgo=' } });
    setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/public/billing/gateway'));
    await act(async () => {});
    fillContact();
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
    fireEvent.click(screen.getByLabelText('Pix'));
    fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));

    await waitFor(() => expect(signupCall()).toBeTruthy());
    const payload = signupCall()[1];
    expect(payload.billingType).toBe('PIX');
    expect(payload.creditCardToken).toBeUndefined();
    expect(payload.card).toBeUndefined();
    expect(createCardToken).not.toHaveBeenCalled();
    expect(await screen.findByTestId('pix-payload')).toHaveTextContent('000201MPPIX');
  });

  test('cartão recusado na tokenização fica no formulário', async () => {
    mockGateway({ gateway: 'MERCADO_PAGO', available: true, mercadoPagoPublicKey: 'APP_USR-public' });
    createCardToken.mockRejectedValue(new Error('invalid'));
    setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/public/billing/gateway'));
    await act(async () => {});
    fireEvent.click(screen.getByLabelText('Cartão de crédito'));
    fillContact();
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
    fillCard();
    fireEvent.click(screen.getByRole('button', { name: /Assinar com cartão|Continuar com Pix/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível validar o cartão');
    expect(signupCall()).toBeUndefined();
  });
});

test('cartão vem primeiro, selecionado e recomendado; a nota e o botão acompanham a escolha', () => {
  setup();
  const radios = screen.getAllByRole('radio').filter((radio) => radio.getAttribute('name') === 'billing');
  expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual(['Cartão de crédito', 'Pix']);
  const cardRadio = screen.getByRole('radio', { name: 'Cartão de crédito' });
  expect(cardRadio).toBeChecked();
  expect(cardRadio.closest('label')).toHaveTextContent('Recomendado');
  expect(screen.getByRole('radio', { name: 'Pix' }).closest('label')).not.toHaveTextContent('Recomendado');
  expect(screen.getByTestId('pay-note')).toHaveTextContent('Seu cartão será cobrado automaticamente a cada renovação');
  expect(screen.queryByText('Selecionado')).not.toBeInTheDocument();
  expect(screen.queryByText('Selecionar')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Assinar com cartão/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('radio', { name: 'Pix' }));

  expect(screen.getByRole('radio', { name: 'Pix' })).toBeChecked();
  expect(screen.getByTestId('pay-note')).toHaveTextContent('deverá realizar o pagamento manualmente');
  expect(screen.getByTestId('pay-note')).not.toHaveTextContent('automaticamente');
  expect(screen.getByRole('button', { name: /Continuar com Pix/i })).toBeInTheDocument();
  expect(screen.queryByLabelText('CEP')).not.toBeInTheDocument();
});

describe('Pix pelo Mercado Pago', () => {
  function mockGateway(data) {
    axios.get.mockImplementation((url) => (
      url === '/api/public/billing/gateway' ? Promise.resolve({ data }) : new Promise(() => {})
    ));
  }

  async function fillPixForm() {
    setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/public/billing/gateway'));
    await act(async () => {});
    fillContact();
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Pix' }));
  }

  test('falha ao gerar mostra mensagem amigável, mantém os dados e tenta de novo na mesma contratação', async () => {
    mockGateway({ gateway: 'MERCADO_PAGO', available: true, mercadoPagoPublicKey: 'APP_USR-public', pixAvailable: true });
    axios.post.mockImplementation((url) => {
      if (url === '/api/public/billing/leads') return Promise.resolve({ data: { token: 'lead-1', created: true } });
      return Promise.reject({ response: { status: 503, data: { message: 'BillingUnavailable detalhe técnico' } } });
    });
    await fillPixForm();

    fireEvent.click(screen.getByRole('button', { name: /Continuar com Pix/i }));

    const box = await screen.findByTestId('pix-error');
    expect(box).toHaveTextContent('Não conseguimos gerar seu Pix.');
    expect(box).toHaveTextContent('Tente novamente em alguns instantes ou escolha cartão de crédito.');
    expect(screen.queryByText(/detalhe técnico/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Maria');

    axios.post.mockImplementation((url) => {
      if (url === '/api/public/billing/leads') return Promise.resolve({ data: { token: 'lead-1', created: false } });
      return Promise.resolve({ data: { signupId: 91, pixPayload: '000201RETRY', pixEncodedImage: 'iVBORw0KGgo=' } });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByTestId('pix-payload')).toHaveTextContent('000201RETRY');
    const signupCalls = axios.post.mock.calls.filter((call) => call[0] === '/api/public/billing/signup');
    expect(signupCalls).toHaveLength(2);
    expect(signupCalls[1][1].email).toBe('maria@example.com');
    expect(signupCalls[1][1].billingType).toBe('PIX');
  });

  test('sem a conta da Weper conectada, Pix aparece indisponível e o cartão fica selecionado', async () => {
    mockGateway({ gateway: 'MERCADO_PAGO', available: true, mercadoPagoPublicKey: 'APP_USR-public', pixAvailable: false });
    setup();
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Pix' })).toBeDisabled());

    expect(screen.getByRole('radio', { name: 'Cartão de crédito' })).toBeChecked();
    expect(screen.getByText('Indisponível no momento. Use o cartão de crédito.')).toBeInTheDocument();
  });
});
