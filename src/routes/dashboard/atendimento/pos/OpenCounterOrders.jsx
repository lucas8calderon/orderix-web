import { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardActionArea, CardContent, Grid, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { StatusBadge } from '../../../../commons/components/StatusBadge';
import { formatCurrency } from '../../../../services/accessControl';
import { getTableAccount } from '../service/accountService';
import { accountSubtotal, countAccountItems } from '../utils/accountTotals';
import {
  counterOrderMatches,
  counterPaymentLabel,
  counterStatusLabel,
  elapsedLabel,
  isActiveCounterSale,
  isOpenCounterOrder,
  matchesCounterPaymentFilter,
  sortCounterOrdersNewestFirst,
} from './counterOrders';

export function OpenCounterOrders({ visible = true, floorVersion = 0, onCountChange, onOpenAccount }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('open');
  const [paymentFilter, setPaymentFilter] = useState(null);

  useEffect(() => {
    if (!visible) return undefined;
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
        setOrders([]);
        setError(err?.response?.data?.message || 'Não foi possível carregar os pedidos de balcão.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, floorVersion]);

  const activeCount = useMemo(() => orders.filter(isActiveCounterSale).length, [orders]);
  useEffect(() => {
    onCountChange?.(activeCount);
  }, [activeCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const source = filter === 'cancelled'
      ? orders.filter((order) => String(order?.status || '').toUpperCase() === 'CANCELLED')
      : orders.filter(isActiveCounterSale);
    return sortCounterOrdersNewestFirst(source
      .filter((order) => matchesCounterPaymentFilter(order, paymentFilter))
      .filter((order) => counterOrderMatches(order, query)));
  }, [orders, filter, paymentFilter, query]);

  const emptyCopy = paymentFilter === 'paid'
    ? (filter === 'cancelled'
      ? {
        title: 'Nenhum cancelamento pago',
        description: 'Cancelamentos das últimas 24 horas que já tinham sido cobrados aparecem aqui.',
      }
      : {
        title: 'Nenhum pedido pago em aberto',
        description: 'Pedidos em aberto que já foram cobrados aparecem aqui. Os fechados continuam fora desta lista.',
      })
    : paymentFilter === 'unpaid'
      ? (filter === 'cancelled'
        ? {
          title: 'Nenhum cancelamento sem pagamento',
          description: 'Cancelamentos das últimas 24 horas que não chegaram a ser cobrados aparecem aqui.',
        }
        : {
          title: 'Nenhum pedido em aberto sem pagamento',
          description: 'Pedidos em aberto que ainda não foram cobrados aparecem aqui.',
        })
      : (filter === 'cancelled'
        ? {
          title: 'Nenhum cancelamento recente',
          description: 'Cancelamentos das últimas 24 horas aparecem aqui.',
        }
        : {
          title: 'Nenhum pedido aberto no balcão',
          description: 'Pedidos finalizados e cancelados ficam fora desta lista.',
        });

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_event, value) => {
            if (value) setFilter(value);
          }}
          aria-label="Filtrar pedidos de balcão"
        >
          <ToggleButton value="open" sx={{ textTransform: 'none' }}>Em aberto</ToggleButton>
          <ToggleButton value="cancelled" sx={{ textTransform: 'none' }}>Cancelados</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={paymentFilter}
          onChange={(_event, value) => setPaymentFilter(value)}
          aria-label="Filtrar por pagamento"
        >
          <ToggleButton value="paid" sx={{ textTransform: 'none' }}>Pagos</ToggleButton>
          <ToggleButton value="unpaid" sx={{ textTransform: 'none' }}>Não pagos</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <TextField
        size="small"
        fullWidth
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por número ou cliente"
        inputProps={{ 'aria-label': 'Buscar pedido de balcão' }}
        sx={{ mb: 2, maxWidth: 420 }}
      />
      {loading ? <Loading loadingMessage="Carregando pedidos de balcão..." /> : null}
      {!loading && error ? <EmptyState title="Não foi possível carregar o balcão" description={error} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyState title={emptyCopy.title} description={emptyCopy.description} />
      ) : null}
      {!loading && !error ? (
        <Grid container spacing={2}>
          {filtered.map((order) => {
            const status = counterStatusLabel(order);
            const payment = counterPaymentLabel(order);
            const cancelled = String(order.status || '').toUpperCase() === 'CANCELLED';
            const total = accountSubtotal({ orders: [order] });
            const items = countAccountItems({ orders: [order] });
            const elapsed = elapsedLabel(order.createdAt || order.openedAt);
            return (
              <Grid item key={order.id} xs={12} sm={6} md={4} lg={3}>
                <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid var(--color-border)', height: '100%' }}>
                  <CardActionArea
                    disabled={cancelled}
                    onClick={() => onOpenAccount?.({ kind: 'counter', id: order.id, number: order.id })}
                    aria-label={cancelled ? `Pedido ${order.id} cancelado` : `Abrir pedido ${order.id}`}
                    sx={{ height: '100%', alignItems: 'stretch' }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                        <Typography variant="h6">Pedido {order.id}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <StatusBadge label={payment.label} tone={payment.tone} />
                          <StatusBadge label={status.label} tone={status.tone} />
                        </Box>
                      </Box>
                      <Typography color="text.secondary">{order.customerName || 'Balcão'}</Typography>
                      <Typography sx={{ mt: 1 }}>
                        {items} {items === 1 ? 'item' : 'itens'} · {formatCurrency(total)}
                      </Typography>
                      {elapsed ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {elapsed}
                        </Typography>
                      ) : null}
                      {cancelled && order.cancelReason ? (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{order.cancelReason}</Typography>
                      ) : null}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : null}
    </Box>
  );
}
