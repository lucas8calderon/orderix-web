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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { formatCurrency } from '../../../../services/accessControl';
import { formatOrderDisplayCode } from '../../../../services/salesChannel';
import { accountSubtotal, countAccountItems } from '../utils/accountTotals';
import { listCustomerOrders } from '../service/customerOrderService';
import { isOpenCounterOrder } from './CounterSales';

const STATUS_FILTERS = [
  { id: 'ACTIVE', label: 'Abertos', apiStatus: 'ACTIVE' },
  { id: 'IN_PREPARATION', label: 'Em preparo', apiStatus: 'ACTIVE', kitchenStatus: 'IN_PREPARATION' },
  { id: 'READY', label: 'Prontos', apiStatus: 'ACTIVE', kitchenStatus: 'READY' },
  { id: 'CLOSED', label: 'Finalizados', apiStatus: 'CLOSED' },
];

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .trim();
}

function paymentLabel(order) {
  const status = String(order?.status || '').toUpperCase();
  if (status === 'CLOSED') {
    return order?.paymentMethod ? `Pago (${order.paymentMethod})` : 'Pago';
  }
  if (status === 'CANCELLED') {
    return 'Cancelado';
  }
  return 'Pagamento: Pendente';
}

export function CustomerOrders({ onOpenAccount, onPlaceOrder, floorVersion = 0 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const activeFilter = STATUS_FILTERS.find((item) => item.id === statusFilter) || STATUS_FILTERS[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listCustomerOrders({
      status: activeFilter.apiStatus,
      kitchenStatus: activeFilter.kitchenStatus,
    })
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        if (activeFilter.apiStatus === 'CLOSED') {
          setOrders(list);
        } else {
          setOrders(list.filter(isOpenCounterOrder));
        }
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
  }, [floorVersion, activeFilter.apiStatus, activeFilter.kitchenStatus]);

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    if (!needle) return orders;
    return orders.filter((order) => {
      const name = normalizeSearch(order.customerName);
      const code = normalizeSearch(formatOrderDisplayCode(order));
      const id = normalizeSearch(String(order.id || ''));
      const note = normalizeSearch(order.customerIdentificationNote);
      return name.includes(needle)
        || code.includes(needle)
        || id.includes(needle.replace(/^#/, ''))
        || note.includes(needle);
    });
  }, [orders, query]);

  if (loading) {
    return <Loading loadingMessage="Carregando pedidos por cliente..." />;
  }

  const emptyTitle = activeFilter.apiStatus === 'CLOSED'
    ? 'Nenhum pedido finalizado'
    : 'Nenhum pedido por cliente aberto';
  const emptyDescription = activeFilter.apiStatus === 'CLOSED'
    ? 'Pedidos cobrados e fechados aparecem aqui para rastreabilidade.'
    : 'Crie um atendimento pelo nome do cliente ou use o app do garçom.';

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
      <ToggleButtonGroup
        exclusive
        size="small"
        value={statusFilter}
        onChange={(_event, value) => {
          if (value) setStatusFilter(value);
        }}
        sx={{ mb: 2, flexWrap: 'wrap' }}
        aria-label="Filtrar pedidos por cliente"
      >
        {STATUS_FILTERS.map((item) => (
          <ToggleButton key={item.id} value={item.id} sx={{ textTransform: 'none' }}>
            {item.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <TextField
        size="small"
        fullWidth
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por nome, código ou identificação"
        sx={{ mb: 2, maxWidth: 420 }}
        inputProps={{ 'aria-label': 'Buscar pedido por cliente' }}
      />
      {error ? (
        <EmptyState title="Não foi possível carregar" description={error} />
      ) : null}
      {!error && filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : null}
      <Grid container spacing={2}>
        {filtered.map((order) => {
          const status = String(order.status || '').toUpperCase();
          const cancelled = status === 'CANCELLED';
          const closed = status === 'CLOSED';
          const total = accountSubtotal({ orders: [order] });
          const items = countAccountItems({ orders: [order] });
          const code = formatOrderDisplayCode(order);
          return (
            <Grid item key={order.id} xs={12} sm={6} md={4} lg={3}>
              <Card>
                <CardActionArea
                  onClick={() => {
                    if (!cancelled && !closed) {
                      onOpenAccount?.({
                        kind: 'customer',
                        id: order.id,
                        number: code || order.id,
                        customerName: order.customerName,
                        customerIdentificationNote: order.customerIdentificationNote,
                      });
                    }
                  }}
                  disabled={cancelled || closed}
                  aria-label={
                    cancelled
                      ? `Pedido ${code} cancelado`
                      : closed
                        ? `Pedido ${code} finalizado de ${order.customerName || 'cliente'}`
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
                      {paymentLabel(order)}
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
