import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewOrderAlertButton } from './NewOrderAlertButton';

describe('botão flutuante de pedido novo', () => {
  it('fica oculto quando não há pedido novo', () => {
    render(
      <NewOrderAlertButton count={0} toastOpen={false} onOpen={jest.fn()} onDismissToast={jest.fn()} />
    );
    expect(screen.queryByRole('button', { name: /pedido/i })).not.toBeInTheDocument();
  });

  it('mostra o badge acessível e o clique abre a lista', async () => {
    const onOpen = jest.fn();
    render(
      <NewOrderAlertButton count={3} toastOpen={false} onOpen={onOpen} onDismissToast={jest.fn()} />
    );
    await userEvent.click(screen.getByRole('button', { name: '3 pedidos novos' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('acompanha o som com um aviso curto', () => {
    render(
      <NewOrderAlertButton count={1} toastOpen onOpen={jest.fn()} onDismissToast={jest.fn()} />
    );
    expect(screen.getByRole('button', { name: '1 pedido novo' })).toBeInTheDocument();
    expect(screen.getByText('Novo pedido')).toBeInTheDocument();
  });
});
