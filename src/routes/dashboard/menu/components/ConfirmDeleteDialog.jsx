import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar exclusão',
  itemType,
  itemName,
}) {
  const typeLabels = {
    category: "a categoria",
    product: "o produto",
    table: "a mesa",
    comanda: "a comanda",
  };
  const dialogProps = useDialogResponsiveProps({
    fullScreenOnMobile: false,
    paperSx: {
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      {...dialogProps}
    >
      <DialogTitle sx={{ 
        fontWeight: 600, 
        color: 'var(--color-text-primary)',
        fontSize: '1.25rem'
      }}>
        Confirmar exclusão
      </DialogTitle>
      <DialogContent sx={{ padding: '0 24px 24px 24px' }}>
        <Typography sx={{ 
          color: 'var(--color-text-secondary)',
          fontSize: '1rem',
          lineHeight: 1.5
        }}>
          Tem certeza que deseja excluir {typeLabels[itemType] || "o item"}{" "}
          <b style={{ color: 'var(--color-primary)' }}>{itemName}</b>?
          {itemType === 'category' ? (
            <>
              {' '}
              Só é possível excluir categorias sem produtos e sem subcategorias vinculadas.
            </>
          ) : null}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '0 24px 24px 24px', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderRadius: '8px',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
            '&:hover': {
              borderColor: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-surface-muted)',
            }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary)',
            '&:hover': {
              backgroundColor: 'var(--color-primary-dark)',
            }
          }}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
