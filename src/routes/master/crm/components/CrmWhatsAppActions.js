import React, { useRef, useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { WEPER_WHATSAPP_MESSAGE, normalizeBrazilWhatsAppPhone } from '../whatsappLink';

export function CrmWhatsAppActions({ phone, saving, pendingConfirm, onOpen, onConfirm }) {
  const [draft, setDraft] = useState(WEPER_WHATSAPP_MESSAGE);
  const lock = useRef(false);
  const number = normalizeBrazilWhatsAppPhone(phone);

  if (!number) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sem telefone válido para WhatsApp.
      </Typography>
    );
  }

  const open = async () => {
    if (lock.current || saving) return;
    lock.current = true;
    try {
      await onOpen(draft);
    } finally {
      window.setTimeout(() => {
        lock.current = false;
      }, 800);
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        WhatsApp {number}
      </Typography>
      <TextField
        className="ig-message"
        multiline
        minRows={6}
        fullWidth
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Mensagem de WhatsApp"
      />
      <Typography variant="caption" color="text.secondary">
        Abrir o WhatsApp não muda a etapa e não confirma o envio.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        disabled={saving}
        onClick={open}
        sx={{ textTransform: 'none', alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
      >
        Abrir no WhatsApp
      </Button>
      {pendingConfirm && (
        <Button
          variant="outlined"
          color="primary"
          disabled={saving}
          onClick={onConfirm}
          sx={{ textTransform: 'none', alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
        >
          Confirme que enviou a mensagem
        </Button>
      )}
    </Stack>
  );
}
