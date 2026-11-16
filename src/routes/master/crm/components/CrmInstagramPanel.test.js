import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CrmInstagramPanel } from './CrmInstagramPanel';
import { getCrmInstagramTemplates, updateCrmInstagramTemplates } from '../service/crmService';

jest.mock('../service/crmService', () => ({
  getCrmInstagramTemplates: jest.fn(),
  updateCrmInstagramTemplates: jest.fn(),
}));

test('salva os dois modelos sem chamar o WhatsApp', async () => {
  getCrmInstagramTemplates.mockResolvedValue({
    data: {
      establishmentMessage: 'Comercial',
      influencerMessage: 'Parceria',
      variablesHint: 'Use {{nome}}',
    },
  });
  updateCrmInstagramTemplates.mockResolvedValue({
    data: { establishmentMessage: 'Comercial nova', influencerMessage: 'Parceria' },
  });

  render(<CrmInstagramPanel />);
  const field = await screen.findByDisplayValue('Comercial');
  fireEvent.change(field, { target: { value: 'Comercial nova' } });
  fireEvent.click(screen.getByRole('button', { name: 'Salvar modelos' }));

  await waitFor(() => expect(updateCrmInstagramTemplates).toHaveBeenCalledWith({
    establishmentMessage: 'Comercial nova',
    influencerMessage: 'Parceria',
  }));
  expect(await screen.findByText(/O WhatsApp não foi alterado/)).toBeInTheDocument();
});
