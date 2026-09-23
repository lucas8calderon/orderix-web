import { Box, Typography } from '@mui/material';

export function PageHeader({ title, description, actions }) {
  return <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography component="h1" sx={{ fontSize: { xs: 22, sm: 24 }, lineHeight: 1.35, fontWeight: 700, letterSpacing: '-0.025em', overflowWrap: 'anywhere' }}>{title}</Typography>
      {description && <Typography sx={{ mt: .5, color: 'text.secondary', fontSize: 14, maxWidth: 720 }}>{description}</Typography>}
    </Box>
    {actions && <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>{actions}</Box>}
  </Box>;
}
