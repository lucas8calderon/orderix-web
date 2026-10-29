import { comandaFloorStatus, tableFloorStatus } from './floorStatus';

describe('status de mesa e comanda', () => {
  it('mesa sem capacidade funciona normalmente', () => {
    for (const capacity of [0, null, undefined, '']) {
      const free = tableFloorStatus({ capacity, isAvailable: true });
      expect(free).toEqual(expect.objectContaining({
        label: 'Disponível',
        detail: 'Capacidade não informada',
        primaryLabel: 'Lançar',
        placeOrder: true,
        canDelete: true,
      }));
    }
    expect(tableFloorStatus({ capacity: null, isAvailable: false })).toEqual(expect.objectContaining({
      label: 'Em uso',
      detail: 'Capacidade não informada',
      primaryLabel: 'Cobrar',
      secondaryLabel: 'Lançar mais',
      canDelete: false,
    }));
  });

  it('mostra a capacidade e o uso da mesa', () => {
    const occupied = tableFloorStatus({ capacity: 4, isAvailable: false });
    expect(occupied.label).toBe('Em uso');
    expect(occupied.canDelete).toBe(false);
    expect(occupied.detail).toBe('4 pessoas');
    expect(occupied).toEqual(expect.objectContaining({ primaryLabel: 'Cobrar', secondaryLabel: 'Lançar mais' }));

    expect(tableFloorStatus({ capacity: 1, isAvailable: true }).label).toBe('Disponível');
  });

  it('impede excluir comanda em uso', () => {
    expect(comandaFloorStatus({ isAvailable: false }).canDelete).toBe(false);
    expect(comandaFloorStatus({ isAvailable: true })).toEqual(expect.objectContaining({
      label: 'Disponível',
      canDelete: true,
      primaryLabel: 'Lançar',
    }));
  });
});
