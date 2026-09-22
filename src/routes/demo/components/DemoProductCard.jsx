import { Plus } from 'lucide-react';
import { formatCurrency } from '../../../services/accessControl';

export default function DemoProductCard({ product, onOpen }) {
  const unavailable = product.available === false;

  return (
    <article className={`demo-product-card${unavailable ? ' is-unavailable' : ''}`}>
      <button
        type="button"
        className="demo-product-card__main"
        onClick={() => onOpen(product)}
        disabled={unavailable}
        aria-label={unavailable ? `${product.name} indisponível` : `Ver ${product.name}`}
      >
        <div className="demo-product-card__media">
          <img src={product.image} alt="" loading="lazy" decoding="async" />
          {unavailable ? (
            <span className="demo-product-card__overlay">Indisponível</span>
          ) : null}
        </div>
        <div className="demo-product-card__body">
          <div className="demo-product-card__copy">
            <h3>{product.name}</h3>
            {product.description ? (
              <p className="demo-product-card__desc">{product.description}</p>
            ) : null}
          </div>
          <div className="demo-product-card__footer">
            <p className="demo-product-card__price">{formatCurrency(product.price)}</p>
            {unavailable ? (
              <span className="demo-product-card__unavailable">Indisponível</span>
            ) : (
              <span className="demo-product-card__add" aria-hidden="true">
                <Plus size={18} strokeWidth={2.4} />
                <span className="demo-product-card__add-label">Adicionar</span>
              </span>
            )}
          </div>
        </div>
      </button>
    </article>
  );
}
