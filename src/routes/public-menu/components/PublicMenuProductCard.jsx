import { Check } from 'lucide-react';

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
}) {
  const unavailable = product.isAvailable === false;
  const name = product.name || 'Produto';

  return (
    <article
      className={[
        'public-menu-product',
        unavailable ? 'is-unavailable' : '',
        selected ? 'is-selected' : '',
      ].filter(Boolean).join(' ')}
    >
      <img
        src={imageSrc}
        alt=""
        className="public-menu-product-image"
        loading="lazy"
      />
      <div className="public-menu-product-body">
        <div className="public-menu-product-top">
          <p className="public-menu-product-name">{name}</p>
          <p className="public-menu-product-price">{formatPrice(product.value)}</p>
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
