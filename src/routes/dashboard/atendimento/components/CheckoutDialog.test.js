import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { cashChange, CheckoutDialog, getCloseAccountConfirmCopy } from './CheckoutDialog';
import {
  closeComandaAccount,
  closeCounterOrder,
  closeTableAccount,
  getComandaAccount,
  getTableAccount,
} from '../service/accountService';
import { listDeliveryOrders } from '../service/deliveryOrderService';
import {
  confirmExternalPayment,
  getStorePaymentConfig,
} from '../../../../services/paymentConfigService';
import { clearSession, saveSession } from '../../../../services/session';

jest.mock('../service/deliveryOrderService', () => ({
  listDeliveryOrders: jest.fn(),
}));

jest.mock('../service/accountService', () => ({
  closeComandaAccount: jest.fn(() => Promise.resolve({ data: {} })),
  closeCounterOrder: jest.fn(() => Promise.resolve({ data: {} })),
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
    expect(screen.getByRole('button', { name: /^Confirmar pagamento/ })).toBeEnabled();
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
    }).title).toBe('Finalizar comanda?');
    expect(getCloseAccountConfirmCopy(
      { kind: 'delivery', number: '0033', fulfillment: 'PICKUP' },
      { paymentMode: 'MANUAL_CONFIRMATION', totalLabel: 'R$ 12,00' },
    ).description).toMatch(/pedido de retirada 0033/);
    expect(getCloseAccountConfirmCopy(
      { kind: 'delivery', number: '0040', fulfillment: 'DELIVERY' },
      { paymentMode: 'INTEGRATED_PAYMENT' },
    ).title).toBe('Fechar pedido de entrega?');
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

    fireEvent.click(screen.getByRole('button', { name: /^Confirmar pagamento/ }));

    expect(await screen.findByRole('heading', { name: 'Confirma que o pagamento foi realizado?' })).toBeInTheDocument();
    expect(screen.getByText(/o Weper não processou esta transação/i)).toBeInTheDocument();
    expect(confirmExternalPayment).not.toHaveBeenCalled();
    expect(closeTableAccount).not.toHaveBeenCalled();
  });

  it('cancela e não dispara pagamento nem fechamento', async () => {
    await renderCheckout(tableTarget);

    fireEvent.click(screen.getByRole('button', { name: /^Confirmar pagamento/ }));
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

    fireEvent.click(screen.getByRole('button', { name: /^Confirmar pagamento/ }));
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

    fireEvent.click(screen.getByRole('button', { name: /^Confirmar pagamento/ }));

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

  it('fecha o pedido de balcão pelo endpoint individual', async () => {
    getTableAccount.mockResolvedValue({
      data: {
        status: 'ACTIVE',
        orders: [
          { id: 23, status: 'ACTIVE', products: [{ id: 7, name: 'Café', value: 5, quantity: 1 }] },
          { id: 24, status: 'CLOSED', products: [{ id: 8, name: 'Suco', value: 8, quantity: 1 }] },
        ],
      },
    });
    getStorePaymentConfig.mockResolvedValue({
      data: {
        acceptedMethods: ['CASH'],
        serviceFeePercent: 0,
        counterPaymentMode: 'MANUAL_CONFIRMATION',
      },
    });

    render(
      <CheckoutDialog
        open
        target={{ kind: 'counter', id: 23, number: 23 }}
        onClose={jest.fn()}
        onPaid={jest.fn()}
      />,
    );

    expect(await screen.findByText(/Café/)).toBeInTheDocument();
    expect(screen.queryByText(/Suco/)).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Confirmar pagamento/ })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /^Confirmar pagamento/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(closeCounterOrder).toHaveBeenCalledWith(23, expect.objectContaining({
        paymentMethod: 'CASH',
      }), expect.any(String));
    });
    expect(closeTableAccount).not.toHaveBeenCalled();
    expect(getTableAccount).toHaveBeenCalledWith(999);
  });

  it('cobra a retirada no mesmo fechamento do balcão, com a taxa de entrega', async () => {
    listDeliveryOrders.mockResolvedValue({
      data: [{
        id: 33,
        status: 'ACTIVE',
        customerName: 'Lucas Calderon',
        displayCode: '0033',
        deliveryFulfillment: 'PICKUP',
        deliveryFee: 0,
        products: [{ id: 1, name: 'Cerveja Heineken', value: 12, quantity: 1 }],
      }, {
        id: 40,
        status: 'ACTIVE',
        customerName: 'Ana Souza',
        deliveryFulfillment: 'DELIVERY',
        deliveryFee: 5,
        products: [{ id: 2, name: 'Batata', value: 10, quantity: 1 }],
      }],
    });
    getStorePaymentConfig.mockResolvedValue({
      data: {
        acceptedMethods: ['PIX'],
        serviceFeePercent: 0,
        counterPaymentMode: 'MANUAL_CONFIRMATION',
      },
    });

    const onPaid = jest.fn();
    const pickupDialog = render(
      <CheckoutDialog
        open
        target={{
          kind: 'delivery',
          id: 33,
          number: '0033',
          customerName: 'Lucas Calderon',
          fulfillment: 'PICKUP',
        }}
        onClose={jest.fn()}
        onPaid={onPaid}
      />,
    );

    expect(await screen.findByText(/Cerveja Heineken/)).toBeInTheDocument();
    expect(screen.getByText(/Retirada #0033 — Lucas Calderon/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar produtos' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Confirmar pagamento/ })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole('button', { name: /^Confirmar pagamento/ }));
    expect(await screen.findByText(/pedido de retirada 0033/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(confirmExternalPayment).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 33, paymentMethod: 'PIX' }),
        expect.any(String),
      );
      expect(closeCounterOrder).toHaveBeenCalledWith(33, expect.objectContaining({
        paymentMethod: 'PIX',
      }), expect.any(String));
    });
    expect(closeTableAccount).not.toHaveBeenCalled();
    pickupDialog.unmount();

    render(
      <CheckoutDialog
        open
        target={{ kind: 'delivery', id: 40, number: '0040', customerName: 'Ana Souza', fulfillment: 'DELIVERY' }}
        onClose={jest.fn()}
        onPaid={jest.fn()}
      />,
    );
    expect(await screen.findByText('Taxa de entrega')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Confirmar pagamento/ }));
    expect(await screen.findByText(/pagamento de R\$\s*15,00 foi realizado fora do Weper/)).toBeInTheDocument();
    expect(screen.getByText(/pedido de entrega 0040 será fechado/)).toBeInTheDocument();
  });

  it('imprime a comanda sem cobrar, fechar ou tratar a janela como sucesso', async () => {
    saveSession('test', { storeId: 8 });
    process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
    const doc = document.implementation.createHTMLDocument();
    const popup = { document: doc, focus: jest.fn(), print: jest.fn(), close: jest.fn() };
    jest.spyOn(window, 'open').mockReturnValue(popup);
    try {
      await renderCheckout(tableTarget);
      expect(screen.queryByText(/Impressão térmica USB/)).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
      expect(popup.print).toHaveBeenCalledTimes(1);
      expect(popup.close).not.toHaveBeenCalled();
      expect(doc.documentElement.innerHTML).toContain('Mesa 12');
      expect(doc.documentElement.innerHTML).toContain('Café');
      expect(doc.documentElement.innerHTML).toContain('1x');
      expect(doc.documentElement.innerHTML).toContain('NÃO É DOCUMENTO FISCAL');
      expect(doc.documentElement.innerHTML).toContain('NÃO É COMPROVANTE DE PAGAMENTO');
      expect(confirmExternalPayment).not.toHaveBeenCalled();
      expect(closeTableAccount).not.toHaveBeenCalled();
    } finally {
      clearSession();
      delete process.env.REACT_APP_THERMAL_PRINT_SCOPE;
      jest.restoreAllMocks();
    }
  });

  it('não dispara pagamento real no modo integrado da retirada', async () => {
    listDeliveryOrders.mockResolvedValue({
      data: [{
        id: 33,
        status: 'ACTIVE',
        customerName: 'Lucas Calderon',
        deliveryFulfillment: 'PICKUP',
        products: [{ id: 1, name: 'Cerveja Heineken', value: 12, quantity: 1 }],
      }],
    });
    getStorePaymentConfig.mockResolvedValue({
      data: {
        acceptedMethods: ['CREDIT'],
        serviceFeePercent: 0,
        counterPaymentMode: 'INTEGRATED_PAYMENT',
      },
    });

    render(
      <CheckoutDialog
        open
        target={{ kind: 'delivery', id: 33, number: '0033', customerName: 'Lucas Calderon', fulfillment: 'PICKUP' }}
        onClose={jest.fn()}
        onPaid={jest.fn()}
      />,
    );

    expect(await screen.findByText(/Só feche aqui se o pagamento já estiver aprovado/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Fechar conta' })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Fechar conta' }));
    expect(await screen.findByRole('heading', { name: 'Fechar pedido de retirada?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(closeCounterOrder).toHaveBeenCalledTimes(1);
    });
    expect(confirmExternalPayment).not.toHaveBeenCalled();
  });
});

