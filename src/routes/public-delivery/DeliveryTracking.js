import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import { clearLastOrderByToken, findSlugForOrderToken } from '../../services/deliveryLastOrder';
import { readDeliveryCustomerSession } from '../../services/deliveryCustomerSession';
import { clearCart } from '../../services/deliveryCart';
import {
  confirmInfinitePayReturn,
  createInfinitePayCheckout,
  isInfinitePayCheckoutUrl,
  isPixPaid,
  readInfinitePayReturn,
} from '../../services/deliveryPaymentService';
import DeliveryBottomNav from './components/DeliveryBottomNav';
import DeliveryTrackingView from './DeliveryTrackingView';
import { useDeliveryOrderPolling } from './useDeliveryOrderPolling';
import './PublicDelivery.css';

function TrackingSkeleton() {
  return (
    <Box className="delivery-page delivery-tracking-page" aria-busy="true" aria-label="Carregando pedido">
      <Container maxWidth="sm" className="delivery-tracking-container">
        <Box className="dt-skel dt-skel-header" />
        <Box className="dt-skel dt-skel-card" />
        <Box className="dt-skel dt-skel-row" />
        <Box className="dt-skel dt-skel-card" />
        <Box className="dt-skel dt-skel-card" />
      </Container>
    </Box>
  );
}

export default function DeliveryTracking() {
  const { publicToken } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialOrder = location.state?.order || null;
  const {
    order,
    loading,
    error,
    notFound,
    refreshError,
    lastUpdatedAt,
    retry,
  } = useDeliveryOrderPolling(publicToken, initialOrder);

  useEffect(() => {
    if (notFound && publicToken) {
      clearLastOrderByToken(publicToken);
    }
  }, [notFound, publicToken]);

  const storeSlug = order?.storeSlug || location.state?.slug || findSlugForOrderToken(publicToken);
  const hasSession = Boolean(readDeliveryCustomerSession());
  const [paymentNotice, setPaymentNotice] = useState(location.state?.paymentNotice || '');
  const [paymentError, setPaymentError] = useState(location.state?.paymentError || '');
  const [retryingPayment, setRetryingPayment] = useState(false);
  const returnedPayment = readInfinitePayReturn(location.search);

  useEffect(() => {
    if (!publicToken || !returnedPayment?.orderNsu) return undefined;
    let cancelled = false;
    setPaymentNotice('verifying');
    confirmInfinitePayReturn(publicToken, returnedPayment)
      .then((response) => {
        if (cancelled) return;
        const status = response?.data?.status;
        if (isPixPaid(status)) {
          setPaymentNotice('approved');
          if (storeSlug) clearCart(storeSlug);
          retry();
          return;
        }
        if (String(response?.data?.statusMessage || '').toLowerCase().includes('não confirmado')) {
          setPaymentNotice('mismatch');
          return;
        }
        setPaymentNotice('pending');
      })
      .catch(() => {
        if (!cancelled) setPaymentNotice('failed');
      });
    return () => {
      cancelled = true;
    };
  }, [publicToken, location.search, storeSlug, retry]);

  const retryInfinitePay = async () => {
    if (!storeSlug || !order?.id) return;
    setRetryingPayment(true);
    setPaymentError('');
    try {
      const payKey = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
      const created = await createInfinitePayCheckout(storeSlug, order.id, payKey);
      const url = created.data?.ticketUrl;
      if (!isInfinitePayCheckoutUrl(url)) {
        setPaymentNotice('failed');
        return;
      }
      window.location.assign(url);
    } catch (err) {
      setPaymentNotice('failed');
      setPaymentError(err?.response?.data?.message || 'Não foi possível abrir o checkout.');
    } finally {
      setRetryingPayment(false);
    }
  };

  const paymentBanner = paymentNotice === 'verifying' ? (
    <Alert severity="info">Verificando pagamento...</Alert>
  ) : paymentNotice === 'approved' ? (
    <Alert severity="success">Pagamento aprovado.</Alert>
  ) : paymentNotice === 'pending' ? (
    <Alert
      severity="warning"
      action={order?.id ? (
        <Button color="inherit" size="small" onClick={retryInfinitePay} disabled={retryingPayment}>
          {retryingPayment ? 'Abrindo...' : 'Tentar de novo'}
        </Button>
      ) : null}
    >
      Pagamento não confirmado. Se você concluiu o pagamento, aguarde a confirmação.
    </Alert>
  ) : paymentNotice === 'mismatch' ? (
    <Alert severity="error">Pagamento não confirmado. O valor não confere com o pedido.</Alert>
  ) : paymentNotice === 'failed' ? (
    <Alert
      severity="error"
      action={order?.id ? (
        <Button color="inherit" size="small" onClick={retryInfinitePay} disabled={retryingPayment}>
          {retryingPayment ? 'Abrindo...' : 'Tentar de novo'}
        </Button>
      ) : null}
    >
      {paymentError || 'Não foi possível confirmar o pagamento.'}
    </Alert>
  ) : null;

  if (loading && !order) {
    return <TrackingSkeleton />;
  }

  if ((notFound || error) && !order) {
    return (
      <Box className="delivery-state">
        <Typography variant="h5" component="h1">Pedido não encontrado</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {error || 'Verifique o link de acompanhamento e tente novamente.'}
        </Typography>
        <Button variant="contained" onClick={retry}>Tentar novamente</Button>
      </Box>
    );
  }

  if (!order) {
    return <TrackingSkeleton />;
  }

  const goHome = () => {
    if (!storeSlug) return;
    navigate(`/delivery/${encodeURIComponent(storeSlug)}`);
  };

  return (
    <Box className="delivery-page delivery-tracking-page has-bottom-nav">
      <Container maxWidth="sm" className="delivery-tracking-container">
        <DeliveryTrackingView
          order={order}
          lastUpdatedLabel={lastUpdatedAt ? 'Atualizado agora' : 'Aguardando'}
          onGoHome={storeSlug ? goHome : undefined}
          showHomeButton={Boolean(storeSlug)}
          refreshError={refreshError}
          onRetryRefresh={retry}
          banner={paymentBanner}
        />
      </Container>
      {storeSlug ? (
        <DeliveryBottomNav
          slug={storeSlug}
          active="tracking"
          hasSession={hasSession}
          lastOrderToken={publicToken}
        />
      ) : null}
    </Box>
  );
}
