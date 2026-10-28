import { useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {
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
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { formatCurrency } from '../../../../services/accessControl';
import {
  choiceHint,
  groupLimits,
  groupSatisfied,
  selectedIds,
  toggleChoice,
} from '../../menu/utils/mandatoryChoices';
import { activeVariations } from '../../menu/utils/productVariations';
import { lineUnitPrice } from './cartMath';

function draftError(product, draft) {
  const variations = activeVariations(product);
  if (variations.length > 0 && !draft.variationId) {
    return `Escolha uma variação de ${product?.name || 'o produto'}.`;
  }
  const missing = (product?.mandatoryGroups || []).find((group) => !groupSatisfied(group, draft.selections));
  if (missing) return `Escolha ${missing.name} em ${product?.name || 'o produto'}.`;
  return '';
}

function numericIds(ids) {
  return ids.map((id) => {
    const numeric = Number(id);
    return Number.isFinite(numeric) && String(numeric) === String(id) ? numeric : id;
  });
}

export function ProductCustomizeDialog({ open, product, initialLine, onClose, onConfirm }) {
  const dialogProps = useDialogResponsiveProps({
    paperSx: {
      maxWidth: 520,
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      backgroundImage: 'none',
      borderRadius: '16px',
    },
  });
  const [variationId, setVariationId] = useState(null);
  const [selections, setSelections] = useState({});
  const [extraIds, setExtraIds] = useState([]);
  const [observation, setObservation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !product) return;
    setVariationId(initialLine?.variationId || null);
    setSelections(initialLine?.selections || {});
    setExtraIds(initialLine?.extraIds || []);
    setObservation(initialLine?.observation || '');
    setQuantity(Math.max(1, Number(initialLine?.quantity) || 1));
    setError('');
  }, [open, product, initialLine]);

  const draft = useMemo(() => ({
    product,
    variationId,
    selections,
    extraIds,
    observation,
    quantity,
  }), [product, variationId, selections, extraIds, observation, quantity]);

  if (!product) return null;

  const variations = activeVariations(product);
  const groups = product.mandatoryGroups || [];
  const extras = product.extras || [];
  const unit = lineUnitPrice(draft);

  const confirm = () => {
    const message = draftError(product, draft);
    if (message) {
      setError(message);
      return;
    }
    const normalized = {};
    groups.forEach((group) => {
      normalized[group.id] = numericIds(selectedIds(selections, group.id));
    });
    onConfirm?.({
      product,
      variationId: variationId || null,
      selections: normalized,
      extraIds,
      observation: observation.trim(),
      quantity,
    });
  };

  return (
    <Dialog {...dialogProps} open={open} onClose={onClose} aria-labelledby="customize-product-title">
      <DialogTitle id="customize-product-title">{product.name}</DialogTitle>
      <DialogContent>
        {error ? (
          <Typography role="alert" color="error" sx={{ mb: 1 }}>{error}</Typography>
        ) : null}
        {variations.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 0.5 }}>Variação</Typography>
            <RadioGroup
              value={variationId == null ? '' : String(variationId)}
              onChange={(event) => setVariationId(Number(event.target.value))}
            >
              {variations.map((variation) => (
                <FormControlLabel
                  key={variation.id}
                  value={String(variation.id)}
                  control={<Radio size="small" />}
                  label={`${variation.name} · ${formatCurrency(variation.price)}`}
                />
              ))}
            </RadioGroup>
          </Box>
        ) : null}
        {groups.map((group) => {
          const { max } = groupLimits(group);
          const chosen = selectedIds(selections, group.id).map(String);
          return (
            <Box key={group.id} sx={{ mb: 2 }}>
              <Typography fontWeight={700}>{group.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{choiceHint(group)}</Typography>
              {max === 1 ? (
                <RadioGroup
                  value={chosen[0] || ''}
                  onChange={(event) => {
                    const itemId = Number(event.target.value);
                    setSelections((current) => ({ ...current, [group.id]: [itemId] }));
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
              ) : (
                (group.items || []).map((item) => (
                  <FormControlLabel
                    key={item.id}
                    control={(
                      <Checkbox
                        size="small"
                        checked={chosen.includes(String(item.id))}
                        onChange={() => {
                          setSelections((current) => ({
                            ...current,
                            [group.id]: toggleChoice(group, current, item.id),
                          }));
                        }}
                      />
                    )}
                    label={item.price ? `${item.name} (+ ${formatCurrency(item.price)})` : item.name}
                  />
                ))
              )}
            </Box>
          );
        })}
        {extras.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 0.5 }}>Adicionais</Typography>
            {extras.map((extra) => {
              const extraId = extra.productExtraId;
              const checked = extraIds.some((id) => String(id) === String(extraId));
              return (
                <FormControlLabel
                  key={extraId}
                  control={(
                    <Checkbox
                      size="small"
                      checked={checked}
                      onChange={() => {
                        setExtraIds((current) => (
                          checked
                            ? current.filter((id) => String(id) !== String(extraId))
                            : [...current, extraId]
                        ));
                      }}
                    />
                  )}
                  label={extra.price ? `${extra.name} (+ ${formatCurrency(extra.price)})` : extra.name}
                />
              );
            })}
          </Box>
        ) : null}
        <TextField
          fullWidth
          size="small"
          label="Observação do item"
          value={observation}
          onChange={(event) => setObservation(event.target.value.slice(0, 180))}
          inputProps={{ maxLength: 180 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton aria-label="Diminuir quantidade" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1}>
              <RemoveIcon />
            </IconButton>
            <Typography aria-label="Quantidade a adicionar">{quantity}</Typography>
            <IconButton aria-label="Aumentar quantidade" onClick={() => setQuantity((value) => Math.min(99, value + 1))}>
              <AddIcon />
            </IconButton>
          </Box>
          <Typography fontWeight={700}>{formatCurrency(unit * quantity)}</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Voltar</Button>
        <Button variant="contained" onClick={confirm}>
          {initialLine ? 'Atualizar item' : 'Adicionar ao pedido'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
