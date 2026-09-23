import { resolveDeliveryImage } from '../utils/resolveDeliveryImage';

export default function DeliveryPromoBanners({ banners }) {
  if (!banners?.length) return null;

  return (
    <section className="delivery-promo" aria-label="Promoções">
      <div className="delivery-promo-scroller">
        {banners.map((banner) => {
          const image = (
            <img
              src={resolveDeliveryImage(banner.image)}
              alt={banner.alt || ''}
              loading="lazy"
              decoding="async"
            />
          );
          if (banner.href) {
            return (
              <a key={banner.id} className="delivery-promo-card" href={banner.href}>
                {image}
              </a>
            );
          }
          return (
            <div key={banner.id} className="delivery-promo-card">
              {image}
            </div>
          );
        })}
      </div>
    </section>
  );
}
