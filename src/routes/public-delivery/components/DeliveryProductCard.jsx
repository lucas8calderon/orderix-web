import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { formatCurrency } from '../../../services/accessControl';
import {
  productHighlightBadge,
  productTags,
  resolveDeliveryImage,
} from '../utils/resolveDeliveryImage';

export default function DeliveryProductCard({ product, disabled, onOpen }) {
  const unavailable = product.isAvailable === false;
  const blocked = unavailable || disabled;
  const tags = productTags(product);
  const badge = productHighlightBadge(product);
  const imageSrc = resolveDeliveryImage(product.image);

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
            loading="lazy"
            decoding="async"
          />
          {badge ? (
            <span className="delivery-product-badge">
              <LocalFireDepartmentIcon fontSize="inherit" />
              {badge}
            </span>
          ) : null}
        </div>

        <div className="delivery-product-body">
          <div className="delivery-product-top">
            <h3 className="delivery-product-name">{product.name}</h3>
            <p className="delivery-product-price">{formatCurrency(product.value)}</p>
          </div>
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
        </div>
      </button>

      {!unavailable ? (
        <button
          type="button"
          className="delivery-product-add"
          onClick={() => onOpen(product)}
          disabled={disabled}
          aria-label={`Adicionar ${product.name}`}
        >
          <AddIcon fontSize="small" />
        </button>
      ) : null}
    </article>
  );
}
