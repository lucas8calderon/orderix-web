import {
  applyKitchenFilterClick,
  createKitchenFilterState,
  filterKitchenOrders,
  kitchenFilterSelection,
  KITCHEN_LATE_AFTER_MS,
} from './kitchenFilters';

function order(partial) {
  return {
    status: 'novo',
    createdAt: new Date(0),
    ...partial,
  };
}

const now = Date.parse('2026-10-27T15:00:00.000Z');

function atMinutesAgo(minutes) {
  return new Date(now - minutes * 60 * 1000);
}

const orders = [
  order({ id: 1, orderType: 'mesa', createdAt: atMinutesAgo(5) }),
  order({ id: 2, orderType: 'comanda', createdAt: atMinutesAgo(5) }),
  order({ id: 3, orderType: 'delivery', createdAt: atMinutesAgo(5) }),
  order({ id: 4, orderType: 'balcao', createdAt: atMinutesAgo(5) }),
  order({ id: 5, orderType: 'mesa', createdAt: atMinutesAgo(25) }),
  order({ id: 6, orderType: 'balcao', status: 'em_producao', createdAt: atMinutesAgo(30) }),
  order({ id: 7, orderType: 'mesa', status: 'feito', createdAt: atMinutesAgo(40) }),
];

function ids(list) {
  return list.map((item) => item.id);
}

describe('filtros da cozinha', () => {
  const todos = createKitchenFilterState();

  it('um canal mostra só esse canal', () => {
    const mesa = applyKitchenFilterClick(todos, ['todos', 'mesa']);
    expect(kitchenFilterSelection(mesa)).toEqual(['mesa']);
    expect(ids(filterKitchenOrders(orders, mesa, now))).toEqual([1, 5, 7]);
  });

  it('dois canais mostram a união e desmarcar um deixa o outro', () => {
    const mesa = applyKitchenFilterClick(todos, ['todos', 'mesa']);
    const both = applyKitchenFilterClick(mesa, ['mesa', 'comanda']);
    expect(kitchenFilterSelection(both)).toEqual(['mesa', 'comanda']);
    expect(ids(filterKitchenOrders(orders, both, now))).toEqual([1, 2, 5, 7]);

    const onlyComanda = applyKitchenFilterClick(both, ['comanda']);
    expect(kitchenFilterSelection(onlyComanda)).toEqual(['comanda']);
    expect(ids(filterKitchenOrders(orders, onlyComanda, now))).toEqual([2]);
  });

  it('Todos limpa os canais e também o filtro de atraso', () => {
    const mesa = applyKitchenFilterClick(todos, ['todos', 'mesa']);
    const withLate = applyKitchenFilterClick(mesa, ['mesa', 'atrasados']);
    const all = applyKitchenFilterClick(withLate, ['mesa', 'atrasados', 'todos']);
    expect(all).toEqual({ channels: [], lateOnly: false });
    expect(kitchenFilterSelection(all)).toEqual(['todos']);
    expect(ids(filterKitchenOrders(orders, all, now))).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('desmarcar o último canal volta para Todos', () => {
    const mesa = applyKitchenFilterClick(todos, ['todos', 'mesa']);
    const comanda = applyKitchenFilterClick(mesa, ['mesa', 'comanda']);
    const onlyMesa = applyKitchenFilterClick(comanda, ['mesa']);
    const cleared = applyKitchenFilterClick(onlyMesa, []);
    expect(cleared).toEqual({ channels: [], lateOnly: false });
    expect(kitchenFilterSelection(cleared)).toEqual(['todos']);
    expect(ids(filterKitchenOrders(orders, cleared, now))).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('Atrasados combina com canais e pode ficar sozinho', () => {
    const late = applyKitchenFilterClick(todos, ['todos', 'atrasados']);
    expect(late).toEqual({ channels: [], lateOnly: true });
    expect(kitchenFilterSelection(late)).toEqual(['atrasados']);
    expect(ids(filterKitchenOrders(orders, late, now))).toEqual([5, 6]);

    const lateMesa = applyKitchenFilterClick(late, ['atrasados', 'mesa']);
    const lateMesaBalcao = applyKitchenFilterClick(lateMesa, ['mesa', 'atrasados', 'balcao']);
    expect(lateMesaBalcao).toEqual({ channels: ['mesa', 'balcao'], lateOnly: true });
    expect(kitchenFilterSelection(lateMesaBalcao)).toEqual(['mesa', 'balcao', 'atrasados']);
    expect(ids(filterKitchenOrders(orders, lateMesaBalcao, now))).toEqual([5, 6]);

    const withoutMesa = applyKitchenFilterClick(lateMesaBalcao, ['balcao', 'atrasados']);
    expect(withoutMesa).toEqual({ channels: ['balcao'], lateOnly: true });
    const lateOnlyAgain = applyKitchenFilterClick(withoutMesa, ['atrasados']);
    expect(lateOnlyAgain).toEqual({ channels: [], lateOnly: true });
    expect(kitchenFilterSelection(lateOnlyAgain)).toEqual(['atrasados']);
    expect(ids(filterKitchenOrders(orders, lateOnlyAgain, now))).toEqual([5, 6]);
  });

  it('mantém o limite de 20 minutos só para Novo e Em Produção', () => {
    const late = { channels: ['delivery'], lateOnly: true };
    const boundary = order({
      id: 8,
      orderType: 'delivery',
      createdAt: new Date(now - KITCHEN_LATE_AFTER_MS),
    });
    const recent = order({
      id: 9,
      orderType: 'delivery',
      createdAt: new Date(now - KITCHEN_LATE_AFTER_MS + 1),
    });
    const delivered = order({
      id: 10,
      orderType: 'delivery',
      status: 'entregue',
      createdAt: atMinutesAgo(60),
    });
    expect(ids(filterKitchenOrders([boundary, recent, delivered], late, now))).toEqual([8]);
  });

  it('aceita o filtro inicial de atrasados vindo do painel', () => {
    const state = createKitchenFilterState('atrasados');
    expect(kitchenFilterSelection(state)).toEqual(['atrasados']);
    expect(ids(filterKitchenOrders(orders, state, now))).toEqual([5, 6]);
  });
});
