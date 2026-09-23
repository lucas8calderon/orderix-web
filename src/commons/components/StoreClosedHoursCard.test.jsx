import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoreClosedHoursCard from './StoreClosedHoursCard';

const scheduleRows = [
  { id: 7, label: 'Domingo', enabled: true, intervals: [{ open: '18:00', close: '22:00' }] },
  { id: 1, label: 'Segunda-feira', enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
  { id: 2, label: 'Terça-feira', enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
];

describe('StoreClosedHoursCard', () => {
  it('inicia recolhido sem mostrar a lista de horários', () => {
    render(
      <StoreClosedHoursCard
        title="Loja fechada"
        copy="Você pode ver o cardápio, mas não é possível enviar pedido agora."
        scheduleRows={scheduleRows}
      />
    );

    expect(screen.getByText('Loja fechada')).toBeInTheDocument();
    expect(screen.getByText(/não é possível enviar pedido agora/i)).toBeInTheDocument();
    expect(screen.queryByText('Domingo')).not.toBeInTheDocument();
    expect(screen.queryByText('Segunda-feira')).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /loja fechada/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('expande e mostra os dias e horários', async () => {
    render(
      <StoreClosedHoursCard
        title="Loja fechada"
        copy="Você pode ver o cardápio, mas não é possível enviar pedido agora."
        scheduleRows={scheduleRows}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /loja fechada/i }));

    expect(screen.getByRole('button', { name: /loja fechada/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByText('Domingo')).toBeInTheDocument();
    expect(screen.getByText('18:00 às 22:00')).toBeInTheDocument();
    expect(screen.getByText('Segunda-feira')).toBeInTheDocument();
    expect(screen.getByText('Terça-feira')).toBeInTheDocument();
  });

  it('recolhe novamente ao clicar no header', async () => {
    render(
      <StoreClosedHoursCard
        title="Loja fechada"
        copy="Você pode ver o cardápio, mas não é possível enviar pedido agora."
        scheduleRows={scheduleRows}
      />
    );

    const toggle = screen.getByRole('button', { name: /loja fechada/i });
    await userEvent.click(toggle);
    expect(screen.getByText('Domingo')).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Domingo')).not.toBeInTheDocument();
  });

  it('sem horários, não renderiza controle de expansão', () => {
    render(
      <StoreClosedHoursCard
        title="Loja fechada"
        copy="Você pode ver o cardápio, mas não é possível enviar pedido agora."
        scheduleRows={[]}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Loja fechada')).toBeInTheDocument();
  });
});
