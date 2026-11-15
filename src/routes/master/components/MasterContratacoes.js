import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import '../../../services/apiConfig';
import { PageHeader } from '../../../commons/components/PageHeader';
import { PLANS, formatCurrency, formatPlanSummary } from '../../../services/accessControl';
import { operationalWhatsAppLink } from '../../../services/subscriptionLead';

const STATUS_LABEL = {
  CAPTURED: 'Lead capturado',
  CHECKOUT_STARTED: 'Checkout iniciado',
  PAYMENT_PENDING: 'Pagamento pendente',
  ABANDONED: 'Abandonado',
  CONVERTED: 'Convertido',
  LOST: 'Perdido',
};

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);
  return { from: isoDate(from), to: isoDate(to) };
}

function message(error, fallback) {
  const text = error?.response?.data?.message;
  return typeof text === 'string' && text.trim() ? text : fallback;
}

function formatWhen(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function MasterContratacoes() {
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = { from, to };
    if (plan) params.plan = plan;
    if (status) params.status = status;
    try {
      const [metricsResponse, listResponse] = await Promise.all([
        axios.get('/api/billing/leads/metrics', { params: { from, to, ...(plan ? { plan } : {}) } }),
        axios.get('/api/billing/leads', { params }),
      ]);
      setMetrics(metricsResponse.data);
      setRows(listResponse.data || []);
    } catch (requestError) {
      setError(message(requestError, 'Não foi possível carregar as contratações.'));
    } finally {
      setLoading(false);
    }
  }, [from, to, plan, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(row) {
    setSelected(row);
    setDetail(null);
    setNote('');
    setLostReason('');
    try {
      const response = await axios.get(`/api/billing/leads/${row.id}`);
      setDetail(response.data);
    } catch (requestError) {
      setNotice(message(requestError, 'Não foi possível abrir o lead.'));
    }
  }

  async function copyWhatsApp(row) {
    try {
      await navigator.clipboard.writeText(row.whatsapp);
      setNotice('WhatsApp copiado.');
    } catch {
      setNotice('Não foi possível copiar o WhatsApp.');
    }
  }

  async function saveNote() {
    if (!selected) return;
    setActing(true);
    try {
      await axios.post(`/api/billing/leads/${selected.id}/notes`, { text: note });
      setNote('');
      const response = await axios.get(`/api/billing/leads/${selected.id}`);
      setDetail(response.data);
      setNotice('Observação registrada.');
      await load();
    } catch (requestError) {
      setNotice(message(requestError, 'Não foi possível registrar a observação.'));
    } finally {
      setActing(false);
    }
  }

  async function markLost() {
    if (!selected) return;
    setActing(true);
    try {
      await axios.post(`/api/billing/leads/${selected.id}/lost`, { text: lostReason });
      const response = await axios.get(`/api/billing/leads/${selected.id}`);
      setDetail(response.data);
      setNotice('Oportunidade marcada como perdida. A cobrança no Asaas não foi cancelada.');
      await load();
    } catch (requestError) {
      setNotice(message(requestError, 'Não foi possível encerrar a oportunidade.'));
    } finally {
      setActing(false);
    }
  }

  async function revokeMarketing() {
    if (!selected) return;
    setActing(true);
    try {
      await axios.post(`/api/billing/leads/${selected.id}/marketing/revoke`);
      const response = await axios.get(`/api/billing/leads/${selected.id}`);
      setDetail(response.data);
      setNotice('Consentimento promocional revogado.');
      await load();
    } catch (requestError) {
      setNotice(message(requestError, 'Não foi possível revogar o consentimento.'));
    } finally {
      setActing(false);
    }
  }

  const lead = detail?.lead;
  const rate = metrics ? `${(Number(metrics.conversionRate) * 100).toFixed(1).replace('.', ',')}%` : '—';
  const cards = metrics ? [
    ['Leads capturados', metrics.leadsCaptured],
    ['Checkouts iniciados', metrics.checkoutsStarted],
    ['Pagamentos pendentes', metrics.paymentsPending],
    ['Assinaturas confirmadas', metrics.subscriptionsConfirmed],
    ['Abandonadas', metrics.abandoned],
    ['Conversão', rate],
    ['Receita mensal', formatCurrency(metrics.monthlyRecurringRevenue)],
  ] : [];

  return (
    <Box>
      <PageHeader
        title="Contratações"
        description="Leads que informaram nome e WhatsApp para assinar. O pagamento só conta como convertido quando o Asaas confirma no servidor."
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField label="De" type="date" size="small" value={from} onChange={(event) => setFrom(event.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Até" type="date" size="small" value={to} onChange={(event) => setTo(event.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Plano" size="small" select value={plan} onChange={(event) => setPlan(event.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">Todos</MenuItem>
          {Object.values(PLANS).map((item) => (
            <MenuItem key={item.id} value={item.id}>{formatPlanSummary(item.id)}</MenuItem>
          ))}
        </TextField>
        <TextField label="Situação" size="small" select value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {notice ? <Alert severity="info" sx={{ mb: 2 }} onClose={() => setNotice('')}>{notice}</Alert> : null}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1.5, mb: 2 }}>
        {cards.map(([label, value]) => (
          <Paper key={label} elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="h6">{value}</Typography>
          </Paper>
        ))}
      </Box>
      {metrics?.definition ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{metrics.definition}</Typography>
      ) : null}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>WhatsApp</TableCell>
              <TableCell>Plano</TableCell>
              <TableCell>Mensalidade</TableCell>
              <TableCell>Cadastro</TableCell>
              <TableCell>Origem</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell>Atualização</TableCell>
              <TableCell>Promocional</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>Nenhuma contratação neste período.</TableCell>
              </TableRow>
            ) : null}
            {rows.map((row) => {
              const link = row.anonymized ? '' : operationalWhatsAppLink(row.name, row.whatsapp);
              return (
                <TableRow key={row.id} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.anonymized ? '—' : row.whatsapp}</TableCell>
                  <TableCell>{formatPlanSummary(row.planCode)}</TableCell>
                  <TableCell>{formatCurrency(row.monthlyPrice)}</TableCell>
                  <TableCell>{formatWhen(row.createdAt)}</TableCell>
                  <TableCell>{row.origin || 'direto'}</TableCell>
                  <TableCell><Chip size="small" label={STATUS_LABEL[row.status] || row.status} /></TableCell>
                  <TableCell>{formatWhen(row.updatedAt)}</TableCell>
                  <TableCell>{row.marketingOptIn ? 'Autorizado' : 'Não autorizado'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openDetail(row)}>Detalhes</Button>
                      <Button size="small" disabled={row.anonymized} onClick={() => copyWhatsApp(row)}>Copiar</Button>
                      <Button
                        size="small"
                        disabled={!link}
                        component={link ? 'a' : 'button'}
                        href={link || undefined}
                        target={link ? '_blank' : undefined}
                        rel={link ? 'noreferrer' : undefined}
                      >
                        WhatsApp
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Contratação</DialogTitle>
        <DialogContent>
          {!lead ? <Typography>Carregando…</Typography> : (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography><strong>{lead.name}</strong> · {lead.anonymized ? 'dados removidos' : lead.whatsapp}</Typography>
              <Typography>{formatPlanSummary(lead.planCode)} · {formatCurrency(lead.monthlyPrice)}</Typography>
              <Typography>Situação: {STATUS_LABEL[lead.status] || lead.status}</Typography>
              <Typography variant="body2" color="text.secondary">
                {lead.marketingOptIn
                  ? 'Autorizou contato promocional.'
                  : 'Não autorizou contato promocional. O WhatsApp abaixo é só sobre esta contratação.'}
              </Typography>
              {lead.status === 'PAYMENT_PENDING' ? (
                <Alert severity="warning">Há uma cobrança ainda não confirmada. Isso não é abandono nem conversão.</Alert>
              ) : null}
              <Typography variant="subtitle2">Histórico</Typography>
              {(detail.history || []).map((event) => (
                <Typography key={event.id} variant="body2">
                  {formatWhen(event.createdAt)} · {STATUS_LABEL[event.toStatus] || event.eventType}
                  {event.note ? ` — ${event.note}` : ''}
                </Typography>
              ))}
              <TextField label="Observação" value={note} onChange={(event) => setNote(event.target.value)} fullWidth multiline minRows={2} />
              <Button variant="outlined" disabled={acting || note.trim().length < 3} onClick={saveNote}>Registrar observação</Button>
              {lead.status !== 'CONVERTED' && !lead.anonymized ? (
                <>
                  <TextField label="Motivo para marcar como perdida" value={lostReason} onChange={(event) => setLostReason(event.target.value)} fullWidth />
                  <Button color="warning" variant="outlined" disabled={acting || lostReason.trim().length < 3} onClick={markLost}>
                    Marcar como perdida
                  </Button>
                </>
              ) : null}
              {lead.marketingOptIn ? (
                <Button variant="text" disabled={acting} onClick={revokeMarketing}>Revogar consentimento promocional</Button>
              ) : null}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
