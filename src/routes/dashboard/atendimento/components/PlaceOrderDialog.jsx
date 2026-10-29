import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { useIsMobile } from '../../../../commons/hooks/useResponsive';
import { CounterPos, posTitle } from '../pos/CounterPos';

function destinationLabel(target) {
  if (target?.kind === 'counter') return 'Novo pedido de balcão';
  return `Lançar em ${posTitle(target)}`;
}

/**
 * Lançamento em mesa, comanda, pedido por cliente ou balcão (vindo da cobrança).
 * Usa o mesmo PDV da aba Balcão: catálogo à esquerda e carrinho à direita.
 */
export function PlaceOrderDialog({ open, target, onClose, onPlaced }) {
  const isMobile = useIsMobile();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      fullScreen={isMobile}
      aria-labelledby="place-order-title"
      PaperProps={{
        sx: {
          height: isMobile ? '100%' : 'calc(100% - 48px)',
          backgroundColor: 'var(--color-bg)',
          backgroundImage: 'none',
          borderRadius: isMobile ? 0 : '20px',
        },
      }}
    >
      <DialogTitle id="place-order-title" sx={{ pr: 6, backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <Typography component="span" variant="h6" fontWeight={800}>{destinationLabel(target)}</Typography>
        <IconButton aria-label="Fechar" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important', position: 'relative' }}>
        {open && target ? (
          <CounterPos
            key={`${target.kind}-${target.id ?? 'new'}`}
            embedded
            target={target}
            active={open}
            onPlaced={onPlaced}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
