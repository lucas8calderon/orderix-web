import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { formatCurrency } from '../../../services/accessControl';

export default function DeliveryCartBar({ itemCount, total, onOpen }) {
  if (!itemCount) return null;

  return (
    <div className="delivery-cart-bar-wrap">
      <button type="button" className="delivery-cart-bar" onClick={onOpen}>
        <span className="delivery-cart-bar-left">
          <span className="delivery-cart-icon-wrap" aria-hidden="true">
            <ShoppingCartOutlinedIcon fontSize="small" />
            <span className="delivery-cart-badge">{itemCount}</span>
          </span>
          <span className="delivery-cart-label">Ver meu pedido</span>
        </span>
        <span className="delivery-cart-bar-right">
          <strong>{formatCurrency(total)}</strong>
          <ChevronRightIcon fontSize="small" />
        </span>
      </button>
    </div>
  );
}
