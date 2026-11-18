import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../../../services/accessControl';
import { listPixInvoices } from '../service/financeAdminService';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'OPEN', label: 'Em aberto' },
  { value: 'OVERDUE', label: 'Vencidas' },
  { value: 'PAID', label: 'Pagas' },
  { value: 'REVIEW', label: 'Em análise' },
  { value: 'REFUNDED', label: 'Devolvidas' },
];

const ACCESS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'FULL', label: 'Em dia' },
  { value: 'GRACE', label: 'Em tolerância' },
  { value: 'LIMITED', label: 'Suspensos' },
];

const PLAN_OPTIONS = ['', 'PLAN_01', 'PLAN_02', 'PLAN_03', 'PLAN_04', 'PLAN_05', 'PLAN_TEST'];

const STATUS_LABEL = {
  OPEN: 'Em aberto',
  PAID: 'Paga',
  REVIEW: 'Em análise',
  REFUNDED: 'Devolvida',
  CANCELED: 'Cancelada',
};

const ACCESS_LABEL = { FULL: 'Em dia', GRACE: 'Tolerância', LIMITED: 'Suspensa', BLOCKED: 'Bloqueada' };

export function formatDay(value) {
  const parts = Array.isArray(value) ? value : String(value || '').slice(0, 10).split('-');
  if (parts.length < 3) return '—';
  const [year, month, day] = parts;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

/** Mensalidades Pix (Mercado Pago) no Financeiro do Master. Só registros persistidos. */
export default function MasterPixInvoices() {
  const [filters, setFilters] = useState({ status: '', access: '', plan: '', storeId: '', dueFrom: '', dueTo: '' });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (current) => {
    setLoading(true);
    setError('');
    try {
      setData(await listPixInvoices(current));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Não foi possível carregar as mensalidades Pix.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({});
  }, [load]);

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  const summary = data?.summary;
  const rows = data?.invoices || [];

  return (
    <Paper sx={{ p: 3, borderRadius: 2.5 }}>
      <Typography variant="h6">Mensalidades Pix (Mercado Pago)</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cada mensalidade é cobrada por um Pix gerado pela Weper. Tolerância de 8 dias antes da suspensão.
      </Typography>

      {summary ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2 }}>
          <Metric label="Assinaturas Pix ativas" value={summary.activePixSubscriptions} />
          <Metric label="Em aberto" value={summary.openInvoices} />
          <Metric label="Vencidas" value={summary.overdueInvoices} />
          <Metric label="Lojas em tolerância" value={summary.storesInGrace} />
          <Metric label="Lojas suspensas" value={summary.storesSuspended} />
          <Metric label="Pagas" value={summary.paidInvoices} />
          <Metric label="Em análise" value={summary.invoicesInReview} />
          <Metric label="Falhas e Pix duplicados" value={summary.failedOrDuplicateAttempts} />
        </Box>
      ) : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField select size="small" label="Status" value={filters.status} onChange={(e) => update('status', e.target.value)} sx={{ minWidth: 140 }}>
          {STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Acesso" value={filters.access} onChange={(e) => update('access', e.target.value)} sx={{ minWidth: 140 }}>
          {ACCESS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Plano" value={filters.plan} onChange={(e) => update('plan', e.target.value)} sx={{ minWidth: 120 }}>
          {PLAN_OPTIONS.map((plan) => <MenuItem key={plan || 'all'} value={plan}>{plan || 'Todos'}</MenuItem>)}
        </TextField>
        <TextField size="small" label="Loja (id)" value={filters.storeId} onChange={(e) => update('storeId', e.target.value.replace(/\D/g, ''))} sx={{ width: 110 }} />
        <TextField size="small" type="date" label="Vence de" InputLabelProps={{ shrink: true }} value={filters.dueFrom} onChange={(e) => update('dueFrom', e.target.value)} />
        <TextField size="small" type="date" label="até" InputLabelProps={{ shrink: true }} value={filters.dueTo} onChange={(e) => update('dueTo', e.target.value)} />
        <Button variant="outlined" onClick={() => load(filters)} disabled={loading}>Filtrar</Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {!loading && rows.length === 0 && !error ? (
        <Typography variant="body2" color="text.secondary">Nenhuma mensalidade Pix registrada com esses filtros.</Typography>
      ) : null}

      {rows.length > 0 ? (
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Loja</TableCell>
                <TableCell>Competência</TableCell>
                <TableCell>Plano</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Acesso</TableCell>
                <TableCell>Pago em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.storeName || (row.signupId ? `Contratação ${row.signupId}` : '—')}</TableCell>
                  <TableCell>{row.competence}</TableCell>
                  <TableCell>{row.plan}</TableCell>
                  <TableCell align="right">{formatCurrency(Number(row.amount))}</TableCell>
                  <TableCell>{formatDay(row.dueDate)}</TableCell>
                  <TableCell title={row.reviewReason || undefined}>
                    {row.overdue ? 'Vencida' : (STATUS_LABEL[row.status] || row.status)}
                  </TableCell>
                  <TableCell>{ACCESS_LABEL[row.access] || '—'}</TableCell>
                  <TableCell>{row.paidAt ? formatDay(row.paidAt) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Paper>
  );
}

function Metric({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6">{value ?? '—'}</Typography>
    </Paper>
  );
}
