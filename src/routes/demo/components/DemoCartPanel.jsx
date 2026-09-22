import {
  Button,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatCurrency } from '../../../services/accessControl';
import { demoItemKey, demoLineTotal } from '../demoCart';

export default function DemoCartPanel({
  open,
  onClose,
  cart,
  totals,
  isMobile,
  onQty,
  onRemove,
  onCheckout,
}) {
  const body = (
    <div className="demo-cart">
      <div className="demo-cart__head">
        <Typography variant="h6">Seu pedido</Typography>
        <Button onClick={onClose}>Fechar</Button>
      </div>
      <div className="demo-cart__body">
        {cart.items.length === 0 ? (
          <p className="demo-cart__empty">Seu carrinho está vazio.</p>
        ) : (
          cart.items.map((item) => (
            <div key={demoItemKey(item)} className="demo-cart-line">
              <div className="demo-cart-line__top">
                <strong>{item.quantity}x {item.name}</strong>
                <span>{formatCurrency(demoLineTotal(item))}</span>
              </div>
              {(item.mandatorySelections || []).map((selection) => (
                <p key={`${selection.groupId}-${selection.selectedItemId}`} className="demo-cart-line__meta">
                  {selection.name}
                </p>
              ))}
              {(item.extras || []).map((extra) => (
                <p key={extra.id} className="demo-cart-line__meta">+ {extra.name}</p>
              ))}
              {item.observation ? (
                <p className="demo-cart-line__meta">Obs.: {item.observation}</p>
              ) : null}
              <div className="demo-qty demo-qty--sm">
                <IconButton size="small" onClick={() => onQty(demoItemKey(item), item.quantity - 1)} aria-label="Diminuir">
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onQty(demoItemKey(item), item.quantity + 1)} aria-label="Aumentar">
                  <AddIcon fontSize="small" />
                </IconButton>
                <Button size="small" onClick={() => onRemove(demoItemKey(item))}>Remover</Button>
              </div>
            </div>
          ))
        )}
        <Divider sx={{ my: 1.5 }} />
        <div className="demo-totals">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="demo-totals">
          <span>Entrega</span>
          <span>{formatCurrency(totals.deliveryFee)}</span>
        </div>
        <div className="demo-totals demo-totals--total">
          <strong>Total</strong>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
      </div>
      <div className="demo-cart__actions">
        <Button
          variant="contained"
          fullWidth
          disabled={cart.items.length === 0}
          onClick={onCheckout}
        >
          Ir para o checkout
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{ className: `demo-cart-paper${isMobile ? ' is-mobile' : ''}` }}
    >
      {body}
    </Drawer>
  );
}
