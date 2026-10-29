import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardActionArea, CardContent, Chip, Grid, Typography } from '@mui/material';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { formatCurrency } from '../../../../services/accessControl';
import { formatOrderDisplayCode } from '../../../../services/salesChannel';
import { listDeliveryOrders } from '../service/deliveryOrderService';
import {
  deliveryOrderTotal,
  deliveryPaymentLabel,
  fulfillmentLabel,
  isOpenDeliveryOrder,
  isPendingStoreCharge,
  isPickupOrder,
  kitchenStatusLabel,
  summarizeOrderItems,
} from '../utils/deliveryOrderView';

export function DeliveryOrders({ onOpenAccount, onCountChange, floorVersion = 0 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listDeliveryOrders()
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        const open = list.filter(isOpenDeliveryOrder);
        setOrders(open);
        onCountChange?.(open.filter(isPendingStoreCharge).length);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setOrders([]);
        setError(err?.response?.data?.message || 'Não foi possível carregar os pedidos de delivery.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [floorVersion]);

  if (loading) {
    return <Loading loadingMessage="Carregando pedidos de delivery..." />;
  }

  return (
    <>
      <Box className="atendimento-section-header" sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" component="h2" className="atendimento-section-title">
            Delivery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Entregas e retiradas em aberto. Na retirada, receba o pagamento e feche o pedido.
          </Typography>
        </Box>
      </Box>
      {error ? (
        <EmptyState title="Não foi possível carregar o delivery" description={error} />
      ) : null}
      {!error && orders.length === 0 ? (
        <EmptyState
          title="Nenhum pedido de delivery em aberto"
          description="Pedidos de entrega e retirada ainda em produção aparecem aqui para cobrança na retirada."
        />
      ) : null}
      <Grid container spacing={2}>
        {orders.map((order) => {
          const code = formatOrderDisplayCode(order);
          const pending = isPendingStoreCharge(order);
          const pickup = isPickupOrder(order);
          const lines = summarizeOrderItems(order);
          const total = deliveryOrderTotal(order);
          const content = (
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Typography variant="h6">#{code}</Typography>
                <Chip
                  size="small"
                  label={fulfillmentLabel(order)}
                  sx={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
              </Box>
              <Typography color="text.secondary">
                {order.customerName || 'Cliente'}
              </Typography>
              {order.customerPhone ? (
                <Typography variant="body2" color="text.secondary">
                  {order.customerPhone}
                </Typography>
              ) : null}
              <Box sx={{ mt: 1 }}>
                {lines.length ? lines.map((line, index) => (
                  <Typography key={`${order.id}-${index}`} variant="body2">
                    {line}
                  </Typography>
                )) : (
                  <Typography variant="body2" color="text.secondary">Sem itens</Typography>
                )}
              </Box>
              <Typography sx={{ mt: 1 }}>
                {formatCurrency(total)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {kitchenStatusLabel(order)}
                {' · '}
                {deliveryPaymentLabel(order)}
              </Typography>
            </CardContent>
          );

          const receive = () => onOpenAccount?.({
            kind: 'delivery',
            id: order.id,
            number: code || order.id,
            customerName: order.customerName,
            fulfillment: pickup ? 'PICKUP' : 'DELIVERY',
          });
          return (
            <Grid item key={order.id} xs={12} sm={6} md={4} lg={3}>
              <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid var(--color-border)', borderTop: '4px solid', borderTopColor: pending ? 'var(--status-warning-text, #b45309)' : 'var(--color-success)' }}>
                {pending ? (
                  <>
                    <CardActionArea
                      onClick={receive}
                      sx={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start' }}
                      aria-label={`Receber pagamento do pedido ${code} de ${order.customerName || 'cliente'}`}
                    >
                      {content}
                    </CardActionArea>
                    <Box sx={{ px: 1, py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Button fullWidth variant="contained" disableElevation onClick={receive} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
                        Receber e finalizar
                      </Button>
                    </Box>
                  </>
                ) : content}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
