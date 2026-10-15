import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import { whatsappApi, openWhatsAppLead } from '../whatsappTemplate';

const labels = { QUEUED: 'Na fila', OPENED: 'Link aberto — envio não confirmado', CONFIRMED: 'Envio confirmado manualmente', BLOCKED: 'Bloqueado' };

export function CrmWhatsAppQualification({ lead }) {
  const [phone, setPhone] = useState('');
  const [provenance, setProvenance] = useState('');
  const [permission, setPermission] = useState(false);
  const [independent, setIndependent] = useState(false);
  const [contact, setContact] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const { data } = await whatsappApi.get(`/leads/${lead.id}`);
    setContact(data); setPhone(data.phone || ''); setProvenance(data.provenance || '');
  };
  useEffect(() => {
    let active = true;
    setPhone(''); setProvenance(''); setPermission(false); setIndependent(false); setError('');
    whatsappApi.get(`/leads/${lead.id}`).then(({ data }) => {
      if (active) { setContact(data); setPhone(data.phone || ''); setProvenance(data.provenance || ''); }
    }).catch(() => { if (active) setError('Não foi possível carregar a autorização.'); });
    return () => { active = false; };
  }, [lead.id]);
  const run = async (action) => {
    setBusy(true); setError('');
    try { await action(); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Não foi possível salvar.'); }
    finally { setBusy(false); }
  };
  return <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2">Autorização para WhatsApp</Typography>
    <Typography variant="body2">Qualificado: {contact.qualified ? 'sim' : 'não'} · Opt-out: {contact.opted_out ? 'sim' : 'não'}</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    <Stack spacing={1} sx={{ mt: 1 }}>
      <TextField label="Telefone de fonte independente (DDI e DDD)" value={phone} disabled={Boolean(contact.phone)} onChange={e => setPhone(e.target.value)} />
      <TextField label="Fonte e registro da autorização" value={provenance} inputProps={{ maxLength: 500 }} onChange={e => setProvenance(e.target.value)} />
      <FormControlLabel control={<Checkbox checked={permission} onChange={e => setPermission(e.target.checked)} />} label="Tenho autorização para este contato no WhatsApp" />
      <FormControlLabel control={<Checkbox checked={independent} onChange={e => setIndependent(e.target.checked)} />} label="Telefone obtido independentemente do Google Places" />
      <Button disabled={busy || contact.opted_out || !permission || !independent} onClick={() => run(() => whatsappApi.put(`/leads/${lead.id}`, { phone, provenance, qualified: true, permissionConfirmed: permission, independentSourceConfirmed: independent }))}>Qualificar para a fila</Button>
      <Button color="error" disabled={busy || contact.opted_out} onClick={() => run(() => whatsappApi.post(`/leads/${lead.id}/opt-out`))}>Registrar opt-out / não contatar</Button>
      <Typography variant="caption">O opt-out é permanente nesta integração e prevalece sobre a qualificação. Nenhum envio é automático.</Typography>
    </Stack>
  </Box>;
}

export function CrmWhatsAppPanel({ onChanged, onOpenLead }) {
  const [queue, setQueue] = useState({ items: [] });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const load = async () => { const { data } = await whatsappApi.get('/queue'); setQueue(data); };
  useEffect(() => {
    Promise.all([whatsappApi.get('/queue'), whatsappApi.get('/template')]).then(([q,t]) => {
      setQueue(q.data); setMessage(t.data.message);
    }).catch(() => setError('Não foi possível carregar o painel WhatsApp.'));
  }, []);
  const run = async (action) => {
    setBusy(true); setError(''); setNotice('');
    try { await action(); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Não foi possível concluir a ação.'); }
    finally { setBusy(false); }
  };
  return <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
    <Typography variant="h6">WhatsApp — fila diária</Typography>
    <Typography variant="body2">{queue.day} · {queue.allocated || 0}/15 vagas utilizadas · {queue.confirmed || 0} envios confirmados · horário de Brasília</Typography>
    <Typography variant="body2">Qualifique os leads em Detalhes. Abrir o link apenas preenche a mensagem; envie no WhatsApp e depois confirme aqui.</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    {notice && <Alert severity="success">{notice}</Alert>}
    <TextField fullWidth multiline minRows={3} label="Mensagem de parceria gratuita" value={message} inputProps={{ maxLength: 2000 }} onChange={e => setMessage(e.target.value)} sx={{ my: 2 }} />
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button disabled={busy || !message.trim()} onClick={() => run(async () => { await whatsappApi.put('/template', { message }); setNotice('Template salvo para as próximas entradas na fila.'); })}>Salvar template</Button>
      <Button variant="contained" disabled={busy} onClick={() => run(async () => { const { data } = await whatsappApi.post('/queue'); setQueue(data); })}>Gerar/completar fila de hoje</Button>
      <Button disabled={busy} onClick={() => run(load)}>Atualizar</Button>
    </Stack>
    {!queue.items.length && <Typography sx={{ mt: 2 }}>Nenhum lead na fila de hoje.</Typography>}
    {queue.items.map(item => <Box key={item.id} sx={{ mt: 2, borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
      <Typography>Lead #{item.lead_id} · {labels[item.state]}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{item.message}</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button onClick={() => onOpenLead(item.lead_id)}>Detalhes e histórico</Button>
        <Button disabled={busy || !['QUEUED', 'OPENED'].includes(item.state)} onClick={() => run(async () => { await openWhatsAppLead(item.lead_id, true); })}>Abrir WhatsApp</Button>
        <Button disabled={busy || item.state !== 'OPENED'} onClick={() => setConfirming(item.lead_id)}>Confirmar envio</Button>
      </Stack>
      {confirming === item.lead_id && <Alert severity="info" action={<Stack direction="row"><Button disabled={busy} onClick={() => run(async () => { await whatsappApi.post(`/leads/${item.lead_id}/confirm`); setConfirming(null); await onChanged(); })}>Sim, enviei</Button><Button onClick={() => setConfirming(null)}>Cancelar</Button></Stack>}>Você enviou esta mensagem manualmente no WhatsApp?</Alert>}
    </Box>)}
  </Paper>;
}
