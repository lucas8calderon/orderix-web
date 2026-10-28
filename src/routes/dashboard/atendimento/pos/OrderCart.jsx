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

export function OrderCart({
  lines,
  totals,
  saving,
  error,
  printEnabled,
  hasDraft,
  onChangeQty,
  onObservationLine,
  onRemove,
  onEdit,
  onFinalize,
  onSend,
  onSave,
  onPrint,
  onClear,
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const blocked = saving || lines.length === 0;

  const requestClear = () => {
    if (!hasDraft || saving) return;
    setConfirmClear(true);
  };

  return (
    <Box
      component="section"
      aria-label="Pedido balcão"
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>Pedido Balcão</Typography>
          <Typography variant="caption" color="text.secondary">Balcão</Typography>
        </Box>
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
        {lines.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            Nenhum item neste pedido.
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
                    sx={{ width: 52, height: 52, borderRadius: '10px', objectFit: 'cover', bgcolor: 'var(--color-surface-muted, #f8fafc)' }}
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
                        <IconButton aria-label={`Diminuir ${name}`} size="small" onClick={() => onChangeQty?.(line.key, -1)} disabled={saving}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography aria-label={`Quantidade de ${name}`} sx={{ minWidth: 20, textAlign: 'center' }}>{line.quantity}</Typography>
                        <IconButton aria-label={`Aumentar ${name}`} size="small" onClick={() => onChangeQty?.(line.key, 1)} disabled={saving}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography fontWeight={700}>{formatCurrency(lineTotal(line))}</Typography>
                    </Box>
                    {productNeedsCustomization(line.product) ? (
                      <Button size="small" onClick={() => onEdit?.(line)} disabled={saving} sx={{ textTransform: 'none', px: 0 }}>
                        Alterar
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography color="text.secondary">{totals.itemCount} {totals.itemCount === 1 ? 'item' : 'itens'}</Typography>
          <Typography>{formatCurrency(totals.subtotal)}</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Desconto e taxa de serviço entram na cobrança deste canal.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 800 }}>Total</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: 22 }}>{formatCurrency(totals.total)}</Typography>
        </Box>
        <Button
          fullWidth
          variant="contained"
          disabled={blocked}
          onClick={onFinalize}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '12px',
            py: 1.25,
            mb: 1,
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
          {saving ? 'Enviando...' : 'Finalizar pedido'}
        </Button>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
          <Button variant="outlined" onClick={onSave} disabled={!hasDraft || saving} sx={{ textTransform: 'none', borderRadius: '10px' }}>
            Salvar
          </Button>
          <Button
            variant="outlined"
            onClick={onPrint}
            disabled={!printEnabled || saving}
            aria-label="Imprimir"
            title={printEnabled ? 'Abrir a comanda para impressão' : 'Disponível depois que o pedido for enviado'}
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            Imprimir
          </Button>
          <Button variant="outlined" color="error" onClick={requestClear} disabled={!hasDraft || saving} sx={{ textTransform: 'none', borderRadius: '10px' }}>
            Cancelar
          </Button>
        </Box>
        <Button fullWidth onClick={onSend} disabled={blocked} sx={{ textTransform: 'none', mt: 0.5 }}>
          Enviar pedido
        </Button>
      </Box>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} aria-labelledby="clear-cart-title">
        <DialogTitle id="clear-cart-title">Limpar pedido?</DialogTitle>
        <DialogContent>
          <Typography>
            Os itens deste rascunho serão descartados. Pedidos já enviados não são cancelados.
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
