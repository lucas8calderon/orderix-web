import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, Divider, IconButton, Typography } from '@mui/material';
import { formatCurrency } from '../../../services/accessControl';
import { itemKey, lineTotal } from '../../../services/deliveryCart';

export default function DeliveryCartPanel({
  items,
  totals,
  closed,
  onQuantity,
  onRemove,
  onClear,
  onContinue,
  onCheckout,
  showContinue = true,
}) {
  if (!items?.length) {
    return (
      <div className="delivery-cart-empty">
        <Typography className="delivery-empty-title">Carrinho vazio</Typography>
        <Typography className="delivery-empty-copy">Adicione itens do cardápio para montar o pedido.</Typography>
      </div>
    );
  }

  return (
    <div className="delivery-cart-panel">
      <ul className="delivery-cart-lines">
        {items.map((item) => (
          <li key={itemKey(item)} className="delivery-cart-line">
            <div className="delivery-line">
              <Typography fontWeight={700}>{item.name}</Typography>
              <Typography>{formatCurrency(lineTotal(item))}</Typography>
            </div>
            {(item.extras || []).map((extra) => (
              <Typography key={extra.productExtraId} variant="caption" display="block">+ {extra.name}</Typography>
            ))}
            {item.observation ? <Typography variant="caption">Obs.: {item.observation}</Typography> : null}
            <div className="delivery-cart-line-actions">
              <IconButton
                size="small"
                onClick={() => onQuantity(itemKey(item), item.quantity - 1)}
                aria-label="Diminuir"
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <span className="delivery-cart-qty">{item.quantity}</span>
              <IconButton
                size="small"
                onClick={() => onQuantity(itemKey(item), item.quantity + 1)}
                aria-label="Aumentar"
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <Button size="small" onClick={() => onRemove(itemKey(item))}>Remover</Button>
            </div>
          </li>
        ))}
      </ul>
      <Divider sx={{ my: 1 }} />
      <div className="delivery-line"><span>Produtos</span><span>{formatCurrency(totals.subtotal)}</span></div>
      <div className="delivery-line"><span>Entrega</span><span>{formatCurrency(totals.deliveryFee)}</span></div>
      <div className="delivery-line"><strong>Total</strong><strong>{formatCurrency(totals.total)}</strong></div>
      <div className="delivery-cart-panel-actions">
        <Button onClick={onClear}>Limpar</Button>
        {showContinue ? <Button onClick={onContinue}>Continuar comprando</Button> : null}
        <Button
          variant="contained"
          disabled={closed || items.length === 0}
          onClick={onCheckout}
        >
          Finalizar pedido
        </Button>
      </div>
    </div>
  );
}
