import { fireEvent, render, screen } from '@testing-library/react';
import { ProductFormDialog } from './ProductFormDialog';

const categories = [{ id: 1, name: 'Marmitas', active: true }];

function typePrice(field, cents) {
  fireEvent.change(field, { target: { value: String(cents) } });
}

describe('ProductFormDialog variations', () => {
  it('grava a pizza de dois sabores com mínimo 2', () => {
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
      target: { value: 'Pizza dois sabores' },
    });
    typePrice(screen.getByLabelText('Preço em reais'), '4500');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar escolha' }));
    fireEvent.click(screen.getByRole('button', { name: '2 sabores' }));
    fireEvent.change(screen.getByLabelText('Opção'), { target: { value: 'Calabresa' } });
    typePrice(screen.getByLabelText('Preço da opção'), '4500');

    fireEvent.click(screen.getByRole('button', { name: 'Salvar produto' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Pizza dois sabores',
      mandatoryGroups: [
        expect.objectContaining({
          minSelections: 2,
          maxSelections: 2,
          priceMode: 'HIGHEST',
        }),
      ],
    }));
  });

  it('grava o ponto da carne como seletor obrigatório', () => {
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
      target: { value: 'Hambúrguer artesanal' },
    });
    typePrice(screen.getByLabelText('Preço em reais'), '2800');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar escolha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Seletor' }));
    fireEvent.change(screen.getByLabelText('Nome da escolha'), {
      target: { value: 'Ponto da carne' },
    });

    const options = ['Ao ponto', 'Mal passada', 'Bem passada'];
    options.forEach((name, index) => {
      if (index > 0) {
        fireEvent.click(screen.getByRole('button', { name: 'Adicionar opção' }));
      }
      const fields = screen.getAllByLabelText('Opção');
      fireEvent.change(fields[index], { target: { value: name } });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar produto' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Hambúrguer artesanal',
      mandatoryGroups: [
        expect.objectContaining({
          name: 'Ponto da carne',
          minSelections: 1,
          maxSelections: 1,
          priceMode: 'SUM',
          items: [
            expect.objectContaining({ name: 'Ao ponto', price: 0 }),
            expect.objectContaining({ name: 'Mal passada', price: 0 }),
            expect.objectContaining({ name: 'Bem passada', price: 0 }),
          ],
        }),
      ],
    }));
  });

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

  it('preenche o preço pelo assistente sem salvar o produto', () => {
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

    fireEvent.click(screen.getByRole('button', { name: /Não sabe quanto cobrar/i }));
    expect(screen.getByText('Descubra quanto cobrar pelo seu produto')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome do custo 1'), { target: { value: 'Ingredientes' } });
    typePrice(screen.getByLabelText('Valor do custo 1'), '2300');
    fireEvent.change(screen.getByLabelText('Taxas e despesas variáveis em percentual'), {
      target: { value: '5' },
    });
    typePrice(screen.getByLabelText('Preço ajustado em reais'), '4190');
    fireEvent.click(screen.getByRole('button', { name: 'Usar este preço' }));

    expect(screen.getByLabelText('Preço em reais')).toHaveValue('41,90');
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByText('Descubra quanto cobrar pelo seu produto')).not.toBeInTheDocument();
  });

  it('oculta o assistente quando o produto usa variações', () => {
    render(
      <ProductFormDialog
        open
        onClose={jest.fn()}
        onSave={jest.fn()}
        product={{ categoryId: 1 }}
        categories={categories}
      />
    );

    expect(screen.getByRole('button', { name: /Não sabe quanto cobrar/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar variação' }));
    expect(screen.queryByRole('button', { name: /Não sabe quanto cobrar/i })).not.toBeInTheDocument();
  });
});
