import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { defaultMenuImage } from '../../dashboard/menu/utils/defaultMenuImage';
import { activeVariations, formatProductPrice } from '../../dashboard/menu/utils/productVariations';
import { fromPrice, highestPrices } from '../../dashboard/menu/utils/mandatoryChoices';

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
  variationQuantity,
  onSelectVariation,
  onIncreaseVariation,
  onDecreaseVariation,
  onRemoveVariation,
  onConfigure,
  priority = false,
}) {
  const unavailable = product.isAvailable === false || product.sellable === false;
  const name = product.name || 'Produto';
  const variations = activeVariations(product);
  const groups = product.mandatoryGroups || [];
  const pricedFrom = highestPrices(product).length ? fromPrice(product) : null;
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
          <p className="public-menu-product-price">
            {pricedFrom != null ? `A partir de ${formatPrice(pricedFrom)}` : formatProductPrice(product, formatPrice)}
          </p>
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
          {groups.length > 0 && variations.length === 0 ? (
            <button
              type="button"
              className="public-menu-select-btn"
              onClick={() => onConfigure?.(product)}
              disabled={unavailable}
              aria-label={`Escolher ${name}`}
            >
              <span className="public-menu-select-circle" aria-hidden="true" />
              <span>Escolher</span>
            </button>
          ) : variations.length > 0 ? (
            <div className="public-menu-variations" role="group" aria-label={`Variações de ${name}`}>
              {variations.map((variation) => {
                const qty = variationQuantity?.(variation.id) || 0;
                const chosen = qty > 0;
                const label = `${variation.name} de ${name}`;
                return (
                  <div key={variation.id} className="public-menu-variation">
                    <div className="public-menu-variation-copy">
                      <span className="public-menu-variation-name">{variation.name}</span>
                      <span className="public-menu-variation-price">{formatPrice(variation.price)}</span>
                    </div>
                    {!chosen ? (
                      <button
                        type="button"
                        className="public-menu-select-btn"
                        onClick={() => onSelectVariation?.(variation.id)}
                        disabled={unavailable}
                        aria-label={`Escolher ${label}`}
                      >
                        <span className="public-menu-select-circle" aria-hidden="true" />
                        <span>Escolher</span>
                      </button>
                    ) : (
                      <div className="public-menu-selected-controls">
                        <div className="public-menu-qty" role="group" aria-label={`Quantidade de ${label}`}>
                          <button
                            type="button"
                            className="public-menu-qty-btn"
                            onClick={() => onDecreaseVariation?.(variation.id)}
                            aria-label={`Diminuir quantidade de ${label}`}
                          >
                            −
                          </button>
                          <span className="public-menu-qty-value" aria-live="polite">{qty}</span>
                          <button
                            type="button"
                            className="public-menu-qty-btn"
                            onClick={() => onIncreaseVariation?.(variation.id)}
                            aria-label={`Aumentar quantidade de ${label}`}
                            disabled={unavailable}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="public-menu-selection-remove"
                          onClick={() => onRemoveVariation?.(variation.id)}
                          aria-label={`Remover ${label} da seleção`}
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : !selected ? (
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
