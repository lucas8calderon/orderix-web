import { cepDigits, formatCepInput } from '../utils/cepInput';

const VIA_CEP_URL = 'https://viacep.com.br/ws';
const cache = new Map();

export const CEP_NOT_FOUND = 'CEP_NOT_FOUND';
export const CEP_LOOKUP_FAILED = 'CEP_LOOKUP_FAILED';
export const CEP_INVALID = 'CEP_INVALID';

function mapViaCep(data, fallbackCep) {
  return {
    postalCode: formatCepInput(data.cep || fallbackCep),
    street: String(data.logradouro || '').trim(),
    neighborhood: String(data.bairro || '').trim(),
    city: String(data.localidade || '').trim(),
    state: String(data.uf || '').trim().toUpperCase(),
  };
}

export async function lookupCep(raw, { signal } = {}) {
  const cep = cepDigits(raw);
  if (cep.length !== 8) {
    const error = new Error(CEP_INVALID);
    error.code = CEP_INVALID;
    throw error;
  }

  if (cache.has(cep)) {
    const cached = cache.get(cep);
    if (cached.error) {
      const error = new Error(cached.error);
      error.code = cached.error;
      throw error;
    }
    return cached.value;
  }

  let response;
  try {
    response = await fetch(`${VIA_CEP_URL}/${cep}/json/`, { signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    const error = new Error(CEP_LOOKUP_FAILED);
    error.code = CEP_LOOKUP_FAILED;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(CEP_LOOKUP_FAILED);
    error.code = CEP_LOOKUP_FAILED;
    throw error;
  }

  const data = await response.json();
  if (data?.erro) {
    cache.set(cep, { error: CEP_NOT_FOUND });
    const error = new Error(CEP_NOT_FOUND);
    error.code = CEP_NOT_FOUND;
    throw error;
  }

  const value = mapViaCep(data, cep);
  cache.set(cep, { value });
  return value;
}

export function clearViaCepCache() {
  cache.clear();
}
