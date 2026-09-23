import { resolveDeliveryImage } from '../utils/resolveDeliveryImage';

export function readPromoBanners(catalog) {
  const raw = catalog?.promoBanners ?? catalog?.banners;
  if (!Array.isArray(raw)) return [];
  return raw.filter((banner) => (
    banner && (banner.title || banner.subtitle || banner.image || banner.imageUrl)
  ));
}

export default function DeliveryPromoRail({ banners, onOpenCategory }) {
  if (!banners?.length) return null;

  return (
    <div className="delivery-promo-rail">
      {banners.map((banner, index) => {
        const image = banner.image || banner.imageUrl;
        const key = banner.id ?? `${banner.title || 'banner'}-${index}`;
        const canOpen = banner.categoryId != null && typeof onOpenCategory === 'function';
        return (
          <article key={key} className="delivery-promo-card">
            <div className="delivery-promo-copy">
              {banner.kicker ? <span className="delivery-promo-kicker">{banner.kicker}</span> : null}
              {banner.title ? <h3>{banner.title}</h3> : null}
              {banner.subtitle ? <p>{banner.subtitle}</p> : null}
              {canOpen ? (
                <button type="button" onClick={() => onOpenCategory(banner.categoryId)}>
                  {banner.actionLabel || 'Ver opções'}
                </button>
              ) : null}
            </div>
            {image ? (
              <img src={resolveDeliveryImage(image)} alt="" loading="lazy" decoding="async" />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
