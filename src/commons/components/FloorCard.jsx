import { Box, Button, Card, CardActionArea, IconButton, Typography } from '@mui/material';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { StatusBadge } from './StatusBadge';

export function FloorCard({
  title,
  detail,
  meta,
  available,
  statusLabel,
  statusTone,
  primaryLabel,
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
  return <Card elevation={0} sx={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
    <CardActionArea onClick={onOpen} aria-label={'Abrir conta de ' + title} sx={{ p: 2, minHeight: 132, alignItems: 'stretch' }}>
      <Typography component="h3" sx={{ fontSize: 18, fontWeight: 700, mb: .5 }}>{title}</Typography>
      {detail ? <Typography color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>{detail}</Typography> : null}
      {meta ? <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>{meta}</Typography> : null}
      <StatusBadge label={label} tone={tone} />
    </CardActionArea>
    {(canManage || actionLabel) && <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider', px: 1, py: .5 }}>
      {actionLabel ? <Button size="small" onClick={action} sx={{ mr: 'auto', textTransform: 'none', fontWeight: 700 }}>{actionLabel}</Button> : null}
      {canManage && onQr ? <IconButton aria-label={'Ver QR Code de ' + title} onClick={onQr}><QrCode2OutlinedIcon sx={{ fontSize: 20 }} /></IconButton> : null}
      {canManage && canDelete && onDelete ? <IconButton aria-label={'Excluir ' + title} onClick={onDelete} color="error"><DeleteOutlineIcon sx={{ fontSize: 20 }} /></IconButton> : null}
    </Box>}
  </Card>;
}
