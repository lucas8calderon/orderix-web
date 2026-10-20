import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { formatCurrency } from '../../../../services/accessControl';
import { formatOrderDisplayCode } from '../../../../services/salesChannel';
import { accountSubtotal, countAccountItems } from '../utils/accountTotals';
import { listCustomerOrders } from '../service/customerOrderService';
import { isOpenCounterOrder } from './CounterSales';

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .trim();
}

export function CustomerOrders({ onOpenAccount, onPlaceOrder, floorVersion = 0 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listCustomerOrders({ status: 'ACTIVE' })
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setOrders(list.filter(isOpenCounterOrder));
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setOrders([]);
        setError(err?.response?.data?.message || 'Não foi possível carregar os pedidos por cliente.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [floorVersion]);

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    if (!needle) return orders;
    return orders.filter((order) => {
      const name = normalizeSearch(order.customerName);
      const code = normalizeSearch(formatOrderDisplayCode(order));
      const id = normalizeSearch(String(order.id || ''));
      return name.includes(needle) || code.includes(needle) || id.includes(needle.replace(/^#/, ''));
    });
  }, [orders, query]);

  if (loading) {
    return <Loading loadingMessage="Carregando pedidos por cliente..." />;
  }

  return (
    <>
      <Box
        className="atendimento-section-header"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
      >
        <Typography variant="h5" component="h2" className="atendimento-section-title">
          Pedido por Cliente
        </Typography>
        <Button onClick={() => onPlaceOrder?.({ kind: 'customer' })} sx={{ textTransform: 'none' }}>
          Novo pedido
        </Button>
      </Box>
      <TextField
        size="small"
        fullWidth
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nome ou código"
        sx={{ mb: 2, maxWidth: 420 }}
        inputProps={{ 'aria-label': 'Buscar pedido por cliente' }}
      />
      {error ? (
        <EmptyState title="Não foi possível carregar" description={error} />
      ) : null}
      {!error && filtered.length === 0 ? (
        <EmptyState
          title="Nenhum pedido por cliente aberto"
          description="Crie um atendimento pelo nome do cliente ou use o app do garçom."
        />
      ) : null}
      <Grid container spacing={2}>
        {filtered.map((order) => {
          const cancelled = String(order.status || '').toUpperCase() === 'CANCELLED';
          const total = accountSubtotal({ orders: [order] });
          const items = countAccountItems({ orders: [order] });
          const code = formatOrderDisplayCode(order);
          return (
            <Grid item key={order.id} xs={12} sm={6} md={4} lg={3}>
              <Card>
                <CardActionArea
                  onClick={() => {
                    if (!cancelled) {
                      onOpenAccount?.({
                        kind: 'customer',
                        id: order.id,
                        number: code || order.id,
                        customerName: order.customerName,
                      });
                    }
                  }}
                  aria-label={
                    cancelled
                      ? `Pedido ${code} cancelado`
                      : `Abrir pedido ${code} de ${order.customerName || 'cliente'}`
                  }
                >
                  <CardContent>
                    <Typography variant="h6">
                      #{code} — {order.customerName || 'Cliente'}
                    </Typography>
                    <Typography color="text.secondary">Tipo: Pedido por Cliente</Typography>
                    {order.customerIdentificationNote ? (
                      <Typography variant="body2" color="text.secondary">
                        {order.customerIdentificationNote}
                      </Typography>
                    ) : null}
                    <Typography sx={{ mt: 1 }}>
                      {cancelled
                        ? 'Cancelado'
                        : `${items} ${items === 1 ? 'item' : 'itens'} · ${formatCurrency(total)}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {order.kitchenStatus || order.status || 'ACTIVE'}
                      {' · '}
                      Pagamento: Pendente
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
