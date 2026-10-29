import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../../../../services/accessControl';
import { resolveMenuImage } from '../../menu/utils/defaultMenuImage';
import { productNeedsCustomization } from './catalogView';
import { lineDetails, lineTotal, lineUnitPrice } from './cartMath';

/**
 * Carrinho do PDV. Uma ação principal (cobrar ou enviar) e, no balcão,
 * uma secundária para enviar sem cobrar. O rascunho é salvo sozinho.
 */
export function OrderCart({
  title = 'Pedido balcão',
  lines,
  totals,
  saving,
  error,
  notice,
  hasDraft,
  customer,
  observation,
  onObservation,
  primary,
  secondary,
  draftHint,
  onChangeQty,
  onObservationLine,
  onRemove,
  onEdit,
  onClear,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  const requestClear = () => {
    if (!hasDraft || saving) return;
    setConfirmClear(true);
  };

  return (
    <Box
      component="section"
      aria-label={title}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: '1px solid var(--color-border)' }}>
        <ShoppingCartOutlinedIcon sx={{ color: 'var(--color-primary)' }} />
        <Typography sx={{ fontWeight: 800, lineHeight: 1.2, flex: 1, minWidth: 0 }} noWrap>{title}</Typography>
        <Button
          color="error"
          size="small"
          startIcon={<DeleteOutlineIcon />}
          onClick={requestClear}
          disabled={!hasDraft || saving}
          sx={{ textTransform: 'none' }}
        >
          Limpar
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1.5 }}>
        {notice}
        {customer ? (
          <Box sx={{ display: 'grid', gap: 1, mb: 1.5 }}>
            <TextField
              size="small"
              label={customer.label}
              placeholder={customer.placeholder}
              value={customer.name}
              onChange={(event) => customer.onName(event.target.value)}
              disabled={customer.locked || saving}
              required={customer.required}
            />
            {customer.onNote ? (
              <TextField
                size="small"
                label="Identificação visual (opcional)"
                placeholder="Ex.: camiseta azul, mesa da janela"
                value={customer.note}
                onChange={(event) => customer.onNote(event.target.value.slice(0, 120))}
                disabled={saving}
              />
            ) : null}
            <TextField
              size="small"
              label="Observação do pedido (opcional)"
              placeholder="Ex.: para viagem"
              value={observation}
              onChange={(event) => onObservation(event.target.value)}
              disabled={saving}
            />
          </Box>
        ) : null}
        {lines.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            Toque nos produtos para adicionar.
          </Typography>
        ) : (
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {lines.map((line) => {
              const details = lineDetails(line);
              const name = line.product?.name || 'Item';
              return (
                <Box component="li" key={line.key} sx={{ display: 'flex', gap: 1.25, py: 1.25, borderBottom: '1px solid var(--color-border)' }}>
                  <Box
                    component="img"
                    src={resolveMenuImage(line.product?.image)}
                    alt=""
                    sx={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover', bgcolor: 'var(--color-surface-muted, #f8fafc)' }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Typography sx={{ fontWeight: 700, flex: 1 }} noWrap title={name}>{name}</Typography>
                      <IconButton aria-label={`Remover ${name}`} size="small" onClick={() => onRemove?.(line.key)} disabled={saving}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(lineUnitPrice(line))}
                    </Typography>
                    {details.length > 0 ? (
                      <Typography variant="body2">{details.join(' · ')}</Typography>
                    ) : null}
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Observação do item"
                      value={line.observation || ''}
                      onChange={(event) => onObservationLine?.(line.key, event.target.value.slice(0, 180))}
                      inputProps={{ 'aria-label': `Observação de ${name}`, maxLength: 180 }}
                      sx={{ mt: 0.75 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton aria-label={`Diminuir ${name}`} onClick={() => onChangeQty?.(line.key, -1)} disabled={saving} sx={{ border: '1px solid var(--color-border)' }}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography aria-label={`Quantidade de ${name}`} sx={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{line.quantity}</Typography>
                        <IconButton aria-label={`Aumentar ${name}`} onClick={() => onChangeQty?.(line.key, 1)} disabled={saving} sx={{ border: '1px solid var(--color-border)' }}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography fontWeight={700}>{formatCurrency(lineTotal(line))}</Typography>
                    </Box>
                    {productNeedsCustomization(line.product) ? (
                      <Button size="small" onClick={() => onEdit?.(line)} disabled={saving} sx={{ textTransform: 'none', px: 0 }}>
                        Alterar opções
                      </Button>
                    ) : null}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid var(--color-border)' }}>
        {error ? (
          <Typography role="alert" color="error" sx={{ mb: 1 }}>{error}</Typography>
        ) : null}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 800 }}>
            Total
            <Typography component="span" color="text.secondary" sx={{ fontWeight: 400, ml: 1, fontSize: 14 }}>
              {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'itens'}
            </Typography>
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: 22 }}>{formatCurrency(totals.total)}</Typography>
        </Box>
        <Button
          fullWidth
          variant="contained"
          disabled={saving || primary.disabled}
          onClick={primary.onClick}
          aria-keyshortcuts="Control+Enter"
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            fontSize: 16,
            borderRadius: '12px',
            py: 1.4,
            '&:not(.Mui-disabled)': {
              backgroundColor: 'var(--color-success)',
              color: '#fff',
            },
            '&:hover:not(.Mui-disabled)': {
              backgroundColor: 'var(--color-success)',
              filter: 'brightness(0.92)',
            },
          }}
        >
          {saving ? 'Enviando...' : primary.label}
        </Button>
        {secondary ? (
          <>
            <Button
              fullWidth
              variant="outlined"
              disabled={saving || secondary.disabled}
              onClick={secondary.onClick}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px', py: 1.1, mt: 1 }}
            >
              {secondary.label}
            </Button>
            {secondary.hint ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
                {secondary.hint}
              </Typography>
            ) : null}
          </>
        ) : null}
        {draftHint && hasDraft ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, textAlign: 'center' }}>
            {draftHint}
          </Typography>
        ) : null}
      </Box>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} aria-labelledby="clear-cart-title">
        <DialogTitle id="clear-cart-title">Limpar pedido?</DialogTitle>
        <DialogContent>
          <Typography>
            Os itens ainda não enviados serão descartados. Pedidos já enviados não são cancelados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Voltar</Button>
          <Button
            color="error"
            onClick={() => {
              setConfirmClear(false);
              onClear?.();
            }}
          >
            Limpar pedido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
