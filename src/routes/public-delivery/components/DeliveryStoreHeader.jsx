import { useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { resolveDeliveryImage, storeInitials } from '../utils/resolveDeliveryImage';

export default function DeliveryStoreHeader({ catalog }) {
  const [addressOpen, setAddressOpen] = useState(false);
  if (!catalog) return null;

  const coverSrc = catalog.coverImage || catalog.coverUrl || catalog.bannerImage;
  const logoSrc = catalog.logoUrl || catalog.logo || catalog.storeLogo;
  const rating = catalog.rating ?? catalog.averageRating;
  const ratingCount = catalog.ratingCount ?? catalog.reviewsCount;
  const hasAddress = Boolean(catalog.storeAddress && String(catalog.storeAddress).trim());
  const open = Boolean(catalog.open);

  return (
    <header className="delivery-store-header">
      <div
        className={`delivery-store-cover${coverSrc ? '' : ' is-fallback'}`}
        style={coverSrc ? { backgroundImage: `url(${resolveDeliveryImage(coverSrc)})` } : undefined}
        aria-hidden="true"
      />
      <div className="delivery-store-header-inner">
        <div className="delivery-store-brand">
          <div className="delivery-store-logo" aria-hidden="true">
            {logoSrc ? (
              <img src={resolveDeliveryImage(logoSrc)} alt="" loading="lazy" />
            ) : (
              <span>{storeInitials(catalog.storeName)}</span>
            )}
          </div>
          <div className="delivery-store-brand-text">
            <h1 className="delivery-store-title">{catalog.storeName}</h1>
            <div className="delivery-store-meta-line">
              <span className="delivery-store-channel">Delivery</span>
              <span
                className={`delivery-store-status ${open ? 'is-open' : 'is-closed'}`}
                data-testid="delivery-open-badge"
              >
                {open ? 'Aberto agora' : 'Fechado'}
              </span>
            </div>
          </div>
        </div>

        <div className="delivery-store-facts">
          {catalog.estimatedMinutes ? (
            <span className="delivery-store-fact">
              <AccessTimeIcon fontSize="inherit" />
              {catalog.estimatedMinutes} min
            </span>
          ) : null}
          {rating != null && Number.isFinite(Number(rating)) ? (
            <span className="delivery-store-fact">
              <StarRoundedIcon fontSize="inherit" />
              {Number(rating).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              {ratingCount != null ? ` (${ratingCount})` : ''}
            </span>
          ) : null}
          {hasAddress ? (
            <button
              type="button"
              className="delivery-store-fact delivery-store-address-btn"
              onClick={() => setAddressOpen((prev) => !prev)}
              aria-expanded={addressOpen}
            >
              <PlaceOutlinedIcon fontSize="inherit" />
              {addressOpen ? 'Ocultar endereço' : 'Ver endereço'}
            </button>
          ) : null}
        </div>

        {addressOpen && hasAddress ? (
          <p className="delivery-store-address-text">{catalog.storeAddress}</p>
        ) : null}
      </div>
    </header>
  );
}
