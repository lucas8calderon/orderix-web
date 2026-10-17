import { fireEvent, render, screen } from '@testing-library/react';
import { ProductFormDialog } from './ProductFormDialog';

const categories = [{ id: 1, name: 'Marmitas', active: true }];

function typePrice(field, cents) {
  fireEvent.change(field, { target: { value: String(cents) } });
}

describe('ProductFormDialog variations', () => {
  it('salva o mesmo produto com preços diferentes por variação', () => {
    const onSave = jest.fn();
    render(
      <ProductFormDialog
        open
        onClose={jest.fn()}
        onSave={onSave}
        product={{ categoryId: 1 }}
        categories={categories}
      />
    );

    fireEvent.change(screen.getByLabelText('Nome do produto'), {
      target: { value: 'Strogonoff de Frango' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar variação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar variação' }));

    const names = screen.getAllByLabelText('Variação');
    fireEvent.change(names[0], { target: { value: 'Pequeno' } });
    fireEvent.change(names[1], { target: { value: 'Grande' } });
    const prices = screen.getAllByLabelText('Preço');
    typePrice(prices[0], '1400');
    typePrice(prices[1], '2200');

    fireEvent.click(screen.getByRole('button', { name: 'Salvar produto' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Strogonoff de Frango',
      value: 14,
      variations: [
        expect.objectContaining({ name: 'Pequeno', price: 14 }),
        expect.objectContaining({ name: 'Grande', price: 22 }),
      ],
    }));
  });
});
