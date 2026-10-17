import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { X } from 'lucide-react';
import MandatoryChoiceList from '../../dashboard/menu/components/MandatoryChoiceList';
import { chargeableUnit, fromPrice, highestPrices, mandatoryReady } from '../../dashboard/menu/utils/mandatoryChoices';

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductChoiceDialog({ product, open, onClose, onConfirm }) {
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const ready = product ? mandatoryReady(product, selections) : false;
  const base = product ? fromPrice(product) : 0;
  const total = product ? chargeableUnit(highestPrices(product).length ? fromPrice(product) : Number(product.value || 0), product, selections) : 0;

  const close = () => {
    setSelections({});
    setQuantity(1);
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" aria-labelledby="product-choice-title">
      <DialogTitle id="product-choice-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {product.name}
        <IconButton onClick={close} aria-label="Fechar produto" size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography sx={{ mb: 2, fontWeight: 700 }}>
          {highestPrices(product).length ? `A partir de ${formatPrice(base)}` : formatPrice(product.value)}
        </Typography>
        <MandatoryChoiceList
          groups={product.mandatoryGroups || []}
          selections={selections}
          onChange={(groupId, ids) => setSelections((prev) => ({ ...prev, [groupId]: ids }))}
          formatCurrency={formatPrice}
        />
        <div className="public-menu-qty" role="group" aria-label={`Quantidade de ${product.name}`}>
          <button type="button" className="public-menu-qty-btn" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Diminuir quantidade">−</button>
          <span className="public-menu-qty-value">{quantity}</span>
          <button type="button" className="public-menu-qty-btn" onClick={() => setQuantity((value) => Math.min(20, value + 1))} aria-label="Aumentar quantidade">+</button>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          disabled={!ready}
          onClick={() => {
            onConfirm(selections, quantity);
            setSelections({});
            setQuantity(1);
          }}
        >
          Adicionar · {ready ? formatPrice((total || 0) * quantity) : formatPrice(0)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
