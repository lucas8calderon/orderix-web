import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Checkbox, FormControlLabel, Link, Paper, Typography } from '@mui/material';
import { PATHS } from '../../services/accessControl';
import { isMetaPixelHost } from '../../services/metaPixel';
import {
  acceptAll,
  CONSENT_ACCEPTED,
  CONSENT_REJECTED,
  readConsentRecord,
  rejectOptional,
  savePreferences,
} from '../../analytics/analyticsConsent';
import { isCommercialPath } from '../../analytics/analyticsEvents';

function consentVisible(pathname, hostname) {
  if (!isCommercialPath(pathname)) return false;
  if (isMetaPixelHost(hostname)) return true;
  return process.env.REACT_APP_ANALYTICS_DEBUG === 'true';
}

/**
 * Aviso de cookies opcionais. Aceitar, recusar e personalizar gravam a escolha.
 * Fechar sem salvar não é consentimento.
 */
export function CookieConsent({ pathname, hostname = window.location.hostname, onAccept }) {
  const [record, setRecord] = useState(readConsentRecord);
  const [open, setOpen] = useState(() => !readConsentRecord());
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  if (!consentVisible(pathname, hostname)) return null;

  function finish(granted) {
    const next = readConsentRecord();
    setRecord(next);
    setOpen(false);
    setCustomizing(false);
    if (granted && onAccept) onAccept();
  }

  function decide(value) {
    if (value === CONSENT_ACCEPTED) acceptAll();
    else rejectOptional();
    finish(value === CONSENT_ACCEPTED);
  }

  function openCustomize() {
    const current = readConsentRecord();
    setAnalytics(Boolean(current?.analytics));
    setMarketing(Boolean(current?.marketing));
    setCustomizing(true);
    setOpen(true);
  }

  function saveCustom() {
    const granted = analytics || marketing;
    savePreferences({ analytics, marketing });
    finish(granted);
  }

  return (
    <>
      {open ? (
        <Paper
          role="dialog"
          aria-label="Aviso de cookies"
          elevation={6}
          sx={{
            position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 1400,
            maxWidth: 760, mx: 'auto', p: 2, borderRadius: 3,
          }}
        >
          {customizing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: 14 }}>
                Escolha o que podemos medir. As duas opções começam desligadas até você marcar.
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />}
                label="Estatística: visitas, planos e contratação (Google Analytics e Microsoft Clarity)"
              />
              <FormControlLabel
                control={<Checkbox checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />}
                label="Marketing: anúncios da Weper (Meta Pixel)"
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button onClick={() => setCustomizing(false)}>Fechar</Button>
                <Button variant="contained" onClick={saveCustom}>Salvar preferências</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{
              display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' }, gap: 2,
            }}
            >
              <Typography sx={{ fontSize: 14, flex: 1 }}>
                Usamos cookies opcionais para medir visitas, o interesse nos planos e os anúncios da Weper.
                Eles ficam desligados até você escolher. Saiba mais na{' '}
                <Link component={RouterLink} to={PATHS.PRIVACY}>Política de Privacidade</Link>.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button onClick={() => decide(CONSENT_REJECTED)}>Recusar</Button>
                <Button onClick={openCustomize}>Personalizar</Button>
                <Button variant="contained" onClick={() => decide(CONSENT_ACCEPTED)}>Aceitar</Button>
              </Box>
            </Box>
          )}
        </Paper>
      ) : null}
      {record && !open ? (
        <Button
          aria-label="Preferências de cookies"
          onClick={() => { setCustomizing(false); setOpen(true); }}
          sx={{
            position: 'fixed', left: 16, bottom: 16, zIndex: 40, minWidth: 0,
            px: 1.5, py: 0.5, fontSize: 12, textTransform: 'none', borderRadius: 999,
            color: '#233550', background: '#fff', border: '1px solid #dce6f5',
            boxShadow: '0 5px 20px #1a386023',
            '&:hover': { background: '#f8fafc' },
          }}
        >
          Cookies
        </Button>
      ) : null}
    </>
  );
}
