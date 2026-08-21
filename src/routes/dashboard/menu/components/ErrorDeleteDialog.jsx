import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';

export default function ErrorDeleteDialog({ open, onClose, itemName }) {
  const dialogProps = useDialogResponsiveProps({ fullScreenOnMobile: false });

  return (
    <Dialog open={open} onClose={onClose} {...dialogProps}>
      <DialogTitle>Erro ao excluir</DialogTitle>
      <DialogContent>
        <Typography>
          Não foi possível excluir o produto <b>{itemName || 'selecionado'}</b>.  
          Tente novamente mais tarde.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
