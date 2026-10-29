import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CashBar } from './CashBar';
import { addCashMovement, closeCash, getCurrentCash, newCashKey, openCash } from '../service/cashService';
import { cashDateTime, cashDifference, cashTime, parseMoney } from './cashView';

jest.mock('../service/cashService', () => ({
  getCurrentCash: jest.fn(),
  openCash: jest.fn(),
  addCashMovement: jest.fn(),
  closeCash: jest.fn(),
  newCashKey: jest.fn(() => 'key-1'),
}));

const openSession = {
  id: 7,
  status: 'OPEN',
  openingAmount: 100,
  openedAt: '2026-10-29T08:02:00',
  openedByName: 'Ana',
  movements: [],
  summary: {
    salesTotal: 105.5,
    ordersCount: 4,
    byMethod: [
      { method: 'PIX', amount: 45.5, orders: 1 },
      { method: 'CASH', amount: 50, orders: 2 },
    ],
    cashSales: 50,
    supplies: 0,
    withdrawals: 0,
    expectedCash: 150,
  },
};

describe('caixa no Atendimento', () => {
  beforeAll(() => {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    newCashKey.mockReturnValue('key-1');
  });

  it('converte valores e calcula a diferença', () => {
    expect(parseMoney('12,5')).toBe(12.5);
    expect(parseMoney('')).toBeNull();
    expect(cashDifference(145, 150)).toBe(-5);
    expect(cashDifference(null, 150)).toBeNull();
    expect(cashTime([2026, 10, 28, 22, 44, 23, 17951000])).toBe('22:44');
    expect(cashDateTime([2026, 10, 28, 8, 5])).toBe('28/10, 08:05');
  });

  it('abre o caixa com o troco informado', async () => {
    getCurrentCash.mockResolvedValue(null);
    openCash.mockResolvedValue({ data: openSession });
    const onChange = jest.fn();
    render(<CashBar onChange={onChange} />);

    expect(await screen.findByText('Caixa fechado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caixa' }));
    const dialog = screen.getByRole('dialog', { name: 'Abrir caixa' });
    fireEvent.change(within(dialog).getByLabelText('Dinheiro inicial (troco)'), { target: { value: '100' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Abrir caixa' }));

    await waitFor(() => expect(openCash).toHaveBeenCalledWith({ openingAmount: 100 }, 'key-1'));
    expect(await screen.findByText(/Caixa aberto desde/)).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(openSession);
  });

  it('registra sangria no caixa aberto', async () => {
    getCurrentCash.mockResolvedValue(openSession);
    addCashMovement.mockResolvedValue({ data: openSession });
    render(<CashBar />);

    fireEvent.click(await screen.findByRole('button', { name: 'Sangria / Suprimento' }));
    const dialog = screen.getByRole('dialog', { name: 'Sangria ou suprimento' });
    fireEvent.change(within(dialog).getByLabelText('Valor'), { target: { value: '30' } });
    fireEvent.change(within(dialog).getByLabelText('Motivo (opcional)'), { target: { value: 'cofre' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(addCashMovement).toHaveBeenCalledWith(
      7,
      { type: 'WITHDRAWAL', amount: 30, reason: 'cofre' },
      'key-1',
    ));
  });

  it('fecha mostrando o resumo, a falta e envia o contado', async () => {
    getCurrentCash.mockResolvedValue(openSession);
    closeCash.mockResolvedValue({ data: { ...openSession, status: 'CLOSED' } });
    const onChange = jest.fn();
    render(<CashBar onChange={onChange} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Fechar caixa' }));
    const dialog = screen.getByRole('dialog', { name: 'Fechar caixa' });
    expect(within(dialog).getByText('PIX · 1 pedido')).toBeInTheDocument();
    expect(within(dialog).getByText('Esperado na gaveta')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar caixa' }));
    expect(within(dialog).getByText('Conte o dinheiro da gaveta e informe o valor.')).toBeInTheDocument();
    expect(closeCash).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText('Dinheiro contado na gaveta'), { target: { value: '145' } });
    expect(within(dialog).getByRole('status')).toHaveTextContent('Falta: R$');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar caixa' }));

    await waitFor(() => expect(closeCash).toHaveBeenCalledWith(7, { countedCash: 145, notes: '' }, 'key-1'));
    expect(await screen.findByText('Caixa fechado')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
