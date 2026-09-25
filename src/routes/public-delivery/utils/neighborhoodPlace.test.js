import {
  deliveryCoverageLabel,
  effectiveNeighborhoodFee,
  matchNeighborhood,
  moneyCents,
  placeKey,
  selectionStillValid,
} from './neighborhoodPlace';

describe('neighborhood place matching', () => {
  const list = [
    { id: 1, name: 'Bela Vista', city: 'São Paulo', state: 'SP', effectiveFee: 6 },
    { id: 2, name: 'Centro', city: 'São Paulo', state: 'SP', effectiveFee: 0 },
  ];

  it('pré-seleciona quando o ViaCEP corresponde, ignorando acento e caixa', () => {
    expect(matchNeighborhood(list, '  bela   vista ')).toEqual(list[0]);
    expect(matchNeighborhood(list, 'São Paulo')).toBeNull();
  });

  it('não bloqueia ViaCEP diferente ou vazio', () => {
    expect(matchNeighborhood(list, 'Jardins')).toBeNull();
    expect(matchNeighborhood(list, '')).toBeNull();
    expect(matchNeighborhood(list, null)).toBeNull();
  });

  it('invalida o bairro quando a lista da cidade deixa de contê-lo', () => {
    expect(selectionStillValid(list, 1)).toBe(true);
    expect(selectionStillValid([{ id: 9, name: 'Centro' }], 1)).toBe(false);
    expect(selectionStillValid(list, '')).toBe(false);
  });

  it('trata São José e Sao Jose como o mesmo lugar', () => {
    expect(placeKey('São José')).toBe(placeKey('sao jose'));
  });
});

describe('effective neighborhood fee', () => {
  it('usa a taxa cadastrada, zera o selecionado e zera todos sem apagar o cadastro', () => {
    expect(effectiveNeighborhoodFee('PER_NEIGHBORHOOD', 8.5, false)).toBe(8.5);
    expect(effectiveNeighborhoodFee('FREE_SELECTED', 8.5, true)).toBe(0);
    expect(effectiveNeighborhoodFee('FREE_SELECTED', 8.5, false)).toBe(8.5);
    expect(effectiveNeighborhoodFee('FREE_ALL', 8.5, false)).toBe(0);
    expect(moneyCents(8.5)).toBe(850);
  });
});

describe('delivery coverage label', () => {
  const format = (value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`;

  it('mostra taxa ou entrega grátis', () => {
    expect(deliveryCoverageLabel('Centro', 8.5, format)).toBe(
      'Entregamos em Centro • Taxa de entrega: R$ 8,50'
    );
    expect(deliveryCoverageLabel('Centro', 0, format)).toBe(
      'Entregamos em Centro • Entrega grátis'
    );
  });
});
