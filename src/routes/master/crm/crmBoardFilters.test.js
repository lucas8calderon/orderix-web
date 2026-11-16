import {
  clearLocationFilters,
  distinctBusinessTypes,
  distinctCities,
  filterBoardLeads,
} from './crmBoardFilters';

const leads = [
  {
    id: 1,
    businessName: 'Burger Campinas',
    city: 'Campinas',
    businessType: 'HAMBURGER',
    phone: '11911111111',
    instagramUsername: 'burgercampinas',
    status: 'NEW',
    leadKind: 'ESTABLISHMENT',
  },
  {
    id: 2,
    businessName: 'Pizza Santos',
    city: 'Santos',
    businessType: 'PIZZA',
    phone: '13922222222',
    status: 'NEW',
    leadKind: 'ESTABLISHMENT',
  },
  {
    id: 3,
    businessName: 'Café Campinas',
    city: 'campinas',
    businessType: 'COFFEE_SHOP',
    phone: '11933333333',
    status: 'CONTACTED',
    leadKind: 'ESTABLISHMENT',
  },
  {
    id: 4,
    businessName: 'Sem local',
    city: '  ',
    businessType: '',
    status: 'NEW',
    leadKind: 'ESTABLISHMENT',
  },
];

describe('filtros do quadro de CRM', () => {
  test('filtra por cidade, sem diferenciar maiúsculas', () => {
    const visible = filterBoardLeads(leads, { city: 'Campinas' });
    expect(visible.map((lead) => lead.id)).toEqual([1, 3]);
  });

  test('filtra por tipo de estabelecimento', () => {
    const visible = filterBoardLeads(leads, { businessType: 'PIZZA' });
    expect(visible.map((lead) => lead.id)).toEqual([2]);
  });

  test('cidade, tipo e busca se combinam', () => {
    const visible = filterBoardLeads(leads, {
      city: 'Campinas',
      businessType: 'HAMBURGER',
      q: 'burger',
    });
    expect(visible.map((lead) => lead.id)).toEqual([1]);
  });

  test('limpar cidade e tipo devolve os leads da busca restante', () => {
    const filters = { q: 'campinas', city: 'Santos', businessType: 'PIZZA', kind: 'ESTABLISHMENT' };
    const cleared = clearLocationFilters(filters);
    expect(cleared).toEqual({ q: 'campinas', city: '', businessType: '', kind: 'ESTABLISHMENT' });
    expect(filterBoardLeads(leads, cleared).map((lead) => lead.id)).toEqual([1, 3]);
  });

  test('opções saem dos leads visíveis e o vazio não inventa cidade nem tipo', () => {
    expect(distinctCities(leads)).toEqual(['Campinas', 'Santos']);
    expect(distinctBusinessTypes(leads).map((item) => item.id)).toEqual([
      'COFFEE_SHOP',
      'HAMBURGER',
      'PIZZA',
    ]);
    expect(distinctCities([])).toEqual([]);
    expect(distinctBusinessTypes([])).toEqual([]);
    expect(distinctCities([{ city: '   ' }])).toEqual([]);
    expect(distinctBusinessTypes([{ businessType: '' }])).toEqual([]);
  });
});
