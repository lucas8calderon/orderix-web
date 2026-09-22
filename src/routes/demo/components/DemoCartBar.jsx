import { formatCurrency } from '../../../services/accessControl';

export default function DemoCartBar({ itemCount, total, onOpen }) {
  if (!itemCount) return null;

  return (
    <div className="demo-cart-bar-wrap">
      <button type="button" className="demo-cart-bar" onClick={onOpen}>
        <span className="demo-cart-bar__count">
          {itemCount}
          {' '}
          {itemCount === 1 ? 'item' : 'itens'}
        </span>
        <span className="demo-cart-bar__total">{formatCurrency(total)}</span>
        <span className="demo-cart-bar__cta">Ver</span>
      </button>
    </div>
  );
}
