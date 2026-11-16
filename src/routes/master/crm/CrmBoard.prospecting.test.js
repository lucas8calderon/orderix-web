import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrmBoard } from './CrmBoard';
import { getCurrentUser } from '../../../services/session';
import { getCrmLeads, getCrmProspectingUsage, getInstagramFollowUpSettings } from './service/crmService';

jest.mock('../../../services/session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('../../../commons/hooks/useResponsive', () => ({
  useDialogResponsiveProps: () => ({}),
}));

jest.mock('./service/crmService', () => ({
  getCrmLeads: jest.fn(),
  getInstagramFollowUpSettings: jest.fn(),
  getCrmProspectingUsage: jest.fn(),
  searchCrmProspecting: jest.fn(),
  importCrmProspecting: jest.fn(),
  getCrmLead: jest.fn(),
  getCrmLeadActivities: jest.fn(),
  getInstagramLeadMessage: jest.fn(),
}));

describe('CrmBoard prospectar', () => {
  beforeEach(() => {
    getCrmLeads.mockResolvedValue({ data: [] });
    getInstagramFollowUpSettings.mockResolvedValue({ data: null });
    getCrmProspectingUsage.mockResolvedValue({
      data: {
        configured: true,
        searchUsed: 0,
        searchLimit: 500,
        searchPercent: 0,
        detailsUsed: 0,
        detailsLimit: 500,
        detailsPercent: 0,
        maxResults: 20,
        periodLabel: 'Novembro/2026',
        renewsOn: '2026-12-01',
      },
    });
  });

  test('administrador vê Prospectar e abre a busca do Google Places', async () => {
    getCurrentUser.mockReturnValue({ role: 'MASTER', name: 'Admin' });
    render(<CrmBoard />);

    const button = await screen.findByRole('button', { name: 'Prospectar' });
    await userEvent.click(button);

    expect(await screen.findByText('Encontrar potenciais clientes')).toBeInTheDocument();
    expect(await screen.findByText('Uso Google Places')).toBeInTheDocument();
  });

  test('parceiro não vê a busca do Google Places', async () => {
    getCurrentUser.mockReturnValue({ role: 'PARTNER', status: 'ACTIVE', name: 'Ana' });
    render(<CrmBoard />);

    expect(await screen.findByText('Nenhum lead no CRM ainda.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Prospectar' })).not.toBeInTheDocument();
  });

  test('operador não vê a busca nem o cadastro de leads', async () => {
    getCurrentUser.mockReturnValue({ role: 'CRM_OPERATOR', name: 'Operador' });
    render(<CrmBoard />);

    expect(await screen.findByText('Nenhum lead no CRM ainda.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Prospectar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cadastrar lead' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Templates' })).not.toBeInTheDocument();
  });
});
