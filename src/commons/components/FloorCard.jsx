import { Box, Button, Card, CardActionArea, IconButton, Typography } from '@mui/material';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { StatusBadge } from './StatusBadge';

const TONE_COLORS = {
  success: 'var(--color-success)',
  info: 'var(--color-primary)',
  warning: 'var(--status-warning-text, #b45309)',
};

/**
 * Card de mesa ou comanda. Tocar no card faz a ação principal:
 * livre → lançar pedido; em uso → abrir a conta para cobrar.
 */
export function FloorCard({
  title,
  detail,
  meta,
  available,
  statusLabel,
  statusTone,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onOpen,
  onPlace,
  onQr,
  onDelete,
  canManage,
  canDelete = true,
}) {
  const label = statusLabel || (available ? 'Disponível' : 'Em uso');
  const tone = statusTone || (available ? 'success' : 'info');
  const actionLabel = primaryLabel || (onPlace ? 'Lançar' : '');
  const action = onPrimary || onPlace;
  const cardAction = action || onOpen;
  const placing = action === onPlace && Boolean(onPlace);
  const showQr = canManage && onQr;
  const showDelete = canManage && canDelete && onDelete;
  return <Card elevation={0} sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)', borderTop: '4px solid', borderTopColor: TONE_COLORS[tone] || 'var(--color-border)' }}>
    {showQr || showDelete ? <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1, display: 'flex' }}>
      {showQr ? <IconButton size="small" aria-label={'Ver QR Code de ' + title} onClick={onQr}><QrCode2OutlinedIcon sx={{ fontSize: 18 }} /></IconButton> : null}
      {showDelete ? <IconButton size="small" aria-label={'Excluir ' + title} onClick={onDelete} color="error"><DeleteOutlineIcon sx={{ fontSize: 18 }} /></IconButton> : null}
    </Box> : null}
    <CardActionArea onClick={cardAction} aria-label={(placing ? 'Lançar em ' : 'Abrir conta de ') + title} sx={{ p: 2, minHeight: { xs: 104, sm: 124 }, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      <Typography component="h3" sx={{ fontSize: 18, fontWeight: 800, mb: .5, pr: canManage ? 7 : 0 }}>{title}</Typography>
      {detail ? <Typography color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>{detail}</Typography> : null}
      {meta ? <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>{meta}</Typography> : null}
      <StatusBadge label={label} tone={tone} />
    </CardActionArea>
    {actionLabel ? <Box sx={{ display: 'flex', alignItems: 'center', gap: .5, flexWrap: 'wrap', borderTop: '1px solid', borderColor: 'divider', px: 1, py: .5 }}>
      <Button size="small" variant={placing ? 'text' : 'contained'} disableElevation onClick={action} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', minHeight: 36 }}>{actionLabel}</Button>
      {secondaryLabel && onPlace && action !== onPlace ? <Button size="small" onClick={onPlace} sx={{ textTransform: 'none', fontWeight: 700, minHeight: 36 }}>{secondaryLabel}</Button> : null}
    </Box> : null}
  </Card>;
}
