import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThermalPrintPanel } from './ThermalPrintPanel';
import { saveSession, clearSession } from '../services/session';

afterEach(() => { clearSession(); delete process.env.REACT_APP_THERMAL_PRINT_SCOPE; jest.restoreAllMocks(); });
test('clientes não habilitados preservam a tela atual', () => {
  const { container } = render(<ThermalPrintPanel />);
  expect(container).toBeEmptyDOMElement();
});
test('teste apresenta instruções, falha de pop-up e relatório copiável sem clipboard', async () => {
  saveSession('test', { storeId: 3 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  jest.spyOn(window, 'open').mockReturnValue(null);
  render(<ThermalPrintPanel />);
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir teste KP-IM609' }));
  expect(screen.getByText(/Permita pop-ups/)).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(/Permita pop-ups/);
  fireEvent.click(screen.getByRole('button', { name: 'Copiar relatório de teste' }));
  expect((await screen.findByLabelText('Relatório para suporte')).value).toContain('"state": "error"');
  expect(screen.getByRole('status')).toHaveTextContent(/copie o relatório/i);
});
test('abrir a janela não é impressão concluída', () => {
  saveSession('test', { storeId: 3 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const doc = document.implementation.createHTMLDocument();
  const popup = { document: doc, focus: jest.fn(), print: jest.fn(), close: jest.fn() };
  jest.spyOn(window, 'open').mockReturnValue(popup);
  render(<ThermalPrintPanel account={{ orders: [{ id: 9, products: [{ name: 'Café', quantity: 1, value: 4 }] }] }} placeLabel="Comanda 21" />);
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir comanda 80 mm' }));
  expect(popup.print).toHaveBeenCalledTimes(1);
  expect(popup.close).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent(/não confirma que o papel saiu/);
  expect(screen.getByText(/não cobra, não fecha a conta/i)).toBeInTheDocument();
  expect(doc.documentElement.innerHTML).toContain('Comanda 21');
  expect(doc.documentElement.innerHTML).toContain('NÃO É COMPROVANTE DE PAGAMENTO');
});
