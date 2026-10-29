import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { kindLabel, renderProspectMessage } from '../instagramCrm';

const STAGES = {
  FIRST_CONTACT: 'Primeiro contato',
  FIRST_FOLLOW_UP: 'Primeiro follow-up',
  LAST_ATTEMPT: 'Última tentativa',
};

export function InstagramTemplatesDialog({
  open,
  templates,
  settings,
  onClose,
  onSave,
  onRestore,
  onSaveSettings,
  saving,
}) {
  const [drafts, setDrafts] = useState({});
  const [days, setDays] = useState({ firstFollowUpDays: 3, lastAttemptDays: 2 });
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    if (!open) return;
    const next = {};
    (templates || []).forEach((item) => {
      next[item.id] = item.content;
    });
    setDrafts(next);
    setDays({
      firstFollowUpDays: settings?.firstFollowUpDays || 3,
      lastAttemptDays: settings?.lastAttemptDays || 2,
    });
  }, [open, templates, settings]);

  const preview = (templates || []).find((item) => item.id === previewId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Templates de mensagens</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use {'{nome}'} e {'{instagram}'} quando quiser. A edição no card não muda o modelo global.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            label="Dias até o primeiro follow-up"
            type="number"
            value={days.firstFollowUpDays}
            onChange={(event) => setDays((prev) => ({ ...prev, firstFollowUpDays: Number(event.target.value) }))}
            inputProps={{ min: 1, max: 30 }}
          />
          <TextField
            label="Dias até a última tentativa"
            type="number"
            value={days.lastAttemptDays}
            onChange={(event) => setDays((prev) => ({ ...prev, lastAttemptDays: Number(event.target.value) }))}
            inputProps={{ min: 1, max: 30 }}
          />
          <Button onClick={() => onSaveSettings(days)} disabled={saving} sx={{ textTransform: 'none' }}>
            Salvar prazos
          </Button>
        </Stack>
        <Stack spacing={2}>
          {(templates || []).map((item) => (
            <BoxTemplate
              key={item.id}
              item={item}
              value={drafts[item.id] || ''}
              onChange={(value) => setDrafts((prev) => ({ ...prev, [item.id]: value }))}
              onSave={() => onSave(item.id, drafts[item.id])}
              onRestore={() => onRestore(item.id)}
              onPreview={() => setPreviewId(item.id)}
              saving={saving}
            />
          ))}
        </Stack>
        {preview && (
          <BoxPreview text={renderProspectMessage(drafts[preview.id], 'Hamburgueria Exemplo', '@hamburgueria_exemplo')} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

function BoxTemplate({ item, value, onChange, onSave, onRestore, onPreview, saving }) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {kindLabel(item.leadKind)} · {STAGES[item.contactStage] || item.contactStage}
      </Typography>
      <TextField multiline minRows={4} value={value} onChange={(event) => onChange(event.target.value)} />
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={onSave} disabled={saving} sx={{ textTransform: 'none' }}>Salvar</Button>
        <Button size="small" onClick={onRestore} disabled={saving} sx={{ textTransform: 'none' }}>Restaurar padrão</Button>
        <Button size="small" onClick={onPreview} sx={{ textTransform: 'none' }}>Prévia</Button>
      </Stack>
    </Stack>
  );
}

function BoxPreview({ text }) {
  return (
    <TextField
      sx={{ mt: 2 }}
      label="Prévia"
      multiline
      minRows={4}
      fullWidth
      value={text}
      InputProps={{ readOnly: true }}
    />
  );
}

export function InstagramColumnJump({ onJump }) {
  return (
    <TextField
      select
      size="small"
      label="Ir para a etapa"
      defaultValue="NEW"
      onChange={(event) => onJump(event.target.value)}
      sx={{ display: { md: 'none' }, mb: 1 }}
    >
      {Object.entries({
        NEW: 'Novo Lead',
        CONTACTED: 'Contatado',
        WAITING_RESPONSE: 'Aguardando Retorno',
        NEGOTIATING: 'Em Negociação',
        WON: 'Convertido',
        NO_RESPONSE: 'Sem Resposta',
        LOST: 'Descartado',
      }).map(([id, label]) => (
        <MenuItem key={id} value={id}>{label}</MenuItem>
      ))}
    </TextField>
  );
}
