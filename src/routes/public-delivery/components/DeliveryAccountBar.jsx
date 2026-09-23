import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DeliveryAuthDialog from './DeliveryAuthDialog';
import {
  clearDeliveryCustomerSession,
  readDeliveryCustomerSession,
} from '../../../services/deliveryCustomerSession';

export default function DeliveryAccountBar({
  slug,
  variant = 'inline',
  onRequestAuth,
  openAuthSignal = 0,
}) {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readDeliveryCustomerSession());
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => setSession(readDeliveryCustomerSession());
    window.addEventListener('weper-delivery-customer-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('weper-delivery-customer-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!openAuthSignal || session) return;
    if (onRequestAuth) onRequestAuth();
    else setAuthOpen(true);
  }, [openAuthSignal, onRequestAuth, session]);

  const firstName = (session?.name || '').trim().split(/\s+/)[0];

  const requestAuth = () => {
    setMenuOpen(false);
    if (onRequestAuth) onRequestAuth();
    else setAuthOpen(true);
  };

  const goOrders = () => {
    setMenuOpen(false);
    navigate(`/delivery/${encodeURIComponent(slug)}/conta/pedidos`);
  };

  const goAccount = () => {
    setMenuOpen(false);
    navigate(`/delivery/${encodeURIComponent(slug)}/conta`);
  };

  const logout = () => {
    clearDeliveryCustomerSession();
    setSession(null);
    setMenuOpen(false);
  };

  if (variant === 'header') {
    return (
      <div className="delivery-account-bar is-header">
        {session ? (
          <>
            <button
              type="button"
              className="delivery-account-chip"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <PersonOutlineIcon fontSize="small" />
              <span>Olá, {firstName || 'cliente'}</span>
            </button>
            {menuOpen ? (
              <div className="delivery-account-menu" role="menu">
                <button type="button" role="menuitem" onClick={goAccount}>Minha conta</button>
                <button type="button" role="menuitem" onClick={goOrders}>Meus pedidos</button>
                <button type="button" role="menuitem" onClick={logout}>Sair</button>
              </div>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            className="delivery-account-chip"
            aria-label="Entrar"
            onClick={requestAuth}
          >
            <PersonOutlineIcon fontSize="small" />
            <span>Entrar</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="delivery-account-bar">
      {session ? (
        <>
          <span className="delivery-account-hello">Olá, {firstName || 'cliente'}</span>
          <button type="button" className="delivery-account-link" onClick={goOrders}>
            Meus pedidos
          </button>
          <button type="button" className="delivery-account-link" onClick={logout}>
            Sair
          </button>
        </>
      ) : (
        <button
          type="button"
          id="delivery-account-login"
          className="delivery-account-cta"
          onClick={requestAuth}
        >
          Entrar
        </button>
      )}
      {!onRequestAuth ? (
        <DeliveryAuthDialog
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthenticated={(next) => setSession(next)}
        />
      ) : null}
    </div>
  );
}
