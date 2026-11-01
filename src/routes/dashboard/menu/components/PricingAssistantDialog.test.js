import { fireEvent, render, screen, within } from '@testing-library/react';
import { PricingAssistantDialog } from './PricingAssistantDialog';

function typeMoney(field, cents) {
  fireEvent.change(field, { target: { value: String(cents) } });
}

function fillPizzaCosts() {
  const names = ['Massa', 'Molho', 'Queijo', 'Calabresa', 'Embalagem'];
  const values = ['450', '180', '800', '650', '220'];

  names.forEach((name, index) => {
    if (index > 0) {
      fireEvent.click(screen.getByRole('button', { name: 'Adicionar custo' }));
    }
    fireEvent.change(screen.getByLabelText(`Nome do custo ${index + 1}`), {
      target: { value: name },
    });
    typeMoney(screen.getByLabelText(`Valor do custo ${index + 1}`), values[index]);
  });
}

describe('PricingAssistantDialog', () => {
  it('soma custos, calcula preço sugerido e aplica o ajustado', () => {
    const onApply = jest.fn();
    const onClose = jest.fn();

    render(
      <PricingAssistantDialog
        open
        onClose={onClose}
        onApply={onApply}
        currentPrice={39.9}
      />
    );

    expect(screen.getByText(/Preço atual do produto/i)).toBeInTheDocument();
    fillPizzaCosts();

    expect(screen.getByText('R$ 23,00')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 38,33').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Taxas e despesas variáveis em percentual'), {
      target: { value: '5' },
    });
    expect(screen.getAllByText('R$ 41,82').length).toBeGreaterThan(0);

    typeMoney(screen.getByLabelText('Preço ajustado em reais'), '4190');
    fireEvent.click(screen.getByRole('button', { name: 'Usar este preço' }));

    expect(onApply).toHaveBeenCalledWith(41.9);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('permite adicionar e remover custos', () => {
    render(
      <PricingAssistantDialog open onClose={jest.fn()} onApply={jest.fn()} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar custo' }));
    expect(screen.getByLabelText('Nome do custo 2')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Remover custo 2'));
    expect(screen.queryByLabelText('Nome do custo 2')).not.toBeInTheDocument();
  });

  it('não aplica com custo total zerado', () => {
    const onApply = jest.fn();
    render(
      <PricingAssistantDialog open onClose={jest.fn()} onApply={onApply} />
    );

    expect(screen.getByRole('button', { name: 'Usar este preço' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Usar este preço' }));
    expect(onApply).not.toHaveBeenCalled();
  });

  it('cancelar não aplica preço', () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(
      <PricingAssistantDialog open onClose={onClose} onApply={onApply} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('recalcula indicadores ao ajustar o preço', () => {
    render(
      <PricingAssistantDialog open onClose={jest.fn()} onApply={jest.fn()} />
    );

    typeMoney(screen.getByLabelText('Valor do custo 1'), '2300');
    fireEvent.change(screen.getByLabelText('Taxas e despesas variáveis em percentual'), {
      target: { value: '5' },
    });

    typeMoney(screen.getByLabelText('Preço ajustado em reais'), '4190');

    const panel = screen.getByText('Resultado da precificação').closest('div');
    expect(within(panel).getByText('54,89%')).toBeInTheDocument();
    expect(within(panel).getByText('40,11%')).toBeInTheDocument();
    expect(within(panel).getByText('R$ 16,80')).toBeInTheDocument();
  });
});
