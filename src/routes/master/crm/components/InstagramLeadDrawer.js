import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { INSTAGRAM_COLUMNS, formatWhen, instagramHandle, kindLabel, registerLabel, toneColor, toneOf } from '../instagramCrm';

export function InstagramLeadDrawer({
  open,
  lead,
  message,
  activities,
  loading,
  saving,
  settings,
  onClose,
  onSaveMessage,
  onRegister,
  onOpenInstagram,
  onCopy,
  onChangeStatus,
  onAddNote,
  onEdit,
}) {
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    setDraft(message?.content || '');
    setNote('');
  }, [message?.content, lead?.id]);

  const label = registerLabel(lead?.status);
  const tone = toneOf(lead);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{lead?.businessName || 'Lead'}</Typography>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>Fechar</Button>
        </Stack>
        {loading && <CircularProgress size={24} sx={{ color: '#2563EB' }} />}
        {lead && (
          <>
            <Box>
              <Typography variant="body2">{kindLabel(lead.leadKind)}</Typography>
              <Typography variant="body2">{instagramHandle(lead)}</Typography>
              <Typography variant="body2">Cadastro: {formatWhen(lead.createdAt)}</Typography>
              <Typography variant="body2">Último contato: {formatWhen(lead.lastContactAt)}</Typography>
              <Typography variant="body2">Próximo acompanhamento: {formatWhen(lead.nextContactAt)}</Typography>
              <Typography variant="body2" sx={{ color: toneColor(tone), fontWeight: 700 }}>
                {lead.prospectFlag || (tone === 'NONE' ? 'Sem prazo ativo' : 'Dentro do prazo')}
              </Typography>
              <Button onClick={onEdit} sx={{ textTransform: 'none', px: 0 }}>Editar dados</Button>
            </Box>
            <TextField
              select
              label="Etapa"
              size="small"
              value={INSTAGRAM_COLUMNS.some((item) => item.id === lead.status) ? lead.status : 'NEW'}
              onChange={(event) => onChangeStatus(lead.id, event.target.value)}
            >
              {INSTAGRAM_COLUMNS.map((column) => (
                <MenuItem key={column.id} value={column.id}>{column.label}</MenuItem>
              ))}
            </TextField>
            {label && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Mensagem preparada</Typography>
                <TextField
                  multiline
                  minRows={8}
                  fullWidth
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-label="Mensagem preparada"
                />
                <Typography variant="caption" color="text.secondary">
                  Copiar ou abrir o Instagram não registra o envio.
                  {settings ? ` O próximo prazo usa ${settings.firstFollowUpDays} e depois ${settings.lastAttemptDays} dias.` : ''}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  <Button variant="outlined" onClick={() => onCopy(draft)} sx={{ textTransform: 'none' }}>Copiar mensagem</Button>
                  <Button variant="outlined" onClick={onOpenInstagram} sx={{ textTransform: 'none' }}>Abrir Instagram</Button>
                  <Button variant="contained" disabled={saving} onClick={() => onRegister(lead.id)} sx={{ textTransform: 'none', bgcolor: '#2563EB' }}>
                    {label}
                  </Button>
                </Stack>
                <Button
                  onClick={() => onSaveMessage(lead.id, draft)}
                  disabled={saving}
                  sx={{ textTransform: 'none', px: 0 }}
                >
                  Salvar texto só neste lead
                </Button>
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Observação</Typography>
              <TextField
                multiline
                minRows={2}
                fullWidth
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Próximo passo ou retorno do lead"
              />
              <Button
                onClick={() => {
                  onAddNote(lead.id, note);
                  setNote('');
                }}
                disabled={saving || !note.trim()}
                sx={{ textTransform: 'none' }}
              >
                Registrar observação
              </Button>
            </Box>
            <Box sx={{ overflow: 'auto', flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Histórico</Typography>
              {(activities || []).map((item) => (
                <Box key={item.id} sx={{ mb: 1.25 }}>
                  <Typography variant="caption" color="text.secondary">{formatWhen(item.createdAt)}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                </Box>
              ))}
              {!loading && (activities || []).length === 0 && (
                <Typography variant="body2" color="text.secondary">Nenhum evento ainda.</Typography>
              )}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
