import { Box, Button, Typography } from '@mui/material';

export function EmptyState({ title, description, actionLabel, onAction }) {
  return <Box sx={{ py: { xs: 4, sm: 5 }, px: 2, textAlign: 'center', maxWidth: 560, mx: 'auto' }}>
    <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>{title}</Typography>
    {description && <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14 }}>{description}</Typography>}
    {actionLabel && onAction && <Button variant="contained" onClick={onAction} sx={{ mt: 2 }}>{actionLabel}</Button>}
  </Box>;
}
