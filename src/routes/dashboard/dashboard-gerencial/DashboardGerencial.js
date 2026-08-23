import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../../services/accessControl';
import { Loading } from '../../../commons/components/Loading';
import { useDashboardOverview } from './hook/useDashboardOverview';
import './DashboardGerencial.css';

const PERIODS = [
  { id: 'TODAY', label: 'Hoje' },
  { id: 'DAYS_7', label: '7 dias' },
  { id: 'DAYS_30', label: '30 dias' },
  { id: 'MONTH', label: 'Este mês' },
];

const PRODUCT_SORTS = [
  { id: 'qty', label: 'Mais vendidos' },
  { id: 'revenue', label: 'Maior faturamento' },
  { id: 'least', label: 'Menos vendidos' },
];

const STATUS_CLASS = {
  NEW: 'awaiting',
  IN_PREPARATION: 'in-progress',
  READY: 'ready',
  DELIVERED: 'delivered',
};

function formatChange(changePercent) {
  const value = Number(changePercent) || 0;
  const abs = Math.abs(value).toLocaleString('pt-BR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
  return `${value >= 0 ? '+' : '-'}${abs}%`;
}

function previousLabel(period) {
  if (period === 'TODAY') return 'vs ontem';
  if (period === 'DAYS_7') return 'vs 7 dias anteriores';
  if (period === 'DAYS_30') return 'vs 30 dias anteriores';
  return 'vs mês anterior';
}

function formatClock(dateTime) {
  if (!dateTime) return '—';
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function operationTone(kind, operation) {
  if (kind === 'kitchen') return Number(operation.lateOrders) > 0 ? 'danger' : Number(operation.kitchenOrders) > 0 ? 'warn' : 'ok';
  if (kind === 'stock') return Number(operation.criticalStockCount) > 0 ? 'danger' : 'ok';
  if (kind === 'tables') {
    if (!operation.tablesTotal) return 'ok';
    const ratio = operation.tablesOccupied / operation.tablesTotal;
    if (ratio >= 1) return 'danger';
    if (ratio >= 0.8) return 'warn';
    return 'ok';
  }
  return Number(operation.openComandas) > 12 ? 'warn' : 'ok';
}

function MetricCard({ title, value, changePercent, previous, period }) {
  const current = Number(value) || 0;
  const prior = Number(previous) || 0;
  const isPositive = Number(changePercent) >= 0;
  const showChange = current > 0 || prior > 0;
  return (
    <Card className="overview-metric-card" elevation={0}>
      <CardContent className="overview-metric-content">
        <Typography className="overview-metric-title">{title}</Typography>
        <Typography className="overview-metric-value">{value}</Typography>
        {showChange ? (
          <Box className={`overview-metric-change ${isPositive ? 'is-up' : 'is-down'}`}>
            {isPositive ? <TrendingUpIcon fontSize="inherit" /> : <TrendingDownIcon fontSize="inherit" />}
            <span>{formatChange(changePercent)} {previousLabel(period)}</span>
          </Box>
        ) : (
          <Box className="overview-metric-change is-muted">Sem movimento no período</Box>
        )}
      </CardContent>
    </Card>
  );
}

function DualCurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const current = payload.find((item) => item.dataKey === 'current');
  const previous = payload.find((item) => item.dataKey === 'previous');
  return (
    <div className="overview-chart-tooltip">
      <strong>{label}</strong>
      <span>Atual: {formatCurrency(current?.value)}</span>
      <span>Anterior: {formatCurrency(previous?.value)}</span>
    </div>
  );
}

function CountTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="overview-chart-tooltip">
      <strong>{label}</strong>
      <span>{payload[0].value} pedidos</span>
    </div>
  );
}

