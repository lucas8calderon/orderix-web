import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import { clearLastOrderByToken, findSlugForOrderToken } from '../../services/deliveryLastOrder';
import { readDeliveryCustomerSession } from '../../services/deliveryCustomerSession';
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
