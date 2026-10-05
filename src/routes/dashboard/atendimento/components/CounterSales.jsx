import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardActionArea, CardContent, Grid, Typography } from '@mui/material';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { formatCurrency } from '../../../../services/accessControl';
import { getTableAccount } from '../service/accountService';
import { accountSubtotal, countAccountItems } from '../utils/accountTotals';

export function isOpenCounterOrder(order) {
  const status = String(order?.status || 'ACTIVE').toUpperCase();
  return status !== 'CLOSED' && status !== 'CANCELLED';
}

export function CounterSales({ onOpenAccount, onPlaceOrder, floorVersion = 0 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTableAccount(999)
      .then((response) => {
        if (cancelled) return;
        const list = response.data?.orders || [];
        setOrders(list.filter(isOpenCounterOrder));
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setOrders([]);
          setError('');
          return;
        }
        setError(err?.response?.data?.message || 'Não foi possível carregar os pedidos de balcão.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [floorVersion]);

  if (loading) {
    return <Loading loadingMessage="Carregando pedidos de balcão..." />;
  }

  return (
    <>
      <Box className="atendimento-section-header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h5" component="h2" className="atendimento-section-title">
          Balcão
        </Typography>
        <Button onClick={() => onPlaceOrder?.({ kind: 'counter' })} sx={{ textTransform: 'none' }}>
          Novo pedido
        </Button>
      </Box>
      {error ? (
        <EmptyState title="Não foi possível carregar o balcão" description={error} />
      ) : null}
      {!error && orders.length === 0 ? (
        <EmptyState
          title="Nenhum pedido aberto no balcão"
          description="Lance um pedido aqui ou feche os que vieram do aplicativo Android."
        />
      ) : null}
      <Grid container spacing={2}>
        {orders.map((order) => {
          const total = accountSubtotal({ orders: [order] });
          const items = countAccountItems({ orders: [order] });
          return (
            <Grid item key={order.id} xs={12} sm={6} md={4} lg={3}>
              <Card>
                <CardActionArea
                  onClick={() => onOpenAccount?.({ kind: 'counter', id: order.id, number: order.id })}
                  aria-label={`Abrir pedido ${order.id}`}
                >
                  <CardContent>
                    <Typography variant="h6">Pedido {order.id}</Typography>
                    <Typography color="text.secondary">
                      {order.customerName || 'Balcão'}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      {items} {items === 1 ? 'item' : 'itens'} · {formatCurrency(total)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
