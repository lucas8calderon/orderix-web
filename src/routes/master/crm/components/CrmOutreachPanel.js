import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { outreachApi } from '../outreachApi';

const METRICS = [
  { key: 'leadsFound', label: 'Encontrados' },
  { key: 'leadsEligible', label: 'Elegíveis' },
  { key: 'messagesScheduled', label: 'Agendadas' },
  { key: 'messagesSent', label: 'Enviadas' },
  { key: 'failures', label: 'Falhas' },
  { key: 'replies', label: 'Respostas' },
  { key: 'interested', label: 'Interessados' },
  { key: 'conversions', label: 'Conversões' },
];

function Metric({ label, value }) {
  return (
    <Box sx={{ minWidth: 88 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
        {value ?? 0}
      </Typography>
    </Box>
  );
}

export function CrmOutreachPanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await outreachApi.get('/status');
      setStatus(data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Não foi possível carregar a fila automática.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action, successMessage) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { data } = await outreachApi.post(action);
      setStatus(data);
      setNotice(successMessage);
    } catch (e) {
      setError(e.response?.data?.message || 'Não foi possível atualizar a fila.');
    } finally {
      setBusy(false);
    }
  };

  const enqueue = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { data } = await outreachApi.post('/enqueue?limit=20');
      setStatus(data);
      setNotice(`${data.enqueued ?? 0} contato(s) autorizados enfileirados (sem disparo real se o provedor estiver desativado).`);
    } catch (e) {
      setError(e.response?.data?.message || 'Não foi possível montar a fila.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Fila automática de prospecção</Typography>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        Intervalo global de 60 minutos. Só envia para contatos com autorização válida.
        O disparo permanece desligado enquanto o provedor não autorizar envio automático
        (WhatsApp Web local não envia).
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 1 }}>{notice}</Alert>}
      {status && (
        <>
          <Alert severity={status.dispatchActive ? 'success' : 'info'} sx={{ mb: 1.5 }}>
            Provedor: {status.providerId}
            {status.dispatchActive
              ? ' — disparo ativo'
              : ' — disparo desativado (fila e métricas disponíveis)'}
            {status.authPaused ? ' · pausado por falha de autenticação' : ''}
            {status.paused ? ' · pausado manualmente' : ''}
          </Alert>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', mb: 2 }}>
            {METRICS.map((item) => (
              <Metric key={item.key} label={item.label} value={status[item.key]} />
            ))}
          </Stack>
        </>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
        <Button disabled={busy} variant="contained" onClick={() => run('/start', 'Fila iniciada.')}>
          Iniciar
        </Button>
        <Button disabled={busy} onClick={() => run('/pause', 'Fila pausada.')}>Pausar</Button>
        <Button disabled={busy} onClick={() => run('/resume', 'Fila retomada.')}>Retomar</Button>
        <Button disabled={busy} onClick={enqueue}>Enfileirar elegíveis</Button>
        <Button disabled={busy} onClick={load}>Atualizar</Button>
      </Stack>
    </Paper>
  );
}
