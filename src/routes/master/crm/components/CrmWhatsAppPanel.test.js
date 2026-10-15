import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CrmWhatsAppPanel, CrmWhatsAppOptOut } from './CrmWhatsAppPanel';
import { whatsappApi } from '../whatsappTemplate';
jest.mock('../whatsappTemplate', () => ({ whatsappApi: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));
beforeEach(() => { jest.clearAllMocks(); });
test('edita a mensagem sem exigir fila ou qualificação', async () => {
  whatsappApi.get.mockResolvedValue({ data: { message: 'Parceria gratuita' } });
  whatsappApi.put.mockResolvedValue({});
  render(<CrmWhatsAppPanel />);
  const field = await screen.findByDisplayValue('Parceria gratuita');
  fireEvent.change(field, { target: { value: 'Olá! Somos a Weper.' } });
  fireEvent.click(screen.getByText('Salvar mensagem'));
  await waitFor(() => expect(whatsappApi.put).toHaveBeenCalledWith('/template', { message: 'Olá! Somos a Weper.' }));
  expect(whatsappApi.get).toHaveBeenCalledWith('/template');
  expect(whatsappApi.post).not.toHaveBeenCalled();
  expect(screen.queryByText(/Gerar.*fila/)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/autorização|independente/i)).not.toBeInTheDocument();
});
test('mantém opção de não contatar sem formulário de qualificação', async () => {
  whatsappApi.get.mockResolvedValue({ data: {} }); whatsappApi.post.mockResolvedValue({});
  const blocked = jest.fn();
  render(<CrmWhatsAppOptOut lead={{ id: 9 }} onBlocked={blocked} />);
  await waitFor(() => expect(whatsappApi.get).toHaveBeenCalledWith('/leads/9'));
  fireEvent.click(screen.getByText('Não contatar pelo WhatsApp'));
  await screen.findByText('Não contatar pelo WhatsApp: bloqueio registrado.');
  expect(whatsappApi.post).toHaveBeenCalledWith('/leads/9/opt-out');
  expect(blocked).toHaveBeenCalledWith(true);
});
