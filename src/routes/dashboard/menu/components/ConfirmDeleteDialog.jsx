import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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
    table: "a mesa"
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 600, 
        color: '#333',
        fontSize: '1.25rem'
      }}>
        Confirmar exclusão
      </DialogTitle>
      <DialogContent sx={{ padding: '0 24px 24px 24px' }}>
        <Typography sx={{ 
          color: '#666',
          fontSize: '1rem',
          lineHeight: 1.5
        }}>
          Tem certeza que deseja excluir {typeLabels[itemType] || "o item"}{" "}
          <b style={{ color: '#7b2cbf' }}>{itemName}</b>?
          {itemType === 'category' ? (
            <>
              {' '}
              Só é possível excluir categorias sem produtos vinculados.
            </>
          ) : null}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '0 24px 24px 24px', gap: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderRadius: '8px',
            borderColor: '#e0e0e0',
            color: '#666',
            '&:hover': {
              borderColor: '#ccc',
              backgroundColor: '#f5f5f5',
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
            backgroundColor: '#7b2cbf',
            '&:hover': {
              backgroundColor: '#6a1b9a',
            }
          }}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
