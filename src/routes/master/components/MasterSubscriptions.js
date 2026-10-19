import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import { SUBSCRIPTION_STATUS_LABELS, formatCurrency, formatDate } from '../../../services/accessControl';

const ACTION_LABEL = {
  SUSPEND: 'Suspensão',
  REACTIVATE: 'Reativação',
  EXEMPT: 'Isenção',
  STORE_CANCEL: 'Cancelamento da loja',
  ADMIN_CANCEL: 'Cancelamento administrativo',
};

function pendingLabel(row) {
  const parts = [];
  if (row.inviteMailPending) parts.push('Convite pendente');
  if (row.dueNoticePending) parts.push('Aviso de vencimento pendente');
  return parts.length ? parts.join(' · ') : '—';
}

function message(error, fallback) {
  const text = error?.response?.data?.message;
  return typeof text === 'string' && text.trim() ? text : fallback;
}

export function MasterSubscriptions() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    const response = await axios.get('/api/billing/subscriptions');
    setRows(response.data || []);
  }

  useEffect(() => {
    load().catch((failure) => setError(message(failure, 'Não foi possível carregar as assinaturas.')));
  }, []);

  async function openDetail(row) {
    setNotice('');
    setError('');
    if (!row.storeId) {
      setSelected(row);
      return;
    }
    const response = await axios.get(`/api/billing/subscriptions/${row.storeId}`);
    setSelected(response.data);
  }

  async function act(path, success) {
    if (!selected?.storeId) return;
    if (!reason.trim()) {
      setError('Informe o motivo.');
      return;
    }
    setError('');
    try {
      await axios.post(path, { reason: reason.trim() });
      setNotice(success);
      setReason('');
      await load();
      const response = await axios.get(`/api/billing/subscriptions/${selected.storeId}`);
      setSelected(response.data);
    } catch (failure) {
      setError(message(failure, 'A ação não foi concluída.'));
    }
  }

  async function resend() {
    if (!selected?.storeId) return;
    setError('');
    try {
      await axios.post(`/api/billing/subscriptions/${selected.storeId}/resend-invite`);
      setNotice('Convite reenviado.');
      const response = await axios.get(`/api/billing/subscriptions/${selected.storeId}`);
      setSelected(response.data);
    } catch (failure) {
      setError(message(failure, 'Não foi possível reenviar o convite.'));
    }
  }

  return (
    <>
      <PageHeader
        title="Assinaturas"
        description="Contratante, plano e cobrança de cada loja. Suspender restringe operação nova. Cancelar só encerra a renovação."
      />
      {error ? <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert> : null}
      {notice ? <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert> : null}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Loja</TableCell>
              <TableCell>Contratante</TableCell>
              <TableCell>Plano</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell>Próxima cobrança</TableCell>
              <TableCell>Pendência</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.signupId || 'loja'}-${row.storeId || 'sem-loja'}`} hover onClick={() => openDetail(row)} sx={{ cursor: 'pointer' }}>
                <TableCell>{row.storeName || 'Aguardando a loja'}</TableCell>
                <TableCell>{row.contractorName || '—'}</TableCell>
                <TableCell>{row.plan || '—'}</TableCell>
                <TableCell>{row.price == null ? '—' : formatCurrency(row.price)}</TableCell>
                <TableCell>{SUBSCRIPTION_STATUS_LABELS[row.status] || row.status}</TableCell>
                <TableCell>{formatDate(row.expiresAt)}</TableCell>
                <TableCell>{pendingLabel(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {selected ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">{selected.storeName || 'Contratação sem loja'}</Typography>
          <Typography variant="body2">Contratante: {selected.contractorName || '—'} · {selected.contractorEmail || '—'}</Typography>
          <Typography variant="body2">Asaas: {selected.asaasSubscriptionId || '—'} · Isenta: {selected.exempt ? 'sim' : 'não'}</Typography>
          {selected.inviteMailPending ? <Alert severity="warning" sx={{ mt: 1 }}>O convite ainda não foi entregue.</Alert> : null}
          {selected.dueNoticePending ? <Alert severity="warning" sx={{ mt: 1 }}>O aviso de vencimento ainda não foi entregue. O job diário tenta de novo.</Alert> : null}
          {selected.storeId ? (
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
              <TextField size="small" label="Motivo" value={reason} onChange={(event) => setReason(event.target.value)} />
              <Button variant="outlined" onClick={() => act(`/api/billing/subscriptions/${selected.storeId}/suspend`, 'Acesso suspenso para operação nova.')}>Suspender</Button>
              <Button variant="outlined" onClick={() => act(`/api/billing/subscriptions/${selected.storeId}/reactivate`, 'Acesso reativado após a conferência.')}>Reativar</Button>
              <Button variant="outlined" onClick={() => act(`/api/billing/subscriptions/${selected.storeId}/exempt`, 'Loja marcada como isenta, sem nova cobrança Asaas.')}>Marcar isenta</Button>
              <Button variant="contained" onClick={() => act(`/api/billing/subscriptions/${selected.storeId}/cancel`, 'Renovação encerrada. O acesso segue até o fim do ciclo pago.')}>Cancelar renovação</Button>
              <Button variant="text" onClick={resend}>Reenviar convite</Button>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ mt: 1 }}>A loja ainda não existe. O pagamento confirmado é que a cria.</Typography>
          )}
          {(selected.audits || []).length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Auditoria</Typography>
              {(selected.audits || []).map((audit) => (
                <Typography key={`${audit.action}-${audit.createdAt}`} variant="body2">
                  {ACTION_LABEL[audit.action] || audit.action} · {audit.reason} · {formatDate(audit.createdAt)}
                </Typography>
              ))}
            </Box>
          ) : null}
        </Box>
      ) : null}
    </>
  );
}
