import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { defaultMenuImage } from '../../dashboard/menu/utils/defaultMenuImage';
import { formatProductPrice } from '../../dashboard/menu/utils/productVariations';

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PublicMenuProductCard({
  product,
  imageSrc,
  selected,
  quantity,
  onSelect,
  onIncrease,
  onDecrease,
  onRemove,
  priority = false,
}) {
  const unavailable = product.isAvailable === false || product.sellable === false;
  const name = product.name || 'Produto';
  const [photoSrc, setPhotoSrc] = useState(imageSrc);

  useEffect(() => {
    setPhotoSrc(imageSrc);
  }, [imageSrc]);

  return (
    <article
      className={[
        'public-menu-product',
        unavailable ? 'is-unavailable' : '',
        selected ? 'is-selected' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="public-menu-product-media">
        <img
          src={photoSrc}
          alt=""
          className="public-menu-product-image"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => {
            setPhotoSrc((current) => (current === defaultMenuImage ? current : defaultMenuImage));
          }}
        />
      </div>
      <div className="public-menu-product-body">
        <div className="public-menu-product-top">
          <p className="public-menu-product-name">{name}</p>
          <p className="public-menu-product-price">{formatProductPrice(product, formatPrice)}</p>
        </div>
        {product.portion ? (
          <p className="public-menu-product-meta">{product.portion}</p>
        ) : null}
        {product.observation ? (
          <p className="public-menu-product-obs">{product.observation}</p>
        ) : null}
        {unavailable ? (
          <p className="public-menu-unavailable-label">Indisponível</p>
        ) : null}

        <div className="public-menu-product-actions">
          {!selected ? (
            <button
              type="button"
              className="public-menu-select-btn"
              onClick={() => onSelect(product.id)}
              aria-label={`Selecionar ${name}`}
              aria-pressed="false"
            >
              <span className="public-menu-select-circle" aria-hidden="true" />
              <span>Selecionar</span>
            </button>
          ) : (
            <div className="public-menu-selected-controls">
              <button
                type="button"
                className="public-menu-select-btn is-active"
                onClick={() => onRemove(product.id)}
                aria-label={`Remover ${name} da seleção`}
                aria-pressed="true"
              >
                <span className="public-menu-select-check" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span>Selecionado</span>
              </button>
              <div className="public-menu-qty" role="group" aria-label={`Quantidade de ${name}`}>
                <button
                  type="button"
                  className="public-menu-qty-btn"
                  onClick={() => onDecrease(product.id)}
                  aria-label={`Diminuir quantidade de ${name}`}
                >
                  −
                </button>
                <span className="public-menu-qty-value" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="public-menu-qty-btn"
                  onClick={() => onIncrease(product.id)}
                  aria-label={`Aumentar quantidade de ${name}`}
                  disabled={unavailable}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
