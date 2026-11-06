import { readServiceAddress, writeServiceAddress } from './serviceAddress';

describe('service address', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('guarda bairro fora da lista no modo entregar em todos os bairros', () => {
    writeServiceAddress('padaria', {
      openArea: true,
      neighborhood: 'Jardim Europa',
      neighborhoodId: null,
      city: 'Campinas',
      state: 'SP',
      effectiveFee: 10,
    });
    expect(readServiceAddress('padaria')).toEqual(expect.objectContaining({
      neighborhood: 'Jardim Europa',
      openArea: true,
      effectiveFee: 10,
    }));
  });

  it('ignora endereço sem bairro da lista nos outros modos', () => {
    writeServiceAddress('padaria', {
      neighborhood: 'Jardim Europa',
      city: 'Campinas',
    });
    expect(readServiceAddress('padaria')).toBeNull();
  });
});
