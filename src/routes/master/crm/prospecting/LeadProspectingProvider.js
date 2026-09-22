/** Contrato de fonte de estabelecimentos para o CRM. */
export function createProspectingClient(provider) {
  if (!provider || typeof provider.search !== 'function') {
    throw new Error('LeadProspectingProvider inválido.');
  }
  return {
    id: provider.id,
    available: Boolean(provider.available),
    search: (criteria) => provider.search(criteria),
    importPlaces: provider.importPlaces
      ? (payload) => provider.importPlaces(payload)
      : async () => ({ imported: 0, duplicates: 0, failed: 0, items: [] }),
    usage: provider.usage
      ? () => provider.usage()
      : async () => null,
  };
}
