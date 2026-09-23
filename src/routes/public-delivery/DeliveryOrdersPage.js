import { EmptyState } from '../../commons/components/EmptyState';
import { Loading } from '../../commons/components/Loading';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Typography } from '@mui/material';
import { formatCurrency } from '../../services/accessControl';
import { listDeliveryCustomerOrders } from '../../services/deliveryCustomerService';
import { readDeliveryCustomerSession } from '../../services/deliveryCustomerSession';
import { getCurrentStatusCard } from './orderTrackingConfig';
import DeliveryAccountBar from './components/DeliveryAccountBar';
import DeliveryBottomNav from './components/DeliveryBottomNav';
import './PublicDelivery.css';

function formatWhen(value) {
  if (!value) return '';
  const date = Array.isArray(value) && value.length >= 3
    ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DeliveryOrdersPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readDeliveryCustomerSession());
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [loading, setLoading] = useState(Boolean(session));

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
      setOrders([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    listDeliveryCustomerOrders()
      .then((response) => {
        if (!cancelled) setOrders(response.data || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Não foi possível carregar seus pedidos.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [session?.token, retryKey]);

  return (
    <Box className="delivery-page has-bottom-nav">
      <div className="delivery-shell">
        <DeliveryAccountBar slug={slug} variant="header" />
        <div className="delivery-orders-head">
          <Button onClick={() => navigate(`/delivery/${encodeURIComponent(slug)}`)}>
            Voltar ao cardápio
          </Button>
          <Typography variant="h5" component="h1">Meus pedidos</Typography>
          <Typography color="text.secondary">
            Acompanhe o status e veja pedidos anteriores desta conta.
          </Typography>
        </div>

        {!session ? (
          <Alert severity="info">Entre na sua conta para ver o histórico de pedidos.</Alert>
        ) : null}
        {error ? <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" onClick={() => setRetryKey(value => value + 1)}>Tentar novamente</Button>}>{error}</Alert> : null}
        {loading ? <Loading loadingMessage="Carregando seus pedidos..." /> : null}

        {!loading && session && orders.length === 0 && !error ? (
          <EmptyState title="Seu primeiro pedido começa aqui" description="Escolha seus produtos no cardápio. Depois, acompanhe os pedidos por aqui." actionLabel="Ver cardápio" onAction={() => navigate(`/delivery/${encodeURIComponent(slug)}`)} />
        ) : null}

        <ul className="delivery-orders-list">
          {orders.map((order) => {
            const card = getCurrentStatusCard(order);
            return (
              <li key={order.publicToken || order.id}>
                <Link
                  className="delivery-order-card"
                  to={`/delivery/pedido/${order.publicToken}`}
                >
                  <div>
                    <strong>{order.storeName || 'Pedido'}</strong>
                    <span>{formatWhen(order.createdAt)}</span>
                  </div>
                  <div>
                    <em>{card.title}</em>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <DeliveryBottomNav
        slug={slug}
        active="orders"
        hasSession={Boolean(session)}
        onAccount={() => navigate(`/delivery/${encodeURIComponent(slug)}/conta`)}
      />
    </Box>
  );
}
