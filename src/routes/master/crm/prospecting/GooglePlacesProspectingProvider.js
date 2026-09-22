import { createProspectingClient } from './LeadProspectingProvider';
import { searchCrmProspecting } from '../service/crmService';

export const GOOGLE_PLACES_PROVIDER_ID = 'google-places';

export const googlePlacesProspectingProvider = {
  id: GOOGLE_PLACES_PROVIDER_ID,
  available: false,
  search(criteria = {}) {
    return searchCrmProspecting({
      provider: GOOGLE_PLACES_PROVIDER_ID,
      businessType: criteria.businessType || undefined,
      region: criteria.region || undefined,
      limit: criteria.limit ? Number(criteria.limit) : undefined,
    }).then((response) => response.data);
  },
};

export function createGooglePlacesProspectingClient() {
  return createProspectingClient(googlePlacesProspectingProvider);
}
