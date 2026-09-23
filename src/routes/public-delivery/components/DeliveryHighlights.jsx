import DeliveryProductCard from './DeliveryProductCard';
import { productHighlightBadge } from '../utils/resolveDeliveryImage';

export function collectHighlights(categories = []) {
  const items = [];
  categories.forEach((category) => {
    (category.products || []).forEach((product) => {
      if (productHighlightBadge(product)) {
        items.push({ product, categoryId: category.id });
      }
    });
  });
  return items.slice(0, 12);
}

export default function DeliveryHighlights({ items, disabled, onOpen, onSeeAll }) {
  if (!items?.length) return null;

  return (
    <section className="delivery-highlights" aria-label="Destaques">
      <div className="delivery-section-head">
        <h2 className="delivery-section-title">Destaques</h2>
        {onSeeAll ? (
          <button type="button" className="delivery-section-link" onClick={onSeeAll}>
            Ver todos
          </button>
        ) : null}
      </div>
      <div className="delivery-highlights-scroller">
        {items.map(({ product }) => (
          <DeliveryProductCard
            key={product.id}
            product={product}
            disabled={disabled}
            onOpen={onOpen}
            variant="rail"
          />
        ))}
      </div>
    </section>
  );
}
