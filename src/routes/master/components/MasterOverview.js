import React from 'react';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  PLAN_LABELS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from '../../../services/accessControl';
import { PageHeader } from '../../../commons/components/PageHeader';
import { EmptyState } from '../../../commons/components/EmptyState';

const PRIMARY = '#2563EB';
const PRIMARY_SOFT = 'rgba(37, 99, 235, 0.10)';

const STATUS_CHART_COLORS = {
  ACTIVE: '#10B981',
  OVERDUE: '#E6A700',
  BLOCKED: '#D32F2F',
  PENDING: '#90A4AE',
  CANCELED: '#78909C',
};

function statusColor(status) {
  switch (status) {
    case SUBSCRIPTION_STATUS.ACTIVE:
      return 'success';
    case SUBSCRIPTION_STATUS.PENDING:
    case SUBSCRIPTION_STATUS.OVERDUE:
      return 'warning';
    case SUBSCRIPTION_STATUS.BLOCKED:
    case SUBSCRIPTION_STATUS.CANCELED:
      return 'error';
    default:
      return 'default';
  }
}

function MetricCard({ title, value, icon, accent, iconColor, hint }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(10, 104, 71, 0.08)',

        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {hint}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: accent || PRIMARY_SOFT,
            color: iconColor || PRIMARY,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Paper>
  );
}

export function MasterOverview({ summary, stores, onViewAllStores }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const totalStores = summary?.totalStores ?? stores.length;
  const activeStores = summary?.activeStores ?? 0;
  const blockedOrOverdue = summary?.blockedOrOverdueStores ?? 0;
  const mrr = summary?.monthlyRecurringRevenue ?? 0;
  const activeRate = totalStores > 0 ? Math.round((activeStores / totalStores) * 100) : 0;


  const statusDistribution = React.useMemo(() => {
    const counts = {
      ACTIVE: 0,
      OVERDUE: 0,
      BLOCKED: 0,
      PENDING: 0,
      CANCELED: 0,
    };
    stores.forEach((store) => {
      const status = store.subscriptionStatus || 'PENDING';
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });

    return [
      { key: 'ACTIVE', name: 'Ativas', value: counts.ACTIVE },
      { key: 'OVERDUE', name: 'Inadimplentes', value: counts.OVERDUE },
      { key: 'BLOCKED', name: 'Bloqueadas', value: counts.BLOCKED },
      { key: 'PENDING', name: 'Pendentes', value: counts.PENDING },
      { key: 'CANCELED', name: 'Canceladas', value: counts.CANCELED },
    ].filter((item) => item.value > 0);
  }, [stores]);

  const recentStores = React.useMemo(() => {
    return [...stores]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id) || 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id) || 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [stores]);

  return (
    <Box>
      <PageHeader title="Visão geral da plataforma" description="Acompanhe lojas, assinaturas e receita recorrente atual." />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total de lojas"
            value={totalStores}
            hint="Lojas cadastradas na plataforma"
            icon={<StorefrontIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Lojas ativas"
            value={activeStores}
            hint={totalStores ? `${activeRate}% da base` : 'Sem lojas ainda'}
            icon={<CheckCircleOutlineIcon />}
            accent="rgba(10, 104, 71, 0.12)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Bloqueadas / inadimplentes"
            value={blockedOrOverdue}
            hint="OVERDUE + BLOCKED + CANCELED"
            icon={<WarningAmberIcon />}
            accent="rgba(211, 47, 47, 0.10)"
            iconColor="#D32F2F"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Faturamento MRR"
            value={formatCurrency(mrr)}
            hint="Soma das assinaturas ativas"
            icon={<AttachMoneyIcon />}
            accent="rgba(10, 104, 71, 0.14)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
<ChartCard title="Histórico da receita" subtitle="Receita recorrente das assinaturas">
            <EmptyState title="Histórico ainda indisponível" description="O valor atual aparece nos indicadores acima. A evolução mensal será exibida quando houver histórico de receita disponível." />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ChartCard
            title="Status das lojas"
            subtitle="Saúde da base de clientes"
          >
            {statusDistribution.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma loja para exibir
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: { xs: 240, sm: 280 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={isMobile ? 48 : 58}
                      outerRadius={isMobile ? 78 : 88}
                      paddingAngle={3}
                      stroke="var(--color-surface)"
                      strokeWidth={2}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={STATUS_CHART_COLORS[entry.key] || '#90A4AE'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} loja(s)`, name]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={48}
                      formatter={(value, entry) => (
                        <span style={{ color: 'var(--color-text-primary)', fontSize: 12 }}>
                          {value} ({entry?.payload?.value ?? 0})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          spacing={1}
          sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Lojas Recentes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Últimas lojas cadastradas na plataforma
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={onViewAllStores}
            sx={{ textTransform: 'none', color: PRIMARY, fontWeight: 600, alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Ver todas as lojas
          </Button>
        </Stack>

        <Box sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 560 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Loja</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Plano</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vencimento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentStores.map((store) => (
                <TableRow key={store.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {store.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{PLAN_LABELS[store.plan] || store.plan || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={SUBSCRIPTION_STATUS_LABELS[store.subscriptionStatus] || store.subscriptionStatus || '—'}
                      color={statusColor(store.subscriptionStatus)}
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(store.price)}</TableCell>
                  <TableCell>{formatDate(store.expiresAt)}</TableCell>
                </TableRow>
              ))}
              {recentStores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    Nenhuma loja cadastrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' }, p: 1.5 }}>
          {recentStores.length === 0 && (
            <Typography align="center" sx={{ py: 3 }} color="text.secondary">
              Nenhuma loja cadastrada ainda.
            </Typography>
          )}
          {recentStores.map((store) => (
            <Box
              key={store.id}
              sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8faf9' }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                  {store.name}
                </Typography>
                <Chip
                  size="small"
                  label={SUBSCRIPTION_STATUS_LABELS[store.subscriptionStatus] || store.subscriptionStatus || '—'}
                  color={statusColor(store.subscriptionStatus)}
                />
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {PLAN_LABELS[store.plan] || store.plan || '—'} · {formatCurrency(store.price)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Vencimento: {formatDate(store.expiresAt)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

export { statusColor };
