const MAX_STORE_ADDRESS = 512;

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Monta o texto único que o delivery já grava como endereço da loja.
 * Não inclui coordenada.
 */
export function composeStoreAddress(parts = {}) {
  const street = clean(parts.street);
  const number = clean(parts.number);
  if (!street || !number) return '';
  const neighborhood = clean(parts.neighborhood);
  const city = clean(parts.city);
  const state = clean(parts.state).toUpperCase();
  const cityLine = [city, state].filter(Boolean).join(' - ');
  return [`${street}, ${number}`, neighborhood, cityLine].filter(Boolean).join(', ');
}

export function storeAddressFromParts(parts) {
  const composed = composeStoreAddress(parts);
  if (!composed) return '';
  return composed.length <= MAX_STORE_ADDRESS
    ? composed
    : composed.slice(0, MAX_STORE_ADDRESS).trim();
}
