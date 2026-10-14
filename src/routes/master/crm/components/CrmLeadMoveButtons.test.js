import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrmLeadMoveButtons } from './CrmLeadMoveButtons';

describe('CrmLeadMoveButtons', () => {
  it('move o card para a coluna anterior e a próxima', async () => {
    const onMove = jest.fn();
    render(<CrmLeadMoveButtons status="CONTACTED" onMove={onMove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Mover para Novo lead' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mover para Aguardando retorno' }));

    expect(onMove).toHaveBeenNthCalledWith(1, 'NEW');
    expect(onMove).toHaveBeenNthCalledWith(2, 'WAITING_RESPONSE');
  });

  it('esconde a direção que não existe na ponta do funil', () => {
    render(<CrmLeadMoveButtons status="NEW" onMove={jest.fn()} />);
    expect(screen.queryByRole('button', { name: /Novo lead/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mover para Contatado' })).toBeInTheDocument();
  });
});
