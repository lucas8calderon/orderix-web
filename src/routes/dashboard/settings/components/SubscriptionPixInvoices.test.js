import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { getCurrentUser } from '../../../../services/authService';
import { SubscriptionPixInvoices, PIX_INVOICE_POLL_MS } from './SubscriptionPixInvoices';

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock('../../../../services/apiConfig', () => ({}));
jest.mock('../../../../services/authService', () => ({ getCurrentUser: jest.fn() }));

const openInvoice = {
  id: 9,
  competence: '2026-12',
  amount: 149.9,
  dueDate: '2026-12-10',
  status: 'OPEN',
  graceLimit: '2026-12-18',
  pix: { qrCode: '000201MENSAL', qrCodeBase64: 'iVBORw0KGgo=', expiresAt: '2026-12-19T00:00:00' },
};

const paidInvoice = { ...openInvoice, status: 'PAID', pix: null, paidAt: '2026-12-09T10:00:00' };

beforeEach(() => {
  axios.get.mockReset();
  axios.post.mockReset();
  getCurrentUser.mockReturnValue({ role: 'STORE_ADMIN' });
});

test('mostra a mensalidade em aberto com QR, código e prazo da tolerância', async () => {
  axios.get.mockResolvedValue({ data: { billingMethod: 'PIX', graceDays: 8, invoices: [openInvoice] } });

  render(<SubscriptionPixInvoices />);

  expect(await screen.findByText('Sua mensalidade está disponível')).toBeInTheDocument();
  expect(screen.getByText(/Vencimento: 10\/12\/2026/)).toBeInTheDocument();
  expect(screen.getByText(/Pague até 18\/12\/2026/)).toBeInTheDocument();
  expect(screen.getByTestId('pix-copy-code')).toHaveTextContent('000201MENSAL');
  expect(screen.getByAltText('QR Code Pix da mensalidade')).toHaveAttribute('src', 'data:image/png;base64,iVBORw0KGgo=');
  expect(screen.getByText('Aguardando pagamento')).toBeInTheDocument();
});

test('QR expirado oferece gerar outro e só gera quando a pessoa pede', async () => {
  axios.get.mockResolvedValueOnce({ data: { invoices: [{ ...openInvoice, pix: null }] } })
    .mockResolvedValueOnce({ data: { invoices: [openInvoice] } });
  axios.post.mockResolvedValue({ data: openInvoice });

  render(<SubscriptionPixInvoices />);
  const button = await screen.findByRole('button', { name: 'Gerar Pix da mensalidade' });
  expect(axios.post).not.toHaveBeenCalled();

  fireEvent.click(button);

  await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/billing/subscription/invoices/9/pix'));
  expect(await screen.findByTestId('pix-copy-code')).toHaveTextContent('000201MENSAL');
});

test('confirma o pagamento quando a mensalidade passa para paga', async () => {
  jest.useFakeTimers();
  axios.get.mockResolvedValueOnce({ data: { invoices: [openInvoice] } })
    .mockResolvedValue({ data: { invoices: [paidInvoice] } });

  render(<SubscriptionPixInvoices />);
  await screen.findByText('Sua mensalidade está disponível');

  await act(async () => {
    jest.advanceTimersByTime(PIX_INVOICE_POLL_MS);
  });

  expect(await screen.findByText('Pagamento confirmado! Sua assinatura está regularizada.')).toBeInTheDocument();
  expect(screen.getByText(/2026-12/)).toBeInTheDocument();
  jest.useRealTimers();
});

test('assinatura sem mensalidades Pix não mostra nada', async () => {
  axios.get.mockResolvedValue({ data: { invoices: [] } });

  const { container } = render(<SubscriptionPixInvoices />);

  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  expect(container).toBeEmptyDOMElement();
});
