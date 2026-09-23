import { productHighlightBadge } from './resolveDeliveryImage';

export function collectFeaturedProducts(catalog) {
  const seen = new Set();
  const featured = [];
  (catalog?.categories || []).forEach((category) => {
    (category.products || []).forEach((product) => {
      if (seen.has(product.id)) return;
      if (!productHighlightBadge(product)) return;
      seen.add(product.id);
      featured.push(product);
    });
  });
  return featured;
}

export function collectPromoBanners(catalog) {
  const raw = catalog?.promoBanners || catalog?.banners || catalog?.promotionalBanners;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === 'string' && item.trim()) {
        return { id: `promo-${index}`, image: item.trim(), href: '', alt: '' };
      }
      const image = item.image || item.imageUrl || item.coverUrl || item.src;
      if (!image || !String(image).trim()) return null;
      return {
        id: item.id || `promo-${index}`,
        image: String(image).trim(),
        href: item.href || item.url || '',
        alt: item.alt || item.title || '',
      };
    })
    .filter(Boolean);
}

export function storeTypeLabel(catalog) {
  const value = catalog?.storeType || catalog?.establishmentType || catalog?.cuisine || catalog?.categoryLabel;
  if (typeof value !== 'string') return '';
  return value.trim();
}
