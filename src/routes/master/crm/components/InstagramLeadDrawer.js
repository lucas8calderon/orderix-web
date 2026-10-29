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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: 'ig-lead-drawer' }}
    >
      <Box className="ig-lead-drawer-body">
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>{lead?.businessName || 'Lead'}</Typography>
          <Button onClick={onClose} color="primary" sx={{ textTransform: 'none', flexShrink: 0 }}>Fechar</Button>
        </Stack>
        {loading && <CircularProgress size={24} color="primary" />}
        {lead && (
          <>
            <Box>
              <Typography variant="body2" color="text.secondary">{kindLabel(lead.leadKind)}</Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>{instagramHandle(lead)}</Typography>
              <Typography variant="body2" color="text.primary">Cadastro: {formatWhen(lead.createdAt || lead.discoveredAt)}</Typography>
              <Typography variant="body2" color="text.primary">Último contato: {formatWhen(lead.lastContactAt)}</Typography>
              <Typography variant="body2" color="text.primary">Próximo acompanhamento: {formatWhen(lead.nextContactAt)}</Typography>
              <Typography variant="body2" sx={{ color: toneColor(tone), fontWeight: 700 }}>
                {lead.prospectFlag || (tone === 'NONE' ? 'Sem prazo ativo' : 'Dentro do prazo')}
              </Typography>
              <Button onClick={onEdit} color="primary" sx={{ textTransform: 'none', px: 0 }}>Editar dados</Button>
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
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>Mensagem preparada</Typography>
                <TextField
                  className="ig-message"
                  multiline
                  minRows={8}
                  fullWidth
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-label="Mensagem preparada"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  Copiar ou abrir o Instagram não registra o envio.
                  {settings ? ` O próximo prazo usa ${settings.firstFollowUpDays} e depois ${settings.lastAttemptDays} dias.` : ''}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
                  <Button variant="outlined" onClick={() => onCopy(draft)} sx={{ textTransform: 'none' }}>Copiar mensagem</Button>
                  <Button variant="outlined" onClick={onOpenInstagram} sx={{ textTransform: 'none' }}>Abrir Instagram</Button>
                  <Button variant="contained" color="primary" disabled={saving} onClick={() => onRegister(lead.id)} sx={{ textTransform: 'none' }}>
                    {label}
                  </Button>
                </Stack>
                <Button
                  onClick={() => onSaveMessage(lead.id, draft)}
                  disabled={saving}
                  sx={{ textTransform: 'none', px: 0 }}
                  color="primary"
                >
                  Salvar texto só neste lead
                </Button>
              </Box>
            )}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>Observação</Typography>
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
                color="primary"
              >
                Registrar observação
              </Button>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>Histórico</Typography>
              {(activities || []).map((item) => (
                <Box key={item.id} sx={{ mb: 1.25 }}>
                  <Typography variant="caption" color="text.secondary">{formatWhen(item.createdAt)}</Typography>
                  <Typography variant="body2" color="text.primary">{item.description}</Typography>
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
