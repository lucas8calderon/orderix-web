import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrmBoard } from './CrmBoard';
import { getCurrentUser } from '../../../services/session';
import { getCrmLeads, getInstagramFollowUpSettings } from './service/crmService';

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
  openCrmWhatsApp: jest.fn(),
  confirmCrmWhatsApp: jest.fn(),
  createCrmLead: jest.fn(),
  moveInstagramLead: jest.fn(),
  updateInstagramLeadProfile: jest.fn(),
}));

const leads = [
  {
    id: 1,
    businessName: 'Burger Campinas',
    city: 'Campinas',
    businessType: 'HAMBURGER',
    status: 'NEW',
    leadKind: 'ESTABLISHMENT',
    createdAt: '2026-11-01T12:00:00',
  },
  {
    id: 2,
    businessName: 'Pizza Santos',
    city: 'Santos',
    businessType: 'PIZZA',
    status: 'NEW',
    leadKind: 'ESTABLISHMENT',
    createdAt: '2026-11-02T12:00:00',
  },
];

describe('CrmBoard filtros de cidade e tipo', () => {
  beforeEach(() => {
    getCurrentUser.mockReturnValue({ role: 'CRM_OPERATOR', name: 'Operador' });
    getCrmLeads.mockResolvedValue({ data: leads });
    getInstagramFollowUpSettings.mockResolvedValue({ data: null });
  });

  test('operador filtra por cidade e limpa sem ganhar ações de admin', async () => {
    render(<CrmBoard />);

    expect(await screen.findByText('Burger Campinas')).toBeInTheDocument();
    expect(screen.getByText('Pizza Santos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Prospectar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cadastrar lead' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Cidade'));
    await userEvent.click(await screen.findByRole('option', { name: 'Campinas' }));

    expect(screen.getByText('Burger Campinas')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Santos')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpar cidade e tipo' }));

    expect(screen.getByText('Burger Campinas')).toBeInTheDocument();
    expect(screen.getByText('Pizza Santos')).toBeInTheDocument();
  });

  test('tipo de estabelecimento combina com a busca', async () => {
    render(<CrmBoard />);
    expect(await screen.findByText('Pizza Santos')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Tipo de estabelecimento'));
    await userEvent.click(await screen.findByRole('option', { name: 'Pizzaria' }));
    await userEvent.type(screen.getByLabelText('Nome, telefone ou Instagram'), 'santos');

    expect(screen.getByText('Pizza Santos')).toBeInTheDocument();
    expect(screen.queryByText('Burger Campinas')).not.toBeInTheDocument();
  });
});
