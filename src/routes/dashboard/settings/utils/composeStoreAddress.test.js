import { composeStoreAddress, storeAddressFromParts } from './composeStoreAddress';

describe('composeStoreAddress', () => {
  it('monta o texto da loja com rua, número, bairro, cidade e UF', () => {
    expect(composeStoreAddress({
      street: 'Avenida Paulista',
      number: '1148',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'sp',
    })).toBe('Avenida Paulista, 1148, Bela Vista, São Paulo - SP');
  });

  it('não grava endereço sem rua e número', () => {
    expect(composeStoreAddress({ street: 'Rua A', number: '  ' })).toBe('');
    expect(composeStoreAddress({ street: '', number: '10', city: 'São Paulo' })).toBe('');
    expect(storeAddressFromParts({ street: 'Rua A' })).toBe('');
  });
});
