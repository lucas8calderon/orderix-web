import { API_BASE_URL } from '../../../services/apiConfig';
import { defaultMenuImage, DEFAULT_MENU_IMAGE_PATH } from '../../dashboard/menu/utils/defaultMenuImage';

export function resolveDeliveryImage(image) {
  if (!image || !String(image).trim() || image === DEFAULT_MENU_IMAGE_PATH) {
    return defaultMenuImage;
  }
  const value = String(image).trim();
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${API_BASE_URL}${value}`;
  }
  return value;
}

export function storeInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export function productTags(product) {
  if (!product || !Array.isArray(product.tags)) return [];
  return product.tags
    .map((tag) => (typeof tag === 'string' ? tag.trim() : String(tag?.name || '').trim()))
    .filter(Boolean)
    .slice(0, 4);
}

export function productHighlightBadge(product) {
  if (!product) return null;
  const label = product.badgeLabel || product.highlightLabel || product.featuredLabel;
  if (typeof label === 'string' && label.trim()) return label.trim();
  if (product.featured === true || product.highlight === true || product.mostOrdered === true) {
    return 'Destaque';
  }
  return null;
}
