import { fireEvent, render, screen } from '@testing-library/react';
import { Menu } from './Menu';
jest.mock('./category/Category', () => ({ CategoryContainer: ({ onAddProduct }) => <button onClick={() => onAddProduct({ id: 7 })}>Produto na categoria</button> }));
jest.mock('./product/Product', () => ({ ProductContainer: ({ presetCategoryId }) => <div>Categoria escolhida: {presetCategoryId}</div> }));

it('starts with products and opens a category-bound product without losing the category', () => {
  render(<Menu />);
  expect(screen.getByRole('tab', { name: 'Produtos' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.click(screen.getByRole('tab', { name: 'Categorias' }));
  expect(screen.getByRole('tabpanel', { name: 'Categorias' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Produto na categoria' }));
  expect(screen.getByRole('tabpanel', { name: 'Produtos' })).toBeVisible();
  expect(screen.getByText('Categoria escolhida: 7')).toBeVisible();
});
