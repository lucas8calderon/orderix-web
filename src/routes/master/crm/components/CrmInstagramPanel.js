import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { getCrmInstagramTemplates, updateCrmInstagramTemplates } from '../service/crmService';

export function CrmInstagramPanel() {
  const [establishmentMessage, setEstablishmentMessage] = useState('');
  const [influencerMessage, setInfluencerMessage] = useState('');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getCrmInstagramTemplates()
      .then(({ data }) => {
        if (!active) return;
        setEstablishmentMessage(data?.establishmentMessage || '');
        setInfluencerMessage(data?.influencerMessage || '');
        setHint(data?.variablesHint || '');
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os modelos do Instagram.');
      });
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { data } = await updateCrmInstagramTemplates({ establishmentMessage, influencerMessage });
      setEstablishmentMessage(data?.establishmentMessage || establishmentMessage);
      setInfluencerMessage(data?.influencerMessage || influencerMessage);
      setNotice('Modelos do Instagram salvos. O WhatsApp não foi alterado.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível salvar os modelos.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Mensagens do Instagram</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Dois modelos independentes: estabelecimento e influenciador. A mensagem é copiada e colada no Direct.
        O link não preenche o texto. Abrir o Direct não marca como enviado.
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {hint}
        </Typography>
      )}
      {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mt: 1.5 }}>{notice}</Alert>}
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={6}
          label="Estabelecimento"
          value={establishmentMessage}
          inputProps={{ maxLength: 4000 }}
          onChange={(event) => setEstablishmentMessage(event.target.value)}
        />
        <TextField
          fullWidth
          multiline
          minRows={6}
          label="Influenciador"
          value={influencerMessage}
          inputProps={{ maxLength: 4000 }}
          onChange={(event) => setInfluencerMessage(event.target.value)}
        />
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Button
          disabled={busy || !establishmentMessage.trim() || !influencerMessage.trim()}
          onClick={save}
          sx={{ textTransform: 'none' }}
        >
          Salvar modelos
        </Button>
      </Box>
    </Paper>
  );
}
