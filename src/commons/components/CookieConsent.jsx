import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Paper, Typography } from '@mui/material';
import { PATHS } from '../../services/accessControl';
import {
  CONSENT_ACCEPTED,
  CONSENT_REJECTED,
  getConsent,
  isMarketingPath,
  isMetaPixelHost,
  setConsent,
} from '../../services/metaPixel';

/** Aviso de cookies de marketing (LGPD). Só aparece onde o Meta Pixel pode rodar. */
export function CookieConsent({ pathname, hostname = window.location.hostname, onAccept }) {
  const [choice, setChoice] = useState(getConsent);

  if (choice || !isMetaPixelHost(hostname) || !isMarketingPath(pathname)) return null;

  function decide(value) {
    setConsent(value);
    setChoice(value);
    if (value === CONSENT_ACCEPTED && onAccept) onAccept();
  }

  return <Paper
    role="dialog"
    aria-label="Aviso de cookies"
    elevation={6}
    sx={{
      position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 1400,
      maxWidth: 720, mx: 'auto', p: 2, borderRadius: 3,
      display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2,
    }}
  >
    <Typography sx={{ fontSize: 14, flex: 1 }}>
      Usamos cookies de marketing (Meta Pixel) para medir os nossos anúncios. Saiba mais na{' '}
      <Link component={RouterLink} to={PATHS.PRIVACY}>Política de Privacidade</Link>.
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button onClick={() => decide(CONSENT_REJECTED)}>Recusar</Button>
      <Button variant="contained" onClick={() => decide(CONSENT_ACCEPTED)}>Aceitar</Button>
    </Box>
  </Paper>;
}
