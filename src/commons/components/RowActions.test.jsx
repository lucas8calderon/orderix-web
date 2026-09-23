import { fireEvent, render, screen } from '@testing-library/react';
import { RowActions } from './RowActions';

it('keeps destructive actions behind an explicit menu selection', () => {
  const onDelete = jest.fn();
  render(<RowActions name="Produto exemplo" onEdit={jest.fn()} onDelete={onDelete} />);
  fireEvent.click(screen.getByRole('button', { name: 'Ações de Produto exemplo' }));
  expect(onDelete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('menuitem', { name: 'Excluir' }));
  expect(onDelete).toHaveBeenCalledTimes(1);
});
