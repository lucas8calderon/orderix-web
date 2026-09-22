import { createProspectingClient } from './LeadProspectingProvider';
import { GOOGLE_PLACES_PROVIDER_ID, googlePlacesProspectingProvider } from './GooglePlacesProspectingProvider';
import { searchCrmProspecting } from '../service/crmService';

jest.mock('../service/crmService', () => ({
  searchCrmProspecting: jest.fn(),
}));

describe('prospecção', () => {
  it('mantém o CRM desacoplado do Google Places', () => {
    const client = createProspectingClient(googlePlacesProspectingProvider);
    expect(client.id).toBe(GOOGLE_PLACES_PROVIDER_ID);
    expect(client.available).toBe(false);
  });

  it('encaminha a busca para o backend sem simular estabelecimentos', async () => {
    searchCrmProspecting.mockResolvedValue({
      data: { available: false, message: 'Integração de prospecção em preparação.', results: [] },
    });
    const result = await googlePlacesProspectingProvider.search({
      businessType: 'HAMBURGER',
      region: 'São José dos Campos - SP',
      limit: 20,
    });
    expect(result.results).toEqual([]);
    expect(result.available).toBe(false);
    expect(searchCrmProspecting).toHaveBeenCalledWith({
      provider: 'google-places',
      businessType: 'HAMBURGER',
      region: 'São José dos Campos - SP',
      limit: 20,
    });
  });
});
