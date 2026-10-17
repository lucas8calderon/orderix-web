import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { formatCurrency } from '../../../services/accessControl';
import { defaultMenuImage } from '../../dashboard/menu/utils/defaultMenuImage';
import { formatProductPrice } from '../../dashboard/menu/utils/productVariations';
import {
  productHighlightBadge,
  productTags,
  resolveDeliveryImage,
} from '../utils/resolveDeliveryImage';

export default function DeliveryProductCard({ product, disabled, onOpen, priority = false }) {
  const unavailable = product.isAvailable === false || product.sellable === false;
  const blocked = unavailable || disabled;
  const tags = productTags(product);
  const badge = productHighlightBadge(product);
  const resolvedImage = resolveDeliveryImage(product.image);
  const [imageSrc, setImageSrc] = useState(resolvedImage);

  useEffect(() => {
    setImageSrc(resolvedImage);
  }, [resolvedImage]);

  return (
    <article
      className={`delivery-product-card${unavailable ? ' is-unavailable' : ''}${blocked ? ' is-blocked' : ''}`}
    >
      <button
        type="button"
        className="delivery-product-card-main"
        onClick={() => onOpen(product)}
        disabled={blocked}
        aria-label={unavailable ? `${product.name} indisponível` : `Ver ${product.name}`}
      >
        <div className="delivery-product-media">
          <img
            src={imageSrc}
            alt=""
            className="delivery-product-image"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => {
              setImageSrc((current) => (current === defaultMenuImage ? current : defaultMenuImage));
            }}
          />
          {unavailable ? <span className="delivery-product-media-overlay" aria-hidden="true" /> : null}
          {badge ? <span className="delivery-product-badge">{badge}</span> : null}
        </div>

        <div className="delivery-product-body">
          <h3 className="delivery-product-name">{product.name}</h3>
          {product.observation ? (
            <p className="delivery-product-desc">{product.observation}</p>
          ) : null}
          {tags.length > 0 ? (
            <div className="delivery-product-tags">
              {tags.map((tag) => (
                <span key={tag} className="delivery-product-tag">{tag}</span>
              ))}
            </div>
          ) : null}
          {unavailable ? (
            <span className="delivery-product-unavailable">Indisponível</span>
          ) : null}
          <p className="delivery-product-price">{formatProductPrice(product, formatCurrency)}</p>
        </div>
      </button>

      <button
        type="button"
        className="delivery-product-add"
        onClick={() => onOpen(product)}
        disabled={blocked}
        aria-label={unavailable ? `${product.name} indisponível` : `Adicionar ${product.name}`}
      >
        <AddIcon fontSize="small" />
      </button>
    </article>
  );
}
