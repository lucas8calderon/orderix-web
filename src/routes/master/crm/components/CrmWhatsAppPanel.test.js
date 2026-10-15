import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CrmWhatsAppPanel } from './CrmWhatsAppPanel';
import { whatsappApi } from '../whatsappTemplate';
jest.mock('../whatsappTemplate', () => ({ whatsappApi: { get: jest.fn(), post: jest.fn(), put: jest.fn() }, openWhatsAppLead: jest.fn() }));
test('exige confirmação explícita antes de registrar envio', async () => {
  whatsappApi.get.mockImplementation(path => Promise.resolve({ data: path === '/template' ? { message: 'Parceria gratuita' } : { day: '2026-10-15', allocated: 1, confirmed: 0, items: [{ id: 1, lead_id: 9, state: 'OPENED', message: 'Parceria gratuita' }] } }));
  whatsappApi.post.mockResolvedValue({});
  const changed = jest.fn().mockResolvedValue();
  render(<CrmWhatsAppPanel onChanged={changed} onOpenLead={jest.fn()} />);
  await screen.findByText(/Link aberto — envio não confirmado/);
  fireEvent.click(screen.getByText('Confirmar envio'));
  expect(whatsappApi.post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Sim, enviei'));
  await waitFor(() => expect(whatsappApi.post).toHaveBeenCalledWith('/leads/9/confirm'));
  await waitFor(() => expect(changed).toHaveBeenCalled());
});
