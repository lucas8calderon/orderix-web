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
import {
  addCustomerOrderItems,
  createCustomerOrder,
} from '../service/customerOrderService';
import { buildFloorOrderBody, defaultCustomerName, isSellableProduct } from '../utils/floorOrder';
import { activeVariations, formatProductPrice } from '../../menu/utils/productVariations';

function newKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `order-${Date.now()}`;
}

function destinationLabel(target) {
  if (target?.kind === 'customer') {
    if (target.customerName) return `Cliente ${target.customerName}`;
    return 'Pedido por Cliente';
  }
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
  const [customerIdentificationNote, setCustomerIdentificationNote] = useState('');
  const [observation, setObservation] = useState('');
  const [quantities, setQuantities] = useState({});
  const [variationQuantities, setVariationQuantities] = useState({});
  const [selections, setSelections] = useState({});
  const [extras, setExtras] = useState({});

  useEffect(() => {
    if (!open) return undefined;
    setCustomerName(defaultCustomerName(target));
    setCustomerIdentificationNote(target?.customerIdentificationNote || '');
    setObservation('');
    setQuantities({});
    setVariationQuantities({});
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

  const variationKey = (productId, variationId) => `${productId}:${variationId}`;

  const changeVariationQuantity = (productId, variationId, delta) => {
    const key = variationKey(productId, variationId);
    setVariationQuantities((current) => {
      const next = Math.max(0, Number(current[key] || 0) + delta);
      return { ...current, [key]: next };
    });
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const waiterId = target?.kind === 'counter' || target?.kind === 'customer'
        ? null
        : await resolveOperatorWaiterId();
      const lines = products.flatMap((product) => {
        const variations = activeVariations(product);
        if (!variations.length) {
          return [{
            product,
            quantity: quantities[product.id] || 0,
            selections: selections[product.id] || {},
            extraIds: extras[product.id] || [],
          }];
        }
        return variations.map((variation) => ({
          product,
          variationId: variation.id,
          quantity: variationQuantities[variationKey(product.id, variation.id)] || 0,
          selections: selections[product.id] || {},
          extraIds: extras[product.id] || [],
        }));
      });
      const built = buildFloorOrderBody({
        target,
        customerName,
        customerIdentificationNote,
        observation,
        lines,
        waiterId,
      });
      if (built.error) {
        setError(built.error);
        return;
      }
      const key = newKey();
      let createdOrder = null;
      if (built.mode === 'customer-create') {
        const response = await createCustomerOrder(built.body, key);
        createdOrder = response?.data || null;
      } else if (built.mode === 'customer-items') {
        await addCustomerOrderItems(built.orderId, {
          products: built.body.products,
          observation: built.body.observation,
        }, key);
      } else {
        await createFloorOrder(built.tableId, built.body, key);
      }
      onPlaced?.(createdOrder);
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
          disabled={Boolean(target?.kind === 'customer' && target?.id)}
        />
        {target?.kind === 'customer' && !target?.id ? (
          <TextField
            fullWidth
            margin="dense"
            label="Identificação visual (opcional)"
            placeholder="Ex.: camiseta vermelha, óculos"
            value={customerIdentificationNote}
            onChange={(event) => setCustomerIdentificationNote(event.target.value.slice(0, 120))}
            helperText="Ajuda a cozinha e o caixa a reconhecer o cliente no food truck."
            inputProps={{ maxLength: 120 }}
          />
        ) : null}
        <TextField
          fullWidth
          margin="dense"
          label="Observação do pedido"
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
        />
        {target?.kind === 'customer' && !target?.id ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
            Você pode criar só com o nome (shell) e lançar produtos depois, ou já incluir itens agora.
          </Typography>
        ) : null}
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
            const variations = activeVariations(product);
            const quantity = variations.length
              ? variations.reduce((sum, variation) => sum + (variationQuantities[variationKey(product.id, variation.id)] || 0), 0)
              : (quantities[product.id] || 0);
            const groups = product.mandatoryGroups || [];
            const productExtras = product.extras || [];
            return (
              <Box component="li" key={product.id} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>{product.name}</Typography>
                    <Typography color="text.secondary">{formatProductPrice(product, formatCurrency)}</Typography>
                  </Box>
                  {variations.length === 0 ? (
                    <>
                      <IconButton aria-label={`Diminuir ${product.name}`} onClick={() => changeQuantity(product.id, -1)} disabled={quantity === 0}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography aria-label={`Quantidade de ${product.name}`}>{quantity}</Typography>
                      <IconButton aria-label={`Aumentar ${product.name}`} onClick={() => changeQuantity(product.id, 1)}>
                        <AddIcon />
                      </IconButton>
                    </>
                  ) : null}
                </Box>
                {variations.map((variation) => {
                  const variationQuantity = variationQuantities[variationKey(product.id, variation.id)] || 0;
                  return (
                    <Box key={variation.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, pl: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography>{variation.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{formatCurrency(variation.price)}</Typography>
                      </Box>
                      <IconButton aria-label={`Diminuir ${product.name} ${variation.name}`} onClick={() => changeVariationQuantity(product.id, variation.id, -1)} disabled={variationQuantity === 0}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography aria-label={`Quantidade de ${product.name} ${variation.name}`}>{variationQuantity}</Typography>
                      <IconButton aria-label={`Aumentar ${product.name} ${variation.name}`} onClick={() => changeVariationQuantity(product.id, variation.id, 1)}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                  );
                })}
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
