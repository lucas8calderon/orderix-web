import { fireEvent, render, screen } from '@testing-library/react';
import { FloorCard } from './FloorCard';
import { filterFloorItems } from './FloorFilterBar';
import { comandaFloorStatus } from '../floorStatus';

function renderCard(comanda, handlers) {
  const status = comandaFloorStatus(comanda);
  render(
    <FloorCard
      title="Comanda 7"
      detail={status.detail}
      statusLabel={status.label}
      statusTone={status.tone}
      primaryLabel={status.primaryLabel}
      secondaryLabel={status.secondaryLabel}
      onPrimary={status.placeOrder ? handlers.onPlace : handlers.onOpen}
      onOpen={handlers.onOpen}
      onPlace={handlers.onPlace}
      canManage={false}
    />,
  );
}

describe('card de mesa e comanda', () => {
  it('livre: tocar no card lança pedido', () => {
    const handlers = { onOpen: jest.fn(), onPlace: jest.fn() };
    renderCard({ isAvailable: true }, handlers);
    fireEvent.click(screen.getByRole('button', { name: 'Lançar em Comanda 7' }));
    expect(handlers.onPlace).toHaveBeenCalledTimes(1);
    expect(handlers.onOpen).not.toHaveBeenCalled();
  });

  it('em uso: card abre a conta e oferece Cobrar e Lançar mais', () => {
    const handlers = { onOpen: jest.fn(), onPlace: jest.fn() };
    renderCard({ isAvailable: false }, handlers);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir conta de Comanda 7' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cobrar' }));
    expect(handlers.onOpen).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: 'Lançar mais' }));
    expect(handlers.onPlace).toHaveBeenCalledTimes(1);
  });

  it('filtra livres, em uso e número', () => {
    const items = [{ number: 1, isAvailable: true }, { number: 12, isAvailable: false }, { number: 2, isAvailable: true }];
    expect(filterFloorItems(items, { status: 'free' }).map((item) => item.number)).toEqual([1, 2]);
    expect(filterFloorItems(items, { status: 'busy' }).map((item) => item.number)).toEqual([12]);
    expect(filterFloorItems(items, { query: '1' }).map((item) => item.number)).toEqual([1, 12]);
  });
});
