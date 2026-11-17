import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '../../../commons/components/PageHeader';
import { formatCurrency } from '../../../services/accessControl';
import {
  blockPartnerPayouts,
  confirmManualPayout,
  downloadFinanceCsv,
  getFinanceRows,
  getFinanceSummary,
  getGatewaySettings,
  openManualPayout,
  saveGatewaySettings,
  startSaasMercadoPagoOAuth,
  testGatewayConnection,
  testSaasMercadoPago,
  updatePartnerPercent,
  disconnectSaasMercadoPagoOAuth,
} from '../service/financeAdminService';
import { AUTOMATIC_PAYOUT_REASON, FIRST_MONTH_PERCENT, PERCENT_OPTIONS, mercadoPagoAccountLabel, mercadoPagoConnectView, recurringLabel } from '../finance/financeModel';

const emptyGateway = {
  activeGateway: 'ASAAS',
  integrationStatus: '—',
  environment: '—',
  credentialsStatus: '—',
  manualApprovalEnabled: true,
  automaticPayoutAvailable: false,
  defaultRecurringPercent: 20,
  clearanceDays: 0,
  firstMonthPercent: '100',
};

function messageOf(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function MasterFinance() {
  const [gateway, setGateway] = useState(emptyGateway);
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [percentTarget, setPercentTarget] = useState(null);
  const [percentValue, setPercentValue] = useState('20');
  const [payoutTarget, setPayoutTarget] = useState(null);
  const [commissionId, setCommissionId] = useState('');
  const [pixIdentifier, setPixIdentifier] = useState('');
  const [receiptRef, setReceiptRef] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        partnerId: partnerId || undefined,
        from: from || undefined,
        to: to || undefined,
      };
      const [settings, totals, table] = await Promise.all([
        getGatewaySettings(),
        getFinanceSummary(),
        getFinanceRows(params),
      ]);
      setGateway(settings);
      setSummary(totals);
      setRows(Array.isArray(table) ? table : []);
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível carregar o financeiro.'));
    } finally {
      setLoading(false);
    }
  }, [partnerId, from, to]);

  useEffect(() => { load(); }, [load]);

  const saveGateway = async () => {
    setBusy(true);
    setNotice('');
    try {
      const saved = await saveGatewaySettings({
        activeGateway: gateway.activeGateway,
        manualApprovalEnabled: gateway.manualApprovalEnabled,
        automaticPayoutEnabled: false,
        defaultRecurringPercent: gateway.defaultRecurringPercent,
        clearanceDays: Number(gateway.clearanceDays),
      });
      setGateway(saved);
      setNotice('Configuração salva. Assinaturas já criadas continuam no gateway de origem.');
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível salvar.'));
    } finally {
      setBusy(false);
    }
  };

  const testConnection = async () => {
    setBusy(true);
    try {
      setGateway(await testGatewayConnection());
      setNotice('Teste de conexão concluído.');
    } catch (failure) {
      setError(messageOf(failure, 'O teste de conexão falhou.'));
    } finally {
      setBusy(false);
    }
  };

  const savePercent = async () => {
    setBusy(true);
    try {
      await updatePartnerPercent(percentTarget.partnerId, Number(percentValue), 'Alteração no painel financeiro');
      setPercentTarget(null);
      setNotice('Percentual atualizado. Vale só para comissões que ainda não foram constituídas.');
      await load();
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível alterar o percentual.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmPayout = async () => {
    setBusy(true);
    try {
      const opened = await openManualPayout(payoutTarget.partnerId, Number(commissionId), crypto.randomUUID());
      await confirmManualPayout(opened.id, pixIdentifier, receiptRef);
      setPayoutTarget(null);
      setNotice('Repasse confirmado depois do identificador do Pix.');
      await load();
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível confirmar o repasse.'));
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    const blob = await downloadFinanceCsv({
      partnerId: partnerId || undefined,
      from: from || undefined,
      to: to || undefined,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'comissoes-parceiros.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Financeiro"
        description="Gateway das novas assinaturas e comissões dos parceiros. Os números vêm dos registros persistidos."
      />
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
      {loading && <Typography>Carregando financeiro…</Typography>}

      {!loading && (
        <>
          <Paper sx={{ p: 3, borderRadius: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Gateways de pagamento</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              O gateway ativo vale só para contratações novas. Uma falha não troca sozinha para o outro.
            </Typography>
            <RadioGroup
              value={gateway.activeGateway || 'ASAAS'}
              onChange={(event) => setGateway((current) => ({ ...current, activeGateway: event.target.value }))}
            >
              <FormControlLabel value="ASAAS" control={<Radio />} label="Asaas" />
              <FormControlLabel value="MERCADO_PAGO" control={<Radio />} label="Mercado Pago" />
            </RadioGroup>
            <MercadoPagoSaasConnect gateway={gateway} disabled={busy} onReload={load} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, my: 2 }}>
              <Info label="Integração" value={gateway.integrationStatus} />
              <Info label="Ambiente" value={gateway.environment} />
              <Info label="Credenciais" value={gateway.credentialsStatus} />
              <Info label="Última sincronização" value={formatWhen(gateway.lastSyncAt)} />
              <Info label="Último teste" value={gateway.lastTestOk == null ? '—' : (gateway.lastTestOk ? 'ok' : 'falhou')} />
              <Info label="Última alteração" value={`${formatWhen(gateway.updatedAt)} · usuário ${gateway.updatedByUserId || '—'}`} />
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button variant="contained" disabled={busy} onClick={saveGateway} sx={{ backgroundColor: 'var(--color-primary)' }}>Salvar</Button>
              <Button variant="outlined" disabled={busy} onClick={testConnection}>Testar conexão</Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2.5 }}>
            <Typography variant="h6">Configurações de comissões</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>Primeira mensalidade: {FIRST_MONTH_PERCENT}% do líquido. Isso é regra de negócio e não muda.</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Recorrente padrão (%)"
                type="number"
                value={gateway.defaultRecurringPercent ?? 20}
                onChange={(event) => setGateway((current) => ({ ...current, defaultRecurringPercent: event.target.value }))}
              />
              <TextField
                label="Prazo de segurança (dias)"
                type="number"
                value={gateway.clearanceDays ?? 0}
                onChange={(event) => setGateway((current) => ({ ...current, clearanceDays: event.target.value }))}
              />
            </Stack>
            <Typography variant="body2" sx={{ mt: 2 }}>Base de cálculo: valor líquido (bruto − taxa do gateway), arredondamento HALF_UP.</Typography>
            <Typography variant="body2">A comissão nasce só depois do pagamento confirmado e do prazo de segurança.</Typography>
            <Typography variant="body2">Aprovação manual: {gateway.manualApprovalEnabled ? 'ligada' : 'desligada'}.</Typography>
            <Alert severity="info" sx={{ mt: 2 }}>{gateway.automaticPayoutReason || AUTOMATIC_PAYOUT_REASON}</Alert>
          </Paper>

          {summary && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              <Metric label="Parceiros" value={summary.partners} />
              <Metric label="Aprovados" value={summary.approvedPartners} />
              <Metric label="Clientes indicados" value={summary.referredClients} />
              <Metric label="Assinaturas ativas" value={summary.activeSubscriptions} />
              <Metric label="Receita de indicações" value={formatCurrency(summary.referralRevenue)} />
              <Metric label="Comissões pendentes" value={formatCurrency(summary.pendingCommissions)} />
              <Metric label="Disponíveis" value={formatCurrency(summary.availableCommissions)} />
              <Metric label="Pagas" value={formatCurrency(summary.paidCommissions)} />
              <Metric label="Repasses com falha" value={summary.failedPayouts} />
            </Box>
          )}

          <Paper sx={{ p: 2, borderRadius: 2.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }}>
              <TextField label="Parceiro (id)" value={partnerId} onChange={(event) => setPartnerId(event.target.value)} />
              <TextField label="De" type="date" value={from} onChange={(event) => setFrom(event.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Até" type="date" value={to} onChange={(event) => setTo(event.target.value)} InputLabelProps={{ shrink: true }} />
              <Button variant="outlined" onClick={load}>Filtrar</Button>
              <Button variant="outlined" onClick={exportCsv}>Exportar CSV</Button>
            </Stack>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Parceiro', 'Clientes ativos', 'Comissão %', 'Receita bruta', 'Líquido', 'Comissão', 'A receber', 'Total pago', 'Status', ''].map((title) => (
                      <TableCell key={title}>{title}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow><TableCell colSpan={10}>Nenhum parceiro neste filtro.</TableCell></TableRow>
                  )}
                  {rows.map((row) => (
                    <TableRow key={row.partnerId}>
                      <TableCell>{row.partnerName}</TableCell>
                      <TableCell>{row.activeClients}</TableCell>
                      <TableCell>{recurringLabel(row.recurringPercent, row.customPercent)}</TableCell>
                      <TableCell>{formatCurrency(row.grossRevenue)}</TableCell>
                      <TableCell>{formatCurrency(row.netRevenue)}</TableCell>
                      <TableCell>{formatCurrency(row.commission)}</TableCell>
                      <TableCell>{formatCurrency(row.receivable)}</TableCell>
                      <TableCell>{formatCurrency(row.paid)}</TableCell>
                      <TableCell>{row.payoutsBlocked ? 'repasses bloqueados' : row.status}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => { setPercentTarget(row); setPercentValue(String(row.recurringPercent ?? 20)); }}>Percentual</Button>
                        <Button size="small" onClick={() => setPayoutTarget(row)}>Repasse</Button>
                        <Button size="small" onClick={() => blockPartnerPayouts(row.partnerId, !row.payoutsBlocked).then(load)}>
                          {row.payoutsBlocked ? 'Desbloquear' : 'Bloquear'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </>
      )}

      <Dialog open={Boolean(percentTarget)} onClose={() => setPercentTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Percentual recorrente</DialogTitle>
        <DialogContent>
          <TextField select fullWidth sx={{ mt: 1 }} label="Percentual" value={percentValue} onChange={(event) => setPercentValue(event.target.value)}>
            {PERCENT_OPTIONS.map((option) => <MenuItem key={option} value={String(option)}>{option}%</MenuItem>)}
            <MenuItem value={percentValue}>Personalizado ({percentValue}%)</MenuItem>
          </TextField>
          <TextField fullWidth sx={{ mt: 2 }} label="Personalizado" type="number" value={percentValue} onChange={(event) => setPercentValue(event.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPercentTarget(null)}>Cancelar</Button>
          <Button variant="contained" disabled={busy} onClick={savePercent}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(payoutTarget)} onClose={() => setPayoutTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Aprovar repasse manual</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>O repasse só fica pago depois do identificador real do Pix.</Typography>
          <TextField fullWidth label="Id da comissão disponível" value={commissionId} onChange={(event) => setCommissionId(event.target.value)} />
          <TextField fullWidth sx={{ mt: 2 }} label="Identificador do Pix" value={pixIdentifier} onChange={(event) => setPixIdentifier(event.target.value)} />
          <TextField fullWidth sx={{ mt: 2 }} label="Comprovante" value={receiptRef} onChange={(event) => setReceiptRef(event.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutTarget(null)}>Cancelar</Button>
          <Button variant="contained" disabled={busy} onClick={confirmPayout}>Confirmar Pix</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function MercadoPagoSaasConnect({ gateway, disabled, onReload }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const view = mercadoPagoConnectView(gateway);
  const label = mercadoPagoAccountLabel(gateway);

  const connect = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await startSaasMercadoPagoOAuth();
      if (!response?.url) throw new Error('missing url');
      window.location.assign(response.url);
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível abrir o Mercado Pago. Tente de novo.'));
      setBusy(false);
    }
  };

  const testAccount = async () => {
    setBusy(true);
    setError('');
    try {
      await testSaasMercadoPago();
      await onReload();
    } catch (failure) {
      setError(messageOf(failure, 'O teste da conta Weper falhou.'));
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm('Desconectar o Mercado Pago da Weper? Novas assinaturas por esse gateway ficam indisponíveis até conectar de novo. Assinaturas já criadas não são canceladas.')) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await disconnectSaasMercadoPagoOAuth();
      await onReload();
    } catch (failure) {
      setError(messageOf(failure, 'Não foi possível desconectar. Tente de novo.'));
    } finally {
      setBusy(false);
    }
  };

  if (!view.visible) return null;

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Conta Mercado Pago da Weper</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Esta conexão cobra as assinaturas da plataforma. Não é a conta de delivery de uma loja e não pede Access Token, Public Key nem segredo de webhook.
      </Typography>
      {view.connected ? (
        <>
          <Alert severity="success">
            Mercado Pago conectado{label ? ` (${label})` : ''}. Salve com Mercado Pago marcado para as assinaturas novas caírem nessa conta.
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <Button type="button" variant="outlined" onClick={testAccount} disabled={busy || disabled}>
              {busy ? 'Testando...' : 'Testar conexão'}
            </Button>
            <Button type="button" variant="outlined" onClick={connect} disabled={busy || disabled || view.buttonDisabled}>
              Reconectar
            </Button>
            <Button type="button" variant="outlined" color="error" onClick={disconnect} disabled={busy || disabled}>
              {busy ? 'Desconectando...' : 'Desconectar'}
            </Button>
          </Stack>
        </>
      ) : (
        <>
          {!view.buttonDisabled ? null : (
            <Alert severity="warning" sx={{ mb: 1 }}>{view.unavailableMessage}</Alert>
          )}
          <Button
            type="button"
            variant="contained"
            onClick={connect}
            disabled={busy || disabled || view.buttonDisabled}
            sx={{ bgcolor: '#009EE3', '&:hover': { bgcolor: '#0087C2' } }}
          >
            {busy ? 'Abrindo o Mercado Pago...' : 'Conectar Mercado Pago'}
          </Button>
        </>
      )}
      {error ? <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert> : null}
    </Box>
  );
}

function Info({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value || '—'}</Typography>
    </Box>
  );
}

function Metric({ label, value }) {
  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6">{value ?? '—'}</Typography>
    </Paper>
  );
}

function formatWhen(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('pt-BR');
}
