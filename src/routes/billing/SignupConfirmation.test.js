import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupConfirmation, { SUPPORT_MESSAGE, supportWhatsAppUrl } from './SignupConfirmation';
import { WHATSAPP_NUMBER } from '../home/landingAssets';

function renderWith(props) {
  return render(
    <MemoryRouter>
      <SignupConfirmation {...props} />
    </MemoryRouter>,
  );
}

test('convite enviado mostra o e-mail mascarado e as orientações', () => {
  renderWith({ inviteStatus: 'SENT', maskedEmail: 'lu***@gmail.com' });

  expect(screen.getByRole('heading', { level: 2, name: 'Pagamento confirmado!' })).toBeInTheDocument();
  expect(screen.getByText('Sua assinatura Weper foi confirmada com sucesso.')).toBeInTheDocument();
  const invite = screen.getByTestId('invite-sent');
  expect(within(invite).getByRole('heading', { level: 3, name: 'Convite de acesso por e-mail' })).toBeInTheDocument();
  expect(invite).toHaveTextContent('Enviamos as instruções de acesso para lu***@gmail.com.');
  expect(invite).toHaveTextContent('Verifique sua caixa de entrada ou spam');
});

test('convite ainda em preparo não afirma que foi enviado', () => {
  renderWith({ inviteStatus: 'PENDING', maskedEmail: 'lu***@gmail.com' });

  const invite = screen.getByTestId('invite-pending');
  expect(invite).toHaveTextContent('Estamos preparando seu acesso');
  expect(invite).not.toHaveTextContent('Enviamos');
});

test('sem status do convite também mostra preparo, nunca enviado', () => {
  renderWith({});
  expect(screen.getByTestId('invite-pending')).toBeInTheDocument();
});

test('falha no convite mantém o pagamento confirmado e orienta o suporte', () => {
  renderWith({ inviteStatus: 'FAILED', maskedEmail: 'lu***@gmail.com' });

  expect(screen.getByText('Pagamento confirmado!')).toBeInTheDocument();
  expect(screen.getByTestId('invite-failed')).toHaveTextContent('Não conseguimos enviar seu convite');
  expect(screen.getByRole('link', { name: /Suporte via WhatsApp/ })).toBeInTheDocument();
});

test('acessar Weper leva ao login existente e não há botão de abrir e-mail', () => {
  renderWith({ inviteStatus: 'SENT', maskedEmail: 'lu***@gmail.com' });

  expect(screen.getByRole('link', { name: /Acessar Weper/ })).toHaveAttribute('href', '/login');
  const actions = [...screen.queryAllByRole('link'), ...screen.queryAllByRole('button')];
  expect(actions.filter((el) => /abrir|gmail|outlook|yahoo/i.test(el.textContent))).toHaveLength(0);
});

test('suporte abre o WhatsApp oficial com a mensagem sem dados pessoais', () => {
  renderWith({ inviteStatus: 'SENT', maskedEmail: 'lu***@gmail.com' });

  const link = screen.getByRole('link', { name: /Suporte via WhatsApp/ });
  expect(link).toHaveAttribute('href', supportWhatsAppUrl());
  expect(link).toHaveAttribute('target', '_blank');
  const url = new URL(link.getAttribute('href'));
  expect(url.pathname).toBe(`/${WHATSAPP_NUMBER}`);
  expect(url.searchParams.get('text')).toBe(SUPPORT_MESSAGE);
  expect(SUPPORT_MESSAGE).not.toMatch(/@|senha|token/i);
});
