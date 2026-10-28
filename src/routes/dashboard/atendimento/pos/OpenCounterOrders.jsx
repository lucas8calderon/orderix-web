import { useEffect, useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Card, CardActionArea, CardContent, Grid, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { StatusBadge } from '../../../../commons/components/StatusBadge';
import { formatCurrency } from '../../../../services/accessControl';
import { getTableAccount } from '../service/accountService';
import { accountSubtotal, countAccountItems } from '../utils/accountTotals';
import {
  counterOrderMatches,
  counterStatusLabel,
  elapsedLabel,
  isActiveCounterSale,
  isOpenCounterOrder,
} from './counterOrders';

export function OpenCounterOrders({ visible = true, floorVersion = 0, onBack, onOpenAccount }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('open');

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

  const filtered = useMemo(() => {
    const source = filter === 'cancelled'
      ? orders.filter((order) => String(order?.status || '').toUpperCase() === 'CANCELLED')
      : orders.filter(isActiveCounterSale);
    return source.filter((order) => counterOrderMatches(order, query));
  }, [orders, filter, query]);

  return (
    <Box>
      <Box className="atendimento-section-header">
        <Typography variant="h5" component="h2" className="atendimento-section-title">
          Pedidos abertos
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none' }}>
          Nova venda
        </Button>
      </Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={filter}
        onChange={(_event, value) => {
          if (value) setFilter(value);
        }}
        aria-label="Filtrar pedidos de balcão"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="open" sx={{ textTransform: 'none' }}>Em aberto</ToggleButton>
        <ToggleButton value="cancelled" sx={{ textTransform: 'none' }}>Cancelados</ToggleButton>
      </ToggleButtonGroup>
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
        <EmptyState
          title={filter === 'cancelled' ? 'Nenhum cancelamento recente' : 'Nenhum pedido aberto no balcão'}
          description={filter === 'cancelled'
            ? 'Cancelamentos das últimas 24 horas aparecem aqui.'
            : 'Pedidos finalizados e cancelados ficam fora desta lista.'}
        />
      ) : null}
      {!loading && !error ? (
        <Grid container spacing={2}>
          {filtered.map((order) => {
            const status = counterStatusLabel(order);
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
                        <StatusBadge label={status.label} tone={status.tone} />
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
