import { Box, Card, CardActionArea, IconButton, Typography } from '@mui/material';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { StatusBadge } from './StatusBadge';

export function FloorCard({ title, detail, available, onOpen, onQr, onDelete, canManage }) {
  return <Card elevation={0} sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
    <CardActionArea onClick={onOpen} aria-label={'Abrir conta de ' + title} sx={{ p: 2, minHeight: 120 }}>
      <Typography component="h3" sx={{ fontSize: 18, fontWeight: 600, mb: .5 }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ fontSize: 13, mb: 1.5 }}>{detail}</Typography>
      <StatusBadge label={available ? 'Disponível' : 'Em uso'} tone={available ? 'success' : 'info'} />
    </CardActionArea>
    {canManage && <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', px: 1, py: .5 }}>
      <IconButton aria-label={'Ver QR Code de ' + title} onClick={onQr}><QrCode2OutlinedIcon sx={{ fontSize: 20 }} /></IconButton>
      <IconButton aria-label={'Excluir ' + title} onClick={onDelete} color="error"><DeleteOutlineIcon sx={{ fontSize: 20 }} /></IconButton>
    </Box>}
  </Card>;
}
