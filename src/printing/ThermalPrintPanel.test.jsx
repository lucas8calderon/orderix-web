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
test('na conta mostra só o botão Imprimir, sem o diagnóstico', () => {
  saveSession('test', { storeId: 3 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  const doc = document.implementation.createHTMLDocument();
  const popup = { document: doc, focus: jest.fn(), print: jest.fn(), close: jest.fn() };
  jest.spyOn(window, 'open').mockReturnValue(popup);
  render(<ThermalPrintPanel account={{ orders: [{ id: 9, products: [{ name: 'Café', quantity: 1, value: 4 }] }] }} placeLabel="Comanda 21" />);
  expect(screen.queryByText(/Impressão térmica USB/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Resultado no papel')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Copiar relatório de teste' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
  expect(popup.print).toHaveBeenCalledTimes(1);
  expect(popup.close).not.toHaveBeenCalled();
  expect(doc.documentElement.innerHTML).toContain('Comanda 21');
  expect(doc.documentElement.innerHTML).toContain('NÃO É COMPROVANTE DE PAGAMENTO');
});
test('na conta, falha ao abrir a impressão aparece como erro', () => {
  saveSession('test', { storeId: 3 });
  process.env.REACT_APP_THERMAL_PRINT_SCOPE = 'all';
  jest.spyOn(window, 'open').mockReturnValue(null);
  render(<ThermalPrintPanel account={{ orders: [{ id: 9, products: [{ name: 'Café', quantity: 1, value: 4 }] }] }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Imprimir' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/Permita pop-ups/);
});
