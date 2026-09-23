import { formatCurrency } from '../../../services/accessControl';
import { productHighlightBadge, resolveDeliveryImage } from '../utils/resolveDeliveryImage';

export default function DeliveryFeaturedRow({ products, disabled, onOpen }) {
  if (!products?.length) return null;

  return (
    <section className="delivery-featured" aria-label="Destaques">
      <div className="delivery-section-head">
        <h2 className="delivery-section-title">Destaques</h2>
      </div>
      <div className="delivery-featured-scroller">
        {products.map((product) => {
          const blocked = product.isAvailable === false || disabled;
          const badge = productHighlightBadge(product);
          return (
            <button
              key={product.id}
              type="button"
              className={`delivery-featured-card${product.isAvailable === false ? ' is-unavailable' : ''}`}
              onClick={() => onOpen(product)}
              disabled={blocked}
            >
              <div className="delivery-featured-media">
                <img src={resolveDeliveryImage(product.image)} alt="" loading="lazy" decoding="async" />
                {badge ? <span className="delivery-product-badge">{badge}</span> : null}
              </div>
              <strong className="delivery-featured-name">{product.name}</strong>
              <span className="delivery-featured-price">{formatCurrency(product.value)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
