import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { formatCurrency } from '../../../../services/accessControl';
import { getAllProducts } from '../../menu/product/service/productService';
import { createFloorOrder, resolveOperatorWaiterId } from '../service/accountService';
import { buildFloorOrderBody, defaultCustomerName, isSellableProduct } from '../utils/floorOrder';

function newKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `order-${Date.now()}`;
}

function destinationLabel(target) {
  if (target?.kind === 'counter') return 'Balcão';
  if (target?.kind === 'comanda') return `Comanda ${target.number ?? ''}`;
  return `Mesa ${target?.number ?? ''}`;
}

export function PlaceOrderDialog({ open, target, onClose, onPlaced }) {
  const dialogProps = useDialogResponsiveProps({
    paperSx: {
      maxWidth: 720,
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      backgroundImage: 'none',
    },
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [observation, setObservation] = useState('');
  const [quantities, setQuantities] = useState({});
  const [selections, setSelections] = useState({});
  const [extras, setExtras] = useState({});

  useEffect(() => {
    if (!open) return undefined;
    setCustomerName(defaultCustomerName(target));
    setObservation('');
    setQuantities({});
    setSelections({});
    setExtras({});
    setQuery('');
    setError('');
    setLoading(true);
    let cancelled = false;
    getAllProducts()
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response.data) ? response.data : [];
        setProducts(list.filter(isSellableProduct));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || 'Não foi possível carregar o cardápio.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, target]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => String(product.name || '').toLowerCase().includes(term));
  }, [products, query]);

  const changeQuantity = (productId, delta) => {
    setQuantities((current) => {
      const next = Math.max(0, Number(current[productId] || 0) + delta);
      return { ...current, [productId]: next };
    });
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const waiterId = target?.kind === 'counter' ? null : await resolveOperatorWaiterId();
      const lines = products.map((product) => ({
        product,
        quantity: quantities[product.id] || 0,
        selections: selections[product.id] || {},
        extraIds: extras[product.id] || [],
      }));
      const built = buildFloorOrderBody({
        target,
        customerName,
        observation,
        lines,
        waiterId,
      });
      if (built.error) {
        setError(built.error);
        return;
      }
      await createFloorOrder(built.tableId, built.body, newKey());
      onPlaced?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível lançar o pedido.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog {...dialogProps} open={open} onClose={saving ? undefined : onClose} aria-labelledby="place-order-title">
      <DialogTitle id="place-order-title">Lançar em {destinationLabel(target)}</DialogTitle>
      <DialogContent>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        <TextField
          fullWidth
          margin="dense"
          label="Nome do cliente"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Observação"
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Buscar produto"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {loading ? <Typography sx={{ mt: 2 }}>Carregando cardápio...</Typography> : null}
        {!loading && visible.length === 0 ? (
          <Typography sx={{ mt: 2 }} color="text.secondary">Nenhum produto disponível.</Typography>
        ) : null}
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {visible.map((product) => {
            const quantity = quantities[product.id] || 0;
            const groups = product.mandatoryGroups || [];
            const productExtras = product.extras || [];
            return (
              <Box component="li" key={product.id} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>{product.name}</Typography>
                    <Typography color="text.secondary">{formatCurrency(product.value)}</Typography>
                  </Box>
                  <IconButton aria-label={`Diminuir ${product.name}`} onClick={() => changeQuantity(product.id, -1)} disabled={quantity === 0}>
                    <RemoveIcon />
                  </IconButton>
                  <Typography aria-label={`Quantidade de ${product.name}`}>{quantity}</Typography>
                  <IconButton aria-label={`Aumentar ${product.name}`} onClick={() => changeQuantity(product.id, 1)}>
                    <AddIcon />
                  </IconButton>
                </Box>
                {quantity > 0 && groups.map((group) => (
                  <Box key={group.id} sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight={700}>{group.name}</Typography>
                    <RadioGroup
                      value={String(selections[product.id]?.[group.id] || '')}
                      onChange={(event) => {
                        const itemId = Number(event.target.value);
                        setSelections((current) => ({
                          ...current,
                          [product.id]: { ...(current[product.id] || {}), [group.id]: itemId },
                        }));
                      }}
                    >
                      {(group.items || []).map((item) => (
                        <FormControlLabel
                          key={item.id}
                          value={String(item.id)}
                          control={<Radio size="small" />}
                          label={item.price ? `${item.name} (+ ${formatCurrency(item.price)})` : item.name}
                        />
                      ))}
                    </RadioGroup>
                  </Box>
                ))}
                {quantity > 0 && productExtras.map((extra) => {
                  const extraId = extra.productExtraId;
                  const checked = (extras[product.id] || []).includes(extraId);
                  return (
                    <FormControlLabel
                      key={extraId}
                      control={(
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => {
                            setExtras((current) => {
                              const selected = current[product.id] || [];
                              const next = checked
                                ? selected.filter((id) => id !== extraId)
                                : [...selected, extraId];
                              return { ...current, [product.id]: next };
                            });
                          }}
                        />
                      )}
                      label={extra.price ? `${extra.name} (+ ${formatCurrency(extra.price)})` : extra.name}
                    />
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={submit} disabled={saving || loading}>Enviar pedido</Button>
      </DialogActions>
    </Dialog>
  );
}
