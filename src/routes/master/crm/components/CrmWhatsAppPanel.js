import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { whatsappApi } from '../whatsappTemplate';

export function CrmWhatsAppOptOut({ lead, onBlocked }) {
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setBlocked(false); setError('');
    whatsappApi.get(`/leads/${lead.id}`).then(({ data }) => {
      if (active) { const value = Boolean(data.opted_out); setBlocked(value); onBlocked?.(value); }
    }).catch(() => { if (active) setError('Não foi possível consultar o bloqueio de contato.'); });
    return () => { active = false; };
  }, [lead.id, onBlocked]);
  const block = async () => {
    setBusy(true); setError('');
    try { await whatsappApi.post(`/leads/${lead.id}/opt-out`); setBlocked(true); onBlocked?.(true); }
    catch (e) { setError(e.response?.data?.message || 'Não foi possível registrar o bloqueio.'); }
    finally { setBusy(false); }
  };
  return <Box sx={{ mt: 2 }}>
    {error && <Alert severity="error">{error}</Alert>}
    {blocked ? <Alert severity="info">Não contatar pelo WhatsApp: bloqueio registrado.</Alert> :
      <Button color="error" disabled={busy} onClick={block}>Não contatar pelo WhatsApp</Button>}
  </Box>;
}

export function CrmWhatsAppPanel() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    whatsappApi.get('/template').then(({ data }) => { if (active) setMessage(data.message); })
      .catch(() => { if (active) setError('Não foi possível carregar a mensagem.'); });
    return () => { active = false; };
  }, []);
  const save = async () => {
    setBusy(true); setError(''); setNotice('');
    try { await whatsappApi.put('/template', { message }); setNotice('Mensagem salva para abrir as conversas pelo CRM.'); }
    catch (e) { setError(e.response?.data?.message || 'Não foi possível salvar a mensagem.'); }
    finally { setBusy(false); }
  };
  return <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
    <Typography variant="h6">Mensagem de primeiro contato no WhatsApp</Typography>
    <Typography variant="body2">
      Use {'{{estabelecimento}}'} e {'{{segmento}}'} para personalizar. Abra o WhatsApp pelo card (envio manual)
      ou enfileire contatos autorizados na fila automática abaixo.
    </Typography>
    {error && <Alert severity="error">{error}</Alert>}
    {notice && <Alert severity="success">{notice}</Alert>}
    <TextField fullWidth multiline minRows={3} label="Mensagem de primeiro contato" value={message} inputProps={{ maxLength: 2000 }} onChange={e => setMessage(e.target.value)} sx={{ my: 2 }} />
    <Stack direction="row"><Button disabled={busy || !message.trim()} onClick={save}>Salvar mensagem</Button></Stack>
  </Paper>;
}
