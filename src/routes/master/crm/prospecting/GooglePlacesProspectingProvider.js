import { createProspectingClient } from './LeadProspectingProvider';
import { getCrmProspectingUsage, importCrmProspecting, searchCrmProspecting } from '../service/crmService';

export const GOOGLE_PLACES_PROVIDER_ID = 'google-places';

export const googlePlacesProspectingProvider = {
  id: GOOGLE_PLACES_PROVIDER_ID,
  available: true,
  search(criteria = {}) {
    return searchCrmProspecting({
      provider: GOOGLE_PLACES_PROVIDER_ID,
      businessType: criteria.businessType || undefined,
      region: criteria.region || criteria.location || undefined,
      limit: criteria.limit ? Number(criteria.limit) : undefined,
    }).then((response) => response.data);
  },
  importPlaces(payload = {}) {
    return importCrmProspecting({
      businessType: payload.businessType,
      places: payload.places,
      placeIds: payload.placeIds,
    }).then((response) => response.data);
  },
  usage() {
    return getCrmProspectingUsage().then((response) => response.data);
  },
};

export function createGooglePlacesProspectingClient() {
  return createProspectingClient(googlePlacesProspectingProvider);
}
