import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrmProspectingDialog } from './CrmProspectingDialog';
import { getCrmProspectingUsage, importCrmProspecting, searchCrmProspecting } from '../service/crmService';

jest.mock('../service/crmService', () => ({
  searchCrmProspecting: jest.fn(),
  importCrmProspecting: jest.fn(),
  getCrmProspectingUsage: jest.fn(),
}));

jest.mock('../../../../commons/hooks/useResponsive', () => ({
  useDialogResponsiveProps: () => ({}),
}));

const usage = {
  configured: true,
  searchUsed: 137,
  searchLimit: 500,
  searchPercent: 27,
  detailsUsed: 83,
  detailsLimit: 500,
  detailsPercent: 17,
  maxResults: 20,
  periodLabel: 'Setembro/2026',
  renewsOn: '2026-10-01',
};

describe('CrmProspectingDialog', () => {
  beforeEach(() => {
    getCrmProspectingUsage.mockResolvedValue({ data: usage });
    searchCrmProspecting.mockReset();
    importCrmProspecting.mockReset();
  });

  it('mostra consumo e permite selecionar apenas estabelecimentos novos', async () => {
    searchCrmProspecting.mockResolvedValue({
      data: {
        available: true,
        foundCount: 2,
        newCount: 1,
        existingCount: 1,
        results: [
          {
            externalId: 'ChIJ-new',
            name: 'Minions Burger',
            address: 'Av. Exemplo, 123',
            city: 'São José dos Campos',
            state: 'SP',
            existingInCrm: false,
          },
          {
            externalId: 'ChIJ-old',
            name: 'Burger House',
            address: 'Rua B, 10',
            city: 'São José dos Campos',
            state: 'SP',
            existingInCrm: true,
            leadId: 9,
            status: 'CONTACTED',
            statusLabel: 'Contatado',
          },
        ],
      },
    });
    importCrmProspecting.mockResolvedValue({
      data: {
        imported: 1,
        duplicates: 0,
        failed: 0,
        items: [{
          externalId: 'ChIJ-new',
          outcome: 'IMPORTED',
          leadId: 31,
          name: 'Minions Burger',
          lead: {
            id: 31,
            businessName: 'Minions Burger',
            phone: '5512988880001',
            whatsAppUrl: 'https://wa.me/5512988880001?text=Oi',
            instagram: '@minionsburger',
          },
        }],
      },
    });

    const onImported = jest.fn();
    render(<CrmProspectingDialog open onClose={() => {}} onImported={onImported} />);

    await screen.findByText('Uso Google Places');
    expect(await screen.findByText('137 / 500')).toBeInTheDocument();
    expect(screen.getByText('83 / 500')).toBeInTheDocument();
    expect(screen.getByText(/Setembro\/2026/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Buscar estabelecimentos' }));
    expect(await screen.findByText('Minions Burger')).toBeInTheDocument();
    expect(screen.getByText('Já está no CRM')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Selecionar Burger House' })).toBeDisabled();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Selecionar Minions Burger' }));
    await userEvent.click(screen.getByRole('button', { name: 'Buscar telefone e adicionar' }));

    await waitFor(() => expect(importCrmProspecting).toHaveBeenCalledTimes(1));
    expect(importCrmProspecting.mock.calls[0][0].places).toEqual([
      expect.objectContaining({ externalId: 'ChIJ-new', name: 'Minions Burger' }),
    ]);
    expect(searchCrmProspecting).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onImported).toHaveBeenCalled());
    expect(await screen.findByText('Pronto para contato')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir no WhatsApp' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Abrir no Instagram' })).toBeInTheDocument();
  });

  it('mostra empty state sem disparar outra busca', async () => {
    searchCrmProspecting.mockResolvedValue({
      data: { available: true, results: [], foundCount: 0, message: 'Nenhum estabelecimento encontrado.' },
    });
    render(<CrmProspectingDialog open onClose={() => {}} />);
    await screen.findByText('Uso Google Places');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar estabelecimentos' }));
    expect(await screen.findByText('Nenhum estabelecimento encontrado')).toBeInTheDocument();
    expect(screen.getByText('Tente alterar o segmento ou a região.')).toBeInTheDocument();
    expect(searchCrmProspecting).toHaveBeenCalledTimes(1);
  });
});
