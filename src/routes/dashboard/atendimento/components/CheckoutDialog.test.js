import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CheckoutDialog, getCloseAccountConfirmCopy } from './CheckoutDialog';
import {
  closeComandaAccount,
  closeTableAccount,
  getComandaAccount,
  getTableAccount,
} from '../service/accountService';
import {
  confirmExternalPayment,
  getStorePaymentConfig,
} from '../../../../services/paymentConfigService';

jest.mock('../service/accountService', () => ({
  closeComandaAccount: jest.fn(() => Promise.resolve({ data: {} })),
  closeTableAccount: jest.fn(() => Promise.resolve({ data: {} })),
  getComandaAccount: jest.fn(),
  getTableAccount: jest.fn(),
}));

jest.mock('../../../../services/paymentConfigService', () => {
  const actual = jest.requireActual('../../../../services/paymentConfigService');
  return {
    ...actual,
    capturePayment: jest.fn(() => Promise.resolve({ data: { id: 'pay-1', status: 'APPROVED' } })),
    createPaymentIntent: jest.fn(() => Promise.resolve({ data: { id: 'pay-1', status: 'APPROVED' } })),
    confirmExternalPayment: jest.fn(() => Promise.resolve({ data: { id: 'pay-1', status: 'PAID_EXTERNALLY' } })),
    getStorePaymentConfig: jest.fn(() => Promise.resolve({
      data: { acceptedMethods: ['PIX'], serviceFeePercent: 0.1, tablePaymentMode: 'MANUAL_CONFIRMATION' },
    })),
  };
});

const tableTarget = { id: 8, kind: 'mesa', number: 12 };
const comandaTarget = { id: 3, kind: 'comanda', number: 21 };

const openAccount = {
  status: 'OPEN',
  groupOrderId: 99,
  orders: [
    {
      id: 41,
      products: [{ id: 7, name: 'Café', value: 5, quantity: 1 }],
    },
  ],
};

function mockAccountApis() {
  getTableAccount.mockResolvedValue({ data: openAccount });
  getComandaAccount.mockResolvedValue({ data: openAccount });
}

async function renderCheckout(target = tableTarget) {
  render(
    <CheckoutDialog
      open
      target={target}
      onClose={jest.fn()}
      onPaid={jest.fn()}
    />,
  );
  expect(await screen.findByText(/Café/)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Confirmar pagamento e liberar' })).toBeEnabled();
  });
}

describe('getCloseAccountConfirmCopy', () => {
  it('manual pede confirmação externa sem sugerir que o Weper cobrou', () => {
    expect(getCloseAccountConfirmCopy(tableTarget, {
      paymentMode: 'MANUAL_CONFIRMATION',
      totalLabel: 'R$ 10,00',
    }).title).toBe('Confirma que o pagamento foi realizado?');
    expect(getCloseAccountConfirmCopy(comandaTarget, {
      paymentMode: 'ORDER_ONLY',
    }).title).toBe('Liberar comanda?');
  });
});

describe('CheckoutDialog confirmação de fechamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountApis();
    getStorePaymentConfig.mockResolvedValue({
      data: {
        acceptedMethods: ['PIX'],
        serviceFeePercent: 0.1,
        tablePaymentMode: 'MANUAL_CONFIRMATION',
        comandaPaymentMode: 'MANUAL_CONFIRMATION',
      },
    });
    confirmExternalPayment.mockResolvedValue({ data: { id: 'pay-1', status: 'PAID_EXTERNALLY' } });
  });

  it('abre o diálogo de confirmação da mesa sem chamar a API', async () => {
    await renderCheckout(tableTarget);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pagamento e liberar' }));

    expect(await screen.findByRole('heading', { name: 'Confirma que o pagamento foi realizado?' })).toBeInTheDocument();
    expect(screen.getByText(/o Weper não processou esta transação/i)).toBeInTheDocument();
    expect(confirmExternalPayment).not.toHaveBeenCalled();
    expect(closeTableAccount).not.toHaveBeenCalled();
  });

  it('cancela e não dispara pagamento nem fechamento', async () => {
    await renderCheckout(tableTarget);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pagamento e liberar' }));
    expect(await screen.findByRole('heading', { name: 'Confirma que o pagamento foi realizado?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Confirma que o pagamento foi realizado?' })).not.toBeInTheDocument();
    });
    expect(confirmExternalPayment).not.toHaveBeenCalled();
    expect(closeTableAccount).not.toHaveBeenCalled();
  });

  it('confirma pagamento externo e fecha a mesa', async () => {
    await renderCheckout(tableTarget);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pagamento e liberar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(confirmExternalPayment).toHaveBeenCalledTimes(1);
      expect(closeTableAccount).toHaveBeenCalledTimes(1);
    });
    expect(closeTableAccount).toHaveBeenCalledWith(8, expect.objectContaining({
      paymentMethod: 'PIX',
    }), expect.any(String));
  });

  it('mostra o aviso de comanda e fecha só após confirmar', async () => {
    await renderCheckout(comandaTarget);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pagamento e liberar' }));

    expect(await screen.findByRole('heading', { name: 'Confirma que o pagamento foi realizado?' })).toBeInTheDocument();
    expect(confirmExternalPayment).not.toHaveBeenCalled();
    expect(closeComandaAccount).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(closeComandaAccount).toHaveBeenCalledTimes(1);
    });
    expect(closeComandaAccount).toHaveBeenCalledWith(3, expect.objectContaining({
      paymentMethod: 'PIX',
    }), expect.any(String));
  });
});
