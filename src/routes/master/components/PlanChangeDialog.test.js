import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import PlanChangeDialog from './PlanChangeDialog';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  defaults: { headers: { common: {} } },
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
}));

const OPTIONS = {
  storeName: 'Pizzaria Bella Napoli',
  currentPlan: 'PLAN_02',
  currentPlanLabel: 'Plano 2',
  currentAmount: 69.9,
  plans: [
    { code: 'PLAN_01', label: 'Plano 1', amount: 39.9 },
    { code: 'PLAN_02', label: 'Plano 2', amount: 69.9 },
    { code: 'PLAN_03', label: 'Plano 3', amount: 89.9 },
    { code: 'PLAN_04', label: 'Plano 4', amount: 99.9 },
    { code: 'PLAN_05', label: 'Plano 5', amount: 149.9 },
  ],
  dates: ['2027-02-10', '2027-03-10'],
  openChange: {
    id: 4,
    newPlan: 'PLAN_05',
    firstBillingDate: '2027-03-10',
    status: 'AWAITING_CONFIRMATION',
  },
};

beforeEach(() => {
  axios.get.mockReset();
  axios.get.mockResolvedValue({ data: OPTIONS });
});

function renderDialog() {
  return render(<PlanChangeDialog storeId={9} onClose={jest.fn()} onChanged={jest.fn()} />);
}

test('copia a mensagem com loja, planos, valores em reais e data DD/MM/AAAA', async () => {
  const writeText = jest.fn().mockResolvedValue();
  Object.assign(navigator, { clipboard: { writeText } });
  renderDialog();

  const message = await screen.findByLabelText('Mensagem para o cliente');
  await waitFor(() => expect(message.value).toContain('Plano 5'));
  fireEvent.click(screen.getByRole('button', { name: 'Copiar mensagem' }));

  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
  const copied = writeText.mock.calls[0][0];
  expect(copied).toBe(message.value);
  expect(copied).toContain('Pizzaria Bella Napoli');
  expect(copied).toMatch(/Plano 2, no valor de R\$\s?69,90 por mês/);
  expect(copied).toMatch(/a partir de 10\/03\/2027, sua mensalidade passará para o Plano 5, no valor de R\$\s?149,90/);
  expect(copied).toContain('Até essa data, sua mensalidade atual permanece normalmente.');
  expect(copied).not.toMatch(/PLAN_|storeId|id[: ]\d/i);
  expect(await screen.findByText('Mensagem copiada.')).toBeInTheDocument();
});

test('falha na área de transferência avisa e não finge que copiou', async () => {
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) } });
  renderDialog();
  const message = await screen.findByLabelText('Mensagem para o cliente');
  await waitFor(() => expect(message.value).toContain('Plano 5'));

  fireEvent.click(screen.getByRole('button', { name: 'Copiar mensagem' }));

  expect(await screen.findByText(/Não foi possível copiar/)).toBeInTheDocument();
  expect(screen.queryByText('Mensagem copiada.')).not.toBeInTheDocument();
});

test('não oferece abrir WhatsApp nem envio automático', async () => {
  renderDialog();
  await screen.findByLabelText('Mensagem para o cliente');

  expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /whatsapp|enviar/i })).not.toBeInTheDocument();
});
