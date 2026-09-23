import { Box } from '@mui/material';

export function StatusBadge({ label, tone = 'neutral' }) {
  return <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: .4, borderRadius: '6px', fontSize: 12, lineHeight: 1.5, fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--status-' + tone + '-text)', bgcolor: 'var(--status-' + tone + '-bg)' }}>{label}</Box>;
}
