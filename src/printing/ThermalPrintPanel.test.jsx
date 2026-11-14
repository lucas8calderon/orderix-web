import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThermalPrintPanel } from './ThermalPrintPanel';
import { saveSession, clearSession } from '../services/session';
import { ensureDeliveryReceiptRoute } from '../services/deliveryRouteApi';

jest.mock('../services/deliveryRouteApi', () => ({
  ensureDeliveryReceiptRoute: jest.fn(),
  apiErrorMessage: (error, fallback) => error?.response?.data?.message || fallback,
}));

jest.mock('qrcode', () => ({
  __esModule: true,
  default: { toDataURL: jest.fn(async () => 'data:image/png;base64,QUJD') },
}));

function installIframePrint() {
  const probe = document.createElement('iframe');
  document.body.appendChild(probe);
  const win = probe.contentWindow;
  if (win) {
    Object.getPrototypeOf(win).print = function print() {};
  }
  probe.remove();
}

beforeAll(() => { installIframePrint(); });
afterEach(() => {
  clearSession();
  delete process.env.REACT_APP_THERMAL_PRINT_SCOPE;
  jest.restoreAllMocks();
  document.querySelectorAll('iframe').forEach((frame) => frame.remove());
});
test('clientes não habilitados preservam a tela atual', () => {
  const { container } = render(<ThermalPrintPanel />);
  expect(container).toBeEmptyDOMElement();
});
test('teste apresenta instruções, falha de impressão e relatório copiável sem clipboard', async () => {
  saveSession('test', { storeId: 3 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const append = document.body.appendChild.bind(document.body);
  jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
    const added = append(node);
    if (node.tagName === 'IFRAME' && node.contentWindow) {
      node.contentWindow.print = () => { throw new Error('bloqueado'); };
    }
    return added;
  });
  render(<ThermalPrintPanel />);
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir teste KP-IM609' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/Não foi possível enviar a comanda/);
  fireEvent.click(screen.getByRole('button', { name: 'Copiar relatório de teste' }));
  expect((await screen.findByLabelText('Relatório para suporte')).value).toContain('"state": "error"');
  expect(screen.getByRole('status')).toHaveTextContent(/copie o relatório/i);
});
test('na conta mostra só o botão Imprimir, sem o diagnóstico e sem aba nova', () => {
  saveSession('test', { storeId: 3 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const open = jest.spyOn(window, 'open');
  render(<ThermalPrintPanel account={{ orders: [{ id: 9, products: [{ name: 'Café', quantity: 1, value: 4 }] }] }} placeLabel="Comanda 21" />);
  expect(screen.queryByText(/Impressão térmica USB/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Resultado no papel')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Copiar relatório de teste' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
  expect(open).not.toHaveBeenCalled();
  const frame = document.querySelector('iframe');
  expect(frame.dataset.printed).toBe('1');
  expect(frame.contentDocument.documentElement.innerHTML).toContain('Comanda 21');
  expect(frame.contentDocument.documentElement.innerHTML).not.toContain('NÃO É COMPROVANTE DE PAGAMENTO');
  expect(frame.contentDocument.documentElement.innerHTML).not.toContain('WEPER');
});
test('imprimir entrega coloca o QR na comanda e não o telefone', async () => {
  saveSession('test', { storeId: 3 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  ensureDeliveryReceiptRoute.mockResolvedValue({
    data: { publicUrl: 'https://www.weper.com.br/rotas/token-somente', storeName: 'Weper Burger' },
  });
  render(<ThermalPrintPanel account={{
    orders: [{
      id: 158,
      displayCode: '0158',
      customerName: 'João Silva',
      customerPhone: '11977776666',
      deliveryFulfillment: 'DELIVERY',
      createdAt: '2026-11-14T20:35:00',
      deliveryStreet: 'Rua das Flores',
      deliveryNumber: '120',
      deliveryNeighborhood: 'Centro',
      deliveryCity: 'São Paulo',
      deliveryState: 'SP',
      deliveryFee: 5,
      totalAmount: 55,
      products: [{ name: 'X-Burger', quantity: 2, value: 25 }],
    }],
  }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
  await waitFor(() => {
    expect(document.querySelector('iframe')?.dataset.printed).toBe('1');
  });
  const html = document.querySelector('iframe').contentDocument.documentElement.innerHTML;
  expect(html).toContain('src="data:image/png;base64,QUJD"');
  expect(html).toContain('WEPER BURGER');
  expect(html).toContain('PEDIDO #0158');
  expect(html).toContain('Escaneie para abrir a rota');
  expect(html).not.toContain('11977776666');
  expect(html).not.toContain('token-somente');
  expect(ensureDeliveryReceiptRoute).toHaveBeenCalledWith(158);
});
test('na conta, falha ao imprimir aparece como erro', () => {
  saveSession('test', { storeId: 3 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const append = document.body.appendChild.bind(document.body);
  jest.spyOn(document.body, 'appendChild').mockImplementation((node) => {
    const added = append(node);
    if (node.tagName === 'IFRAME') {
      Object.defineProperty(node, 'contentWindow', { configurable: true, get: () => null });
      Object.defineProperty(node, 'contentDocument', { configurable: true, get: () => null });
    }
    return added;
  });
  render(<ThermalPrintPanel account={{ orders: [{ id: 9, products: [{ name: 'Café', quantity: 1, value: 4 }] }] }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/Não foi possível imprimir neste navegador/);
});
