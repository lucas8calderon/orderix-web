import { comandaFloorStatus, tableFloorStatus } from './floorStatus';

describe('status de mesa e comanda', () => {
  it('não marca mesa em manutenção como disponível', () => {
    const maintenance = tableFloorStatus({ capacity: 0, isAvailable: true });
    expect(maintenance.label).toBe('Em manutenção');
    expect(maintenance.label).not.toBe('Disponível');
    expect(maintenance.canDelete).toBe(true);

    const occupied = tableFloorStatus({ capacity: 4, isAvailable: false });
    expect(occupied.label).toBe('Em uso');
    expect(occupied.canDelete).toBe(false);
    expect(occupied.detail).toBe('4 pessoas');

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
