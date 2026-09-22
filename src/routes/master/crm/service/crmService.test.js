import axios from 'axios';
import { changeCrmLeadStatus, getCrmLeads, getCrmLeadsPage, getCrmProspectingUsage, importCrmProspecting, searchCrmProspecting } from './crmService';

jest.mock('axios');

describe('crmService', () => {
  it('omite filtros vazios na listagem', () => {
    axios.get.mockResolvedValue({ data: [] });
    getCrmLeads({ q: 'minions', status: '', city: undefined });
    expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/crm\/leads$/), {
      params: { q: 'minions' },
    });
  });

  it('lista leads paginados na visualização tabela', () => {
    axios.get.mockResolvedValue({ data: { items: [], total: 0, page: 0, size: 25 } });
    getCrmLeadsPage({ q: 'minions', page: 1, size: 25, sort: 'businessName,asc' });
    expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/crm\/lead-pages$/), {
      params: { q: 'minions', page: 1, size: 25, sort: 'businessName,asc' },
    });
  });

  it('altera status via PATCH', () => {
    axios.patch.mockResolvedValue({ data: { id: 1, status: 'INTERESTED' } });
    changeCrmLeadStatus(1, 'INTERESTED');
    expect(axios.patch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/crm\/leads\/1\/status$/),
      { status: 'INTERESTED', reason: undefined }
    );
  });

  it('consulta o provedor de prospecção no backend', () => {
    axios.post.mockResolvedValue({
      data: { available: true, results: [] },
    });
    searchCrmProspecting({ provider: 'google-places', region: 'São José dos Campos - SP', limit: 20 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/crm\/prospecting\/search$/),
      { provider: 'google-places', region: 'São José dos Campos - SP', limit: 20 }
    );
  });

  it('importa e consulta consumo via backend', () => {
    axios.post.mockResolvedValue({ data: { imported: 1 } });
    axios.get.mockResolvedValue({ data: { searchUsed: 1, searchLimit: 500 } });
    importCrmProspecting({ businessType: 'HAMBURGER', places: [{ externalId: 'ChIJ1', name: 'Minions Burger' }] });
    getCrmProspectingUsage();
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/crm\/prospecting\/import$/),
      { businessType: 'HAMBURGER', places: [{ externalId: 'ChIJ1', name: 'Minions Burger' }] }
    );
    expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/crm\/prospecting\/usage$/));
  });
});
