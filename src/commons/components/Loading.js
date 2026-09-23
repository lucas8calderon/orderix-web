import { Box, CircularProgress, Typography } from '@mui/material';

export function Loading({ loadingMessage = 'Carregando...' }) {
  return <Box role="status" aria-live="polite" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, minHeight: 200, py: 4, px: 2 }}>
    <CircularProgress size={28} aria-hidden="true" />
    <Typography color="text.secondary" variant="body2">{loadingMessage}</Typography>
  </Box>;
}
