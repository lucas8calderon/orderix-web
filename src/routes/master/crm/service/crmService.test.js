import axios from 'axios';
import { changeCrmLeadStatus, getCrmLeads, getCrmLeadsPage, searchCrmProspecting } from './crmService';

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

  it('consulta o provedor de prospecção sem inventar resultados', () => {
    axios.post.mockResolvedValue({
      data: { available: false, message: 'Integração de prospecção em preparação.', results: [] },
    });
    searchCrmProspecting({ provider: 'google-places', region: 'São José dos Campos - SP', limit: 20 });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/crm\/prospecting\/search$/),
      { provider: 'google-places', region: 'São José dos Campos - SP', limit: 20 }
    );
  });
});