export function DashboardGerencial({ onNavigate }) {
  const [period, setPeriod] = useState('DAYS_7');
  const [productSort, setProductSort] = useState('qty');
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const { overview, loading, error, refetch } = useDashboardOverview(period);
  const operation = overview.operation || {};
  const kitchen = overview.kitchen || {};
  const alerts = overview.alerts || [];

  const revenueSeries = useMemo(
    () => (overview.revenueSeries || []).map((point) => ({
      label: point.label,
      current: Number(point.current) || 0,
      previous: Number(point.previous) || 0,
    })),
    [overview.revenueSeries]
  );

  const hourlyData = useMemo(
    () => (overview.salesByHour || []).map((point) => ({
      label: point.label,
      value: Number(point.value) || 0,
    })),
    [overview.salesByHour]
  );

  const rankedProducts = useMemo(() => {
    const list = [...(overview.products || [])];
    if (productSort === 'revenue') {
      list.sort((a, b) => Number(b.revenue) - Number(a.revenue));
    } else if (productSort === 'least') {
      list.sort((a, b) => Number(a.quantity) - Number(b.quantity));
    } else {
      list.sort((a, b) => Number(b.quantity) - Number(a.quantity));
    }
    return list.slice(0, 5);
  }, [overview.products, productSort]);

  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 4);

  const go = (title, intent) => {
    if (typeof onNavigate === 'function') onNavigate(title, intent);
  };

  const handleAlert = (alert) => {
    if (alert.action === 'kitchen-late') go('Cozinha', { kitchenFilter: 'atrasados' });
    if (alert.action === 'inventory-critical') go('Inventário', { stockFilter: 'critical' });
    if (alert.action === 'atendimento') go('Atendimento');
  };

  if (loading) {
    return <Loading loadingMessage="Carregando visão geral..." />;
  }

  if (error) {
    return (
      <Box className="dashboard-gerencial">
        <Typography className="overview-error-title">Não foi possível carregar o dashboard</Typography>
        <Button variant="contained" onClick={refetch}>Tentar novamente</Button>
      </Box>
    );
  }

  return (
    <div className="dashboard-gerencial">
      <Box className="overview-header">
        <Box>
          <Typography className="overview-title">Visão Geral</Typography>
          <Typography className="overview-subtitle">
            O que está acontecendo agora e onde você precisa agir
          </Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={refetch} className="overview-refresh-btn">
          Atualizar
        </Button>
      </Box>

      {alerts.length > 0 && (
        <Card className="overview-alerts" elevation={0}>
          <CardContent>
            <Box className="overview-alerts-head">
              <Typography className="overview-panel-title">Atenção necessária — {alerts.length}</Typography>
            </Box>
            <ul className="overview-alert-list">
              {visibleAlerts.map((alert, index) => (
                <li key={`${alert.code}-${index}`}>
                  <button
                    type="button"
                    className={`overview-alert overview-alert--${alert.severity}`}
                    onClick={() => handleAlert(alert)}
                  >
                    {alert.message}
                  </button>
                </li>
              ))}
            </ul>
            {alerts.length > 4 && (
              <button type="button" className="overview-link-btn" onClick={() => setShowAllAlerts((open) => !open)}>
                {showAllAlerts ? 'Ver menos' : 'Ver todos os alertas'}
              </button>
            )}
          </CardContent>
        </Card>
      )}

      <Box className="overview-metrics">
        <MetricCard
          title="Faturamento"
          value={formatCurrency(overview.revenue?.value)}
          changePercent={overview.revenue?.changePercent}
          previous={overview.revenue?.previousValue}
          period={period}
        />
        <MetricCard
          title="Pedidos"
          value={String(overview.orders?.value ?? 0)}
          changePercent={overview.orders?.changePercent}
          previous={overview.orders?.previousValue}
          period={period}
        />
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(overview.averageTicket?.value)}
          changePercent={overview.averageTicket?.changePercent}
          previous={overview.averageTicket?.previousValue}
          period={period}
        />
      </Box>

      <Box className="overview-mini-kpis">
        <button type="button" className="overview-mini-kpi" onClick={() => go('Atendimento')}>
          <span>Mesas ocupadas</span>
          <strong>{operation.tablesOccupied || 0} / {operation.tablesTotal || 0}</strong>
        </button>
        <button type="button" className="overview-mini-kpi" onClick={() => go('Atendimento')}>
          <span>Comandas abertas</span>
          <strong>{operation.openComandas || 0}</strong>
        </button>
        <button type="button" className="overview-mini-kpi" onClick={() => go('Cozinha')}>
          <span>Pedidos na cozinha</span>
          <strong>{operation.kitchenOrders || 0}</strong>
        </button>
        <button type="button" className="overview-mini-kpi">
          <span>Tempo médio de preparo</span>
          <strong>{operation.avgPrepMinutes != null ? `${operation.avgPrepMinutes} min` : '—'}</strong>
        </button>
        <button type="button" className="overview-mini-kpi" onClick={() => go('Cozinha', { kitchenFilter: 'atrasados' })}>
          <span>Pedidos atrasados</span>
          <strong>{operation.lateOrders || 0}</strong>
        </button>
        <button type="button" className="overview-mini-kpi" onClick={() => go('Inventário', { stockFilter: 'critical' })}>
          <span>Estoque crítico</span>
          <strong>{operation.criticalStockCount || 0} itens</strong>
        </button>
      </Box>

      <Box>
        <Typography className="overview-section-label">Operação agora</Typography>
        <Box className="overview-now">
          <button type="button" className={`overview-now-card is-${operationTone('tables', operation)}`} onClick={() => go('Atendimento')}>
            <span className="overview-now-dot" />
            <strong>Mesas</strong>
            <p>{operation.tablesOccupied || 0} ocupadas / {operation.tablesAvailable || 0} disponíveis</p>
          </button>
          <button type="button" className={`overview-now-card is-${operationTone('kitchen', operation)}`} onClick={() => go('Cozinha', Number(operation.lateOrders) > 0 ? { kitchenFilter: 'atrasados' } : undefined)}>
            <span className="overview-now-dot" />
            <strong>Cozinha</strong>
            <p>{kitchen.inPreparation || 0} pedidos em preparo</p>
            <p>{kitchen.late || 0} atrasados{kitchen.onTimePercent != null ? ` · ${kitchen.onTimePercent}% no prazo` : ''}</p>
          </button>
          <button type="button" className={`overview-now-card is-${operationTone('service', operation)}`} onClick={() => go('Atendimento')}>
            <span className="overview-now-dot" />
            <strong>Atendimento</strong>
            <p>{operation.openComandas || 0} comandas abertas</p>
          </button>
          <button type="button" className={`overview-now-card is-${operationTone('stock', operation)}`} onClick={() => go('Inventário', { stockFilter: 'critical' })}>
            <span className="overview-now-dot" />
            <strong>Estoque</strong>
            <p>{operation.criticalStockCount || 0} produtos em nível crítico</p>
          </button>
        </Box>
      </Box>

      <Box className="overview-charts">
        <Card className="overview-panel overview-panel--wide" elevation={0}>
          <CardContent>
            <Box className="overview-panel-head">
              <Box>
                <Typography className="overview-panel-title">Faturamento</Typography>
                <Typography className="overview-panel-hint">
                  {formatCurrency(overview.revenue?.value)} no período · anterior {formatCurrency(overview.revenue?.previousValue)}
                  {overview.revenue?.changePercent != null ? ` · ${formatChange(overview.revenue.changePercent)}` : ''}
                </Typography>
              </Box>
              <Box className="overview-period-chips">
                {PERIODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`overview-chip ${period === item.id ? 'is-active' : ''}`}
                    onClick={() => setPeriod(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </Box>
            </Box>
            <Box className="overview-chart-wrap overview-chart-wrap--line">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSeries} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tickFormatter={(value) =>
                      Number(value).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: Number(value) >= 100 ? 0 : 2,
                      })
                    }
                  />
                  <Tooltip content={<DualCurrencyTooltip />} />
                  <Line type="monotone" dataKey="previous" name="Anterior" stroke="var(--color-text-muted)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                  <Line type="monotone" dataKey="current" name="Atual" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 3, fill: 'var(--color-success)', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card className="overview-panel" elevation={0}>
          <CardContent>
            <Typography className="overview-panel-title">Vendas por horário</Typography>
            <Box className="overview-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval={1} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<CountTooltip />} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box className="overview-bottom">
        <Card className="overview-panel overview-panel--wide" elevation={0}>
          <CardContent>
            <Typography className="overview-panel-title">Pedidos Recentes</Typography>
            {(overview.recentOrders || []).length === 0 ? (
              <Typography className="overview-empty">Nenhum pedido registrado ainda.</Typography>
            ) : (
              <div className="overview-orders-table">
                <div className="overview-orders-head">
                  <span>ID</span>
                  <span>Cliente / Mesa</span>
                  <span>Valor</span>
                  <span>Status</span>
                  <span>Hora</span>
                </div>
                {overview.recentOrders.map((order) => (
                  <div key={order.id} className="overview-orders-row">
                    <span className="overview-order-id">#{order.id}</span>
                    <span>{order.source || '—'}</span>
                    <span className="overview-order-amount">{Number(order.amount) > 0 ? formatCurrency(order.amount) : '—'}</span>
                    <span>
                      <span className={`overview-status overview-status--${STATUS_CLASS[order.status] || 'awaiting'}`}>
                        {order.statusLabel || order.status}
                      </span>
                    </span>
                    <span className="overview-order-time">{formatClock(order.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overview-panel" elevation={0}>
          <CardContent>
            <Box className="overview-panel-head">
              <Typography className="overview-panel-title">Produtos</Typography>
            </Box>
            <Box className="overview-period-chips">
              {PRODUCT_SORTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`overview-chip ${productSort === item.id ? 'is-active' : ''}`}
                  onClick={() => setProductSort(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </Box>
            {rankedProducts.length === 0 ? (
              <Typography className="overview-empty">Ainda não há itens vendidos neste período.</Typography>
            ) : (
              <div className="overview-product-table">
                <div className="overview-product-head">
                  <span>Produto</span>
                  <span>Qtd.</span>
                  <span>Faturamento</span>
                </div>
                {rankedProducts.map((product) => (
                  <div key={`${product.name}-${product.category}`} className="overview-product-row">
                    <Box>
                      <Typography className="overview-top-name">{product.name}</Typography>
                      <Typography className="overview-top-category">{product.category}</Typography>
                    </Box>
                    <span>{product.quantity}</span>
                    <span>{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box className="overview-bottom">
        <Card className="overview-panel" elevation={0}>
          <CardContent>
            <Typography className="overview-panel-title">Formas de pagamento</Typography>
            {(overview.paymentMethods || []).length === 0 ? (
              <Typography className="overview-empty">Nenhum pagamento fechado no período.</Typography>
            ) : (
              <ul className="overview-pay-list">
                {overview.paymentMethods.map((method) => (
                  <li key={method.method} className="overview-pay-item">
                    <Box className="overview-pay-copy">
                      <span>{method.label}</span>
                      <strong>{formatCurrency(method.value)}</strong>
                    </Box>
                    <div className="overview-pay-bar">
                      <span style={{ width: `${Math.max(4, method.percent)}%` }} />
                    </div>
                    <span className="overview-pay-pct">{method.percent}%</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="overview-panel" elevation={0}>
          <CardContent>
            <Box className="overview-panel-head">
              <Typography className="overview-panel-title">Desempenho da equipe</Typography>
              <button type="button" className="overview-link-btn" onClick={() => go('Colaboradores')}>
                Ver equipe
              </button>
            </Box>
            {(overview.team || []).length === 0 ? (
              <Typography className="overview-empty">Ainda não há vendas atribuídas a colaboradores neste período.</Typography>
            ) : (
              <div className="overview-product-table">
                <div className="overview-product-head">
                  <span>Colaborador</span>
                  <span>Pedidos</span>
                  <span>Vendas</span>
                </div>
                {overview.team.map((member) => (
                  <div key={member.name} className="overview-product-row">
                    <span>{member.name}</span>
                    <span>{member.orders}</span>
                    <span>{formatCurrency(member.sales)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
