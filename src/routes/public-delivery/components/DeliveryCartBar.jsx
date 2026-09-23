import { formatCurrency } from '../../../services/accessControl';

export default function DeliveryCartBar({ itemCount, total, onOpen }) {
  if (!itemCount) return null;

  const label = itemCount === 1 ? '1 item' : `${itemCount} itens`;

  return (
    <div className="delivery-cart-bar-wrap">
      <button type="button" className="delivery-cart-bar" onClick={onOpen}>
        <span className="delivery-cart-bar-left">
          <span className="delivery-cart-badge">{itemCount}</span>
          <span className="delivery-cart-label">Ver meu pedido</span>
        </span>
        <span className="delivery-cart-bar-right">
          <span className="delivery-cart-count">{label}</span>
          <strong>{formatCurrency(total)}</strong>
        </span>
      </button>
    </div>
  );
}
