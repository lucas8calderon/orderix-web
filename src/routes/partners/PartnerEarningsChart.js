import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { formatCurrency } from '../../services/accessControl';
import { EARNINGS_RANGE_OPTIONS, formatPeriodLabel } from './partnerConstants';

export const EARNINGS_SERIES = [
  { key: 'estimated', label: 'Previstas', color: '#60A5FA' },
  { key: 'pending', label: 'Pendentes', color: '#F59E0B' },
  { key: 'paid', label: 'Recebidas', color: '#16A34A' },
];

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function compactCurrency(value) {
  const number = toNumber(value);
  if (Math.abs(number) >= 1000) return `R$ ${(number / 1000).toFixed(1).replace('.', ',')}k`;
  return `R$ ${Math.round(number)}`;
}

/**
 * Gráfico de comissões por mês (previstas, pendentes, recebidas).
 * `earnings` = PartnerEarningsChartDTO { range, empty, emptyMessage, points[] }.
 */
export default function PartnerEarningsChart({ earnings, loading, error, range, onRangeChange }) {
  const data = useMemo(
    () => (earnings?.points || []).map((point) => ({
      period: formatPeriodLabel(point.period),
      estimated: toNumber(point.estimated),
      pending: toNumber(point.pending),
      paid: toNumber(point.paid),
    })),
    [earnings],
  );
  const isEmpty = !loading && !error && (!earnings || earnings.empty || data.length === 0);

  return (
    <section className="partner-card" aria-labelledby="partner-earnings-title">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <h2 id="partner-earnings-title" className="partner-card-title">Comissões por mês</h2>
          <p className="partner-card-subtitle" style={{ margin: 0 }}>Previstas, pendentes e recebidas</p>
        </div>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={range}
          onChange={(_event, next) => next && onRangeChange(next)}
          aria-label="Período do gráfico"
        >
          {EARNINGS_RANGE_OPTIONS.map((option) => (
            <ToggleButton key={option.value} value={option.value} sx={{ px: 1.5, textTransform: 'none' }}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      {loading && <Skeleton variant="rounded" height={240} />}

      {!loading && error && (
        <p role="alert" style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>
      )}

      {isEmpty && (
        <div
          style={{
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 6,
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
          }}
        >
          <strong style={{ fontSize: 15 }}>Sem movimentações no período</strong>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 360 }}>
            {earnings?.emptyMessage || 'Ainda não há movimentações de comissão neste período.'}
          </span>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <div className="partner-chart" role="img" aria-label="Gráfico de barras de comissões previstas, pendentes e recebidas por mês">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={compactCurrency} />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                cursor={{ fill: 'var(--color-hover)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              {EARNINGS_SERIES.map((series) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  name={series.label}
                  fill={series.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
