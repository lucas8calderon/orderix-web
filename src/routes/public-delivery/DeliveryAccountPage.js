import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Typography } from '@mui/material';
import {
  getDeliveryCustomerMe,
  listDeliveryCustomerAddresses,
} from '../../services/deliveryCustomerService';
import {
  clearDeliveryCustomerSession,
  readDeliveryCustomerSession,
} from '../../services/deliveryCustomerSession';
import { formatPhoneInput } from '../../utils/phoneInput';
import DeliveryAccountBar from './components/DeliveryAccountBar';
import DeliveryAuthDialog from './components/DeliveryAuthDialog';
import DeliveryBottomNav from './components/DeliveryBottomNav';
import './PublicDelivery.css';

function formatAddress(address) {
  const street = [address?.street, address?.number].filter(Boolean).join(', ');
  const city = [address?.city, address?.state].filter(Boolean).join('/');
  return [street, address?.neighborhood, city].filter(Boolean).join(' · ');
}

export default function DeliveryAccountPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readDeliveryCustomerSession());
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(session));
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

  useEffect(() => {
    if (!session?.token) {
      setProfile(null);
      setAddresses([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([getDeliveryCustomerMe(), listDeliveryCustomerAddresses()])
      .then(([me, addressResponse]) => {
        if (cancelled) return;
        setProfile(me.data || null);
        setAddresses(addressResponse.data || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Não foi possível carregar sua conta.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [session?.token]);

  const logout = () => {
    clearDeliveryCustomerSession();
    setSession(null);
    setProfile(null);
    setAddresses([]);
  };

  const name = profile?.name || session?.name || '';
  const email = profile?.email || session?.email || '';
  const phone = formatPhoneInput(profile?.phone || session?.phone || '');

  return (
    <Box className="delivery-page has-bottom-nav">
      <div className="delivery-shell">
        <DeliveryAccountBar slug={slug} variant="header" />
        <div className="delivery-orders-head">
          <Button onClick={() => navigate(`/delivery/${encodeURIComponent(slug)}`)}>
            Voltar ao cardápio
          </Button>
          <Typography variant="h5" component="h1">Minha conta</Typography>
          <Typography color="text.secondary">
            Dados usados nos seus pedidos desta loja.
          </Typography>
        </div>

        {!session ? (
          <Alert
            severity="info"
            action={(
              <Button color="inherit" size="small" onClick={() => setAuthOpen(true)}>
                Entrar
              </Button>
            )}
          >
            Entre na sua conta para ver nome, contato e endereços.
          </Alert>
        ) : null}
        {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
        {loading ? <Typography sx={{ mt: 2 }}>Carregando...</Typography> : null}

        {session && !loading ? (
          <section className="delivery-account-card" aria-label="Dados da conta">
            <dl>
              <div>
                <dt>Nome</dt>
                <dd>{name || '—'}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{email || '—'}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{phone || '—'}</dd>
              </div>
            </dl>
            <Typography component="h2" className="delivery-account-subtitle">
              Endereços
            </Typography>
            {addresses.length === 0 ? (
              <Typography color="text.secondary">Nenhum endereço salvo.</Typography>
            ) : (
              <ul className="delivery-account-addresses">
                {addresses.map((address) => (
                  <li key={address.id}>
                    <strong>{address.label || 'Endereço'}{address.isDefault ? ' · padrão' : ''}</strong>
                    <span>{formatAddress(address) || 'Endereço sem detalhes'}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outlined" onClick={logout} sx={{ mt: 2 }}>
              Sair da conta
            </Button>
          </section>
        ) : null}
      </div>

      <DeliveryBottomNav
        slug={slug}
        active="account"
        hasSession={Boolean(session)}
      />
      <DeliveryAuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(next) => setSession(next)}
      />
    </Box>
  );
}
