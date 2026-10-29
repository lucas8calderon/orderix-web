import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
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
import { StatusBadge } from '../../../../commons/components/StatusBadge';
import { formatCurrency } from '../../../../services/accessControl';
import { PAYMENT_METHOD_LABELS } from '../../../../services/paymentConfigService';
import { formatOrderDisplayCode } from '../../../../services/salesChannel';
import { accountSubtotal, countAccountItems } from '../utils/accountTotals';
import { listCustomerOrders } from '../service/customerOrderService';
import { isOpenCounterOrder } from '../pos/counterOrders';
import { kitchenStatusLabel } from '../utils/deliveryOrderView';

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
    const method = PAYMENT_METHOD_LABELS[order?.paymentMethod] || order?.paymentMethod;
    return method ? `Pago · ${method}` : 'Pago';
  }
  if (status === 'CANCELLED') {
    return 'Cancelado';
  }
  return 'A cobrar';
}

function statusBadge(order) {
  const status = String(order?.status || '').toUpperCase();
  if (status === 'CLOSED') return { label: 'Finalizado', tone: 'success' };
  if (status === 'CANCELLED') return { label: 'Cancelado', tone: 'danger' };
  if (status === 'HELD') return { label: 'Aguardando pagamento', tone: 'warning' };
  const kitchen = String(order?.kitchenStatus || '').toUpperCase();
  return { label: kitchenStatusLabel(order), tone: kitchen === 'READY' ? 'success' : 'info' };
}

export function CustomerOrders({ onOpenAccount, onPlaceOrder, onCountChange, floorVersion = 0 }) {
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
          const open = list.filter(isOpenCounterOrder);
          setOrders(open);
          if (!activeFilter.kitchenStatus) onCountChange?.(open.length);
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
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddIcon />}
          onClick={() => onPlaceOrder?.({ kind: 'customer' })}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
        >
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
          const badge = statusBadge(order);
          const openTarget = {
            kind: 'customer',
            id: order.id,
            number: code || order.id,
            customerName: order.customerName,
            customerIdentificationNote: order.customerIdentificationNote,
          };
          return (
            <Grid item key={order.id} xs={12} sm={6} md={4} lg={3}>
              <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <CardActionArea
                  sx={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start' }}
                  onClick={() => {
                    if (!cancelled && !closed) {
                      onOpenAccount?.(openTarget);
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
                  <CardContent sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ minWidth: 0 }} noWrap>
                        {order.customerName || 'Cliente'}
                      </Typography>
                      <StatusBadge label={badge.label} tone={badge.tone} />
                    </Box>
                    <Typography color="text.secondary" variant="body2">#{code}</Typography>
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
                      {paymentLabel(order)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                {!cancelled && !closed ? (
                  <Box sx={{ display: 'flex', gap: 0.5, px: 1, py: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button size="small" variant="contained" disableElevation onClick={() => onOpenAccount?.(openTarget)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
                      Cobrar
                    </Button>
                    <Button size="small" onClick={() => onPlaceOrder?.(openTarget)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Adicionar itens
                    </Button>
                  </Box>
                ) : null}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
