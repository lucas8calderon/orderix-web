import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CookieConsent } from './CookieConsent';
import { CONSENT_ACCEPTED, CONSENT_KEY, CONSENT_REJECTED } from '../../services/metaPixel';

const PROD = 'www.weper.com.br';

function renderConsent(props) {
  return render(<MemoryRouter><CookieConsent hostname={PROD} pathname="/" {...props} /></MemoryRouter>);
}

beforeEach(() => window.localStorage.clear());

it('guarda o aceite e avisa para iniciar a medição', () => {
  const onAccept = jest.fn();
  renderConsent({ onAccept });
  fireEvent.click(screen.getByRole('button', { name: 'Aceitar' }));
  expect(window.localStorage.getItem(CONSENT_KEY)).toBe(CONSENT_ACCEPTED);
  expect(onAccept).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('dialog', { name: 'Aviso de cookies' })).not.toBeInTheDocument();
});

it('guarda a recusa sem iniciar a medição', () => {
  const onAccept = jest.fn();
  renderConsent({ onAccept });
  fireEvent.click(screen.getByRole('button', { name: 'Recusar' }));
  expect(window.localStorage.getItem(CONSENT_KEY)).toBe(CONSENT_REJECTED);
  expect(onAccept).not.toHaveBeenCalled();
});

it('não aparece no delivery das lojas, fora da produção ou depois de uma escolha', () => {
  const { unmount } = renderConsent({ pathname: '/delivery/minions' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  unmount();
  const view = renderConsent({ hostname: 'localhost' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  view.unmount();
  window.localStorage.setItem(CONSENT_KEY, CONSENT_REJECTED);
  renderConsent();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
