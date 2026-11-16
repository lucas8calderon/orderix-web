import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { fromDateTimeLocalValue, instagramOutreachLabel, leadKindLabel } from '../crmConstants';
import { INSTAGRAM_DIRECT_HINT } from '../instagram';
import {
  confirmCrmInstagramSend,
  prepareCrmInstagram,
  recordCrmInstagramEvent,
  registerCrmInstagramResponse,
  scheduleCrmInstagramFollowUp,
} from '../service/crmService';

export function CrmInstagramOutreachDialog({ open, lead, onClose, onUpdated }) {
  const dialogProps = useDialogResponsiveProps();
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [armed, setArmed] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');

  useEffect(() => {
    if (!open || !lead?.id) return undefined;
    let active = true;
    setPreview(null);
    setMessage('');
    setError('');
    setNotice('');
    setArmed(false);
    setResponseNotes('');
    setFollowUpAt('');
    prepareCrmInstagram(lead.id)
      .then(({ data }) => {
        if (!active) return;
        setPreview(data);
        setMessage(data?.message || '');
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Não foi possível preparar a mensagem.');
      });
    return () => {
      active = false;
    };
  }, [open, lead?.id]);

  const applyLead = (updated) => {
    if (!updated) return;
    setPreview((current) => (current ? {
      ...current,
      outreachStatus: updated.instagramOutreachStatus || current.outreachStatus,
      outreachStatusLabel: updated.instagramOutreachStatusLabel || current.outreachStatusLabel,
    } : current));
    onUpdated?.(updated);
  };

  const copyMessage = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Não foi possível copiar automaticamente.');
      await navigator.clipboard.writeText(message);
      const { data } = await recordCrmInstagramEvent(lead.id, 'COPIED');
      applyLead(data);
      setNotice('Mensagem copiada. Cole no Instagram. Isso ainda não é envio.');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Não foi possível copiar a mensagem.');
    } finally {
      setBusy(false);
    }
  };

  const openDirect = async () => {
    const url = preview?.directUrl;
    if (!url || url.includes('?') || /[?&]text=/.test(url)) {
      setError('O link do Direct está inválido.');
      return;
    }
    const tab = window.open(url, '_blank', 'noopener,noreferrer');
    if (!tab) {
      setError('Permita pop-ups para abrir o Instagram.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await recordCrmInstagramEvent(lead.id, 'OPENED');
      applyLead(data);
      setNotice('Direct aberto sem texto preenchido. Isso não conta como enviado.');
    } catch (err) {
      setError(err?.response?.data?.message || 'O Direct foi aberto, mas o histórico não foi registrado.');
    } finally {
      setBusy(false);
    }
  };

  const openProfile = () => {
    const url = preview?.profileUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const confirmSent = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await confirmCrmInstagramSend(lead.id);
      applyLead(data);
      setArmed(false);
      setNotice('Envio confirmado no histórico do Instagram.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível confirmar o envio.');
    } finally {
      setBusy(false);
    }
  };

  const registerResponse = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await registerCrmInstagramResponse(lead.id, responseNotes.trim());
      applyLead(data);
      setNotice('Resposta registrada no histórico do Instagram.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível registrar a resposta.');
    } finally {
      setBusy(false);
    }
  };

  const scheduleFollowUp = async () => {
    const dueAt = fromDateTimeLocalValue(followUpAt);
    if (!dueAt) {
      setError('Informe a data do follow-up.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await scheduleCrmInstagramFollowUp(lead.id, { dueAt, actionType: 'FOLLOW_UP' });
      applyLead(data);
      setNotice('Follow-up de Instagram agendado.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível agendar o follow-up.');
    } finally {
      setBusy(false);
    }
  };

  const kind = preview?.leadKind || lead?.leadKind;
  const statusLabel = preview?.outreachStatusLabel
    || instagramOutreachLabel(preview?.outreachStatus || lead?.instagramOutreachStatus);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" {...dialogProps}>
      <DialogTitle>Mensagem no Instagram</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
          <Chip size="small" label={preview?.leadKindLabel || leadKindLabel(kind)} />
          <Chip size="small" variant="outlined" label={statusLabel} />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {preview?.directHint || INSTAGRAM_DIRECT_HINT}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        {notice && <Alert severity="success" sx={{ mb: 1.5 }}>{notice}</Alert>}
        <TextField
          fullWidth
          multiline
          minRows={8}
          label="Mensagem"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          helperText={preview?.username ? `@${preview.username}` : 'Edite antes de copiar. O texto não vai no link.'}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            disabled={busy || !message.trim()}
            onClick={copyMessage}
            sx={{ textTransform: 'none', backgroundColor: 'var(--color-primary)', '&:hover': { backgroundColor: 'var(--color-primary-dark)' } }}
          >
            Copiar mensagem
          </Button>
          <Button variant="outlined" disabled={busy || !preview?.directUrl} onClick={openDirect} sx={{ textTransform: 'none' }}>
            Abrir Direct
          </Button>
          <Button variant="text" disabled={!preview?.profileUrl} onClick={openProfile} sx={{ textTransform: 'none' }}>
            Abrir perfil
          </Button>
        </Stack>
        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          {!armed ? (
            <Button variant="outlined" disabled={busy} onClick={() => setArmed(true)} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
              Marcar como enviado
            </Button>
          ) : (
            <Button variant="contained" color="success" disabled={busy} onClick={confirmSent} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
              Confirmo que enviei no Direct
            </Button>
          )}
          <TextField
            fullWidth
            size="small"
            label="Resposta recebida"
            value={responseNotes}
            onChange={(event) => setResponseNotes(event.target.value)}
            placeholder="Opcional: o que a pessoa respondeu"
          />
          <Button variant="outlined" disabled={busy} onClick={registerResponse} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
            Registrar resposta
          </Button>
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Follow-up"
            InputLabelProps={{ shrink: true }}
            value={followUpAt}
            onChange={(event) => setFollowUpAt(event.target.value)}
          />
          <Button variant="outlined" disabled={busy} onClick={scheduleFollowUp} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
            Agendar follow-up
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
