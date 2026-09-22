import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryAuthDialog from './DeliveryAuthDialog';
import {
  clearDeliveryCustomerSession,
  readDeliveryCustomerSession,
} from '../../../services/deliveryCustomerSession';

export default function DeliveryAccountBar({ slug }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readDeliveryCustomerSession());
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const sync = () => setSession(readDeliveryCustomerSession());
    window.addEventListener('weper-delivery-customer-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('weper-delivery-customer-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const firstName = (session?.name || '').trim().split(/\s+/)[0];

  return (
    <div className="delivery-account-bar">
      {session ? (
        <>
          <span className="delivery-account-hello">Olá, {firstName || 'cliente'}</span>
          <button
            type="button"
            className="delivery-account-link"
            onClick={() => navigate(`/delivery/${encodeURIComponent(slug)}/conta/pedidos`)}
          >
            Meus pedidos
          </button>
          <button
            type="button"
            className="delivery-account-link"
            onClick={() => {
              clearDeliveryCustomerSession();
              setSession(null);
            }}
          >
            Sair
          </button>
        </>
      ) : (
        <button
          type="button"
          className="delivery-account-cta"
          onClick={() => setAuthOpen(true)}
        >
          Entrar ou criar conta
        </button>
      )}
      <DeliveryAuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(next) => setSession(next)}
      />
    </div>
  );
}
