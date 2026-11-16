import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CrmWhatsAppActions } from './CrmWhatsAppActions';

describe('CrmWhatsAppActions', () => {
  test('não oferece o botão sem telefone válido', () => {
    render(<CrmWhatsAppActions phone="999998888" onOpen={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Abrir no WhatsApp' })).not.toBeInTheDocument();
    expect(screen.getByText(/Sem telefone válido/)).toBeInTheDocument();
  });

  test('um clique duplo abre o WhatsApp uma vez e a confirmação fica disponível depois', async () => {
    const onOpen = jest.fn().mockResolvedValue(undefined);
    const onConfirm = jest.fn();
    const { rerender } = render(
      <CrmWhatsAppActions phone="11999998888" pendingConfirm={false} onOpen={onOpen} onConfirm={onConfirm} />
    );

    const button = screen.getByRole('button', { name: 'Abrir no WhatsApp' });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Confirme que enviou a mensagem' })).not.toBeInTheDocument();

    rerender(
      <CrmWhatsAppActions phone="11999998888" pendingConfirm onOpen={onOpen} onConfirm={onConfirm} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirme que enviou a mensagem' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});