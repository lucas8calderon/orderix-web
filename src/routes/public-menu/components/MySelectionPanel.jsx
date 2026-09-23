import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { useDialogResponsiveProps } from '../../../commons/hooks/useResponsive';

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MySelectionPanel({
  open,
  onClose,
  selectedItems,
  selectedCount,
  estimatedTotal,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onRequestClearConfirm,
}) {
  const dialogProps = useDialogResponsiveProps({
    fullScreenOnMobile: false,
    paperSx: {
      borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
      m: { xs: 0, sm: 2 },
      position: { xs: 'fixed', sm: 'relative' },
      bottom: { xs: 0, sm: 'auto' },
      maxHeight: { xs: '85vh', sm: '80vh' },
      width: { xs: '100%', sm: undefined },
    },
  });

  const countLabel = selectedCount === 1
    ? '1 item selecionado'
    : `${selectedCount} itens selecionados`;

  const handleClear = () => {
    if (selectedCount > 1 && typeof onRequestClearConfirm === 'function') {
      onRequestClearConfirm();
      return;
    }
    onClear();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="my-selection-title"
      {...dialogProps}
    >
      <DialogTitle
        id="my-selection-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pr: 1,
          fontWeight: 700,
        }}
      >
        Minha seleção
        <IconButton onClick={onClose} aria-label="Fechar seleção" size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 2, py: 2 }}>
        {selectedItems.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Nenhum item na seleção.
          </Typography>
        ) : (
          <ul className="public-menu-selection-list">
            {selectedItems.map(({ product, quantity }) => {
              const unavailable = product.isAvailable === false;
              const name = product.name || 'Produto';
              return (
                <li key={product.id} className="public-menu-selection-line">
                  <div className="public-menu-selection-line-main">
                    <div>
                      <Typography className="public-menu-selection-line-name">
                        {name}
                      </Typography>
                      <Typography className="public-menu-selection-line-price">
                        {formatPrice(product.value)}
                        {unavailable ? ' · Indisponível' : ''}
                      </Typography>
                    </div>
                    <div className="public-menu-qty" role="group" aria-label={`Quantidade de ${name}`}>
                      <button
                        type="button"
                        className="public-menu-qty-btn"
                        onClick={() => onDecrease(product.id)}
                        aria-label={`Diminuir quantidade de ${name}`}
                      >
                        −
                      </button>
                      <span className="public-menu-qty-value">{quantity}</span>
                      <button
                        type="button"
                        className="public-menu-qty-btn"
                        onClick={() => onIncrease(product.id)}
                        aria-label={`Aumentar quantidade de ${name}`}
                        disabled={unavailable}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="public-menu-selection-remove"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Remover ${name} da seleção`}
                  >
                    Remover
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography className="public-menu-selection-count">{countLabel}</Typography>
          {estimatedTotal != null && selectedItems.length > 0 ? (
            <Typography className="public-menu-selection-estimate">
              Valor estimado: {formatPrice(estimatedTotal)}
              <span className="public-menu-selection-estimate-hint">
                {' '}
                (não é conta fechada)
              </span>
            </Typography>
          ) : null}
          <Typography className="public-menu-selection-hint">
            Use esta lista para lembrar suas escolhas ao chamar o garçom.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 2, gap: 1, flexWrap: 'wrap' }}>
        {selectedItems.length > 0 ? (
          <Button onClick={handleClear} color="inherit" variant="outlined">
            Limpar seleção
          </Button>
        ) : null}
        <Button onClick={onClose} variant="contained" sx={{ ml: 'auto !important' }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
