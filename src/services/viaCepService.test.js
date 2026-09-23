import { CEP_LOOKUP_FAILED, CEP_NOT_FOUND, clearViaCepCache, lookupCep } from './viaCepService';

describe('viaCepService', () => {
  beforeEach(() => {
    clearViaCepCache();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('preenche endereço a partir da ViaCEP', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'sp',
        erro: false,
      }),
    });

    await expect(lookupCep('01310-100')).resolves.toEqual({
      postalCode: '01310-100',
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    });
    expect(fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/', { signal: undefined });
  });

  it('sinaliza CEP inexistente', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ erro: true }),
    });

    await expect(lookupCep('00000000')).rejects.toMatchObject({ code: CEP_NOT_FOUND });
  });

  it('sinaliza falha de rede', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(lookupCep('01310100')).rejects.toMatchObject({ code: CEP_LOOKUP_FAILED });
  });

  it('reusa o cache na segunda consulta do mesmo CEP', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      }),
    });

    await lookupCep('01310100');
    await lookupCep('01310-100');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