describe('CheckoutDialog forma de pagamento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAccountApis();
    confirmExternalPayment.mockResolvedValue({ data: { id: 'pay-1', status: 'PAID_EXTERNALLY' } });
  });

  it('calcula o troco em dinheiro', () => {
    expect(cashChange(37.5, '50')).toEqual({ change: 12.5, missing: 0 });
    expect(cashChange(37.5, '20,00')).toEqual({ change: 0, missing: 17.5 });
    expect(cashChange(37.5, '')).toBeNull();
  });

  it('em "Somente lançar" também registra a forma de pagamento escolhida', async () => {
    getStorePaymentConfig.mockResolvedValue({
      data: {
        acceptedMethods: ['PIX', 'CASH'],
        serviceFeePercent: 0.1,
        tablePaymentMode: 'ORDER_ONLY',
        comandaPaymentMode: 'ORDER_ONLY',
      },
    });
    render(<CheckoutDialog open target={tableTarget} onClose={jest.fn()} onPaid={jest.fn()} />);
    expect(await screen.findByText(/Café/)).toBeInTheDocument();
    const finish = await screen.findByRole('button', { name: /^Finalizar/ });
    fireEvent.click(await screen.findByRole('button', { name: 'Dinheiro' }));
    fireEvent.change(screen.getByLabelText('Valor recebido'), { target: { value: '100' } });
    expect(screen.getByText(/Troco:/)).toBeInTheDocument();
    fireEvent.click(finish);
    expect(await screen.findByText(/Forma de pagamento: Dinheiro/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => {
      expect(closeTableAccount).toHaveBeenCalledWith(
        tableTarget.id,
        expect.objectContaining({ paymentMethod: 'CASH' }),
        expect.any(String),
      );
    });
    expect(confirmExternalPayment).not.toHaveBeenCalled();
  });
});
