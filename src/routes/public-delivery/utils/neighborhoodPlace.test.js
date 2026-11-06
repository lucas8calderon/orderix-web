import {
  allNeighborhoodsFeeLabel,
  deliveryCoverageLabel,
  effectiveNeighborhoodFee,
  hasServiceNeighborhood,
  matchNeighborhood,
  moneyCents,
  placeKey,
  selectionStillValid,
  servesAllNeighborhoods,
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
    expect(effectiveNeighborhoodFee('ALL_NEIGHBORHOODS', 8.5, true, 10)).toBe(10);
    expect(effectiveNeighborhoodFee('ALL_NEIGHBORHOODS', 8.5, false, 0)).toBe(0);
    expect(moneyCents(8.5)).toBe(850);
  });
});

describe('entrega em todos os bairros', () => {
  it('reconhece o modo e aceita bairro fora da lista só nele', () => {
    const open = { feeMode: 'ALL_NEIGHBORHOODS', allNeighborhoodsFee: 10 };
    expect(servesAllNeighborhoods(open)).toBe(true);
    expect(servesAllNeighborhoods({ feeMode: 'FREE_ALL' })).toBe(false);
    expect(hasServiceNeighborhood(open, { neighborhood: 'Jardim Europa' })).toBe(true);
    expect(hasServiceNeighborhood(open, { neighborhood: '  ' })).toBe(false);
    expect(hasServiceNeighborhood({ feeMode: 'PER_NEIGHBORHOOD' }, { neighborhood: 'Jardim Europa' })).toBe(false);
    expect(hasServiceNeighborhood({ feeMode: 'FREE_ALL' }, { neighborhoodId: 4 })).toBe(true);
  });

  it('mostra a taxa única ou entrega grátis', () => {
    const format = (value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    expect(allNeighborhoodsFeeLabel(10, format)).toBe(
      'Entregamos em qualquer bairro. Taxa de entrega: R$ 10,00.'
    );
    expect(allNeighborhoodsFeeLabel(0, format)).toBe(
      'Entregamos em qualquer bairro. A entrega é grátis.'
    );
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
