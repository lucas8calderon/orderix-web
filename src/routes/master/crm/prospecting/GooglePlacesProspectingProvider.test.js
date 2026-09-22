import { createProspectingClient } from './LeadProspectingProvider';
import { GOOGLE_PLACES_PROVIDER_ID, googlePlacesProspectingProvider } from './GooglePlacesProspectingProvider';
import { getCrmProspectingUsage, importCrmProspecting, searchCrmProspecting } from '../service/crmService';

jest.mock('../service/crmService', () => ({
  searchCrmProspecting: jest.fn(),
  importCrmProspecting: jest.fn(),
  getCrmProspectingUsage: jest.fn(),
}));

describe('prospecção', () => {
  it('mantém o CRM desacoplado do Google Places', () => {
    const client = createProspectingClient(googlePlacesProspectingProvider);
    expect(client.id).toBe(GOOGLE_PLACES_PROVIDER_ID);
    expect(typeof client.search).toBe('function');
    expect(typeof client.importPlaces).toBe('function');
    expect(typeof client.usage).toBe('function');
  });

  it('encaminha busca e importação para o backend', async () => {
    searchCrmProspecting.mockResolvedValue({
      data: { available: true, results: [{ externalId: 'ChIJ1', name: 'Minions Burger' }] },
    });
    importCrmProspecting.mockResolvedValue({
      data: { imported: 1, duplicates: 0, failed: 0, items: [] },
    });
    getCrmProspectingUsage.mockResolvedValue({
      data: { searchUsed: 1, searchLimit: 500, detailsUsed: 0, detailsLimit: 500 },
    });

    const search = await googlePlacesProspectingProvider.search({
      businessType: 'HAMBURGER',
      region: 'São José dos Campos - SP',
      limit: 20,
    });
    expect(search.results).toHaveLength(1);
    expect(searchCrmProspecting).toHaveBeenCalledWith({
      provider: 'google-places',
      businessType: 'HAMBURGER',
      region: 'São José dos Campos - SP',
      limit: 20,
    });

    await googlePlacesProspectingProvider.importPlaces({
      businessType: 'HAMBURGER',
      places: [{ externalId: 'ChIJ1', name: 'Minions Burger' }],
    });
    expect(importCrmProspecting).toHaveBeenCalledWith({
      businessType: 'HAMBURGER',
      places: [{ externalId: 'ChIJ1', name: 'Minions Burger' }],
      placeIds: undefined,
    });
  });
});
