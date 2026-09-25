import { useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { formatCurrency } from '../../../services/accessControl';
import { resolveDeliveryImage, storeInitials } from '../utils/resolveDeliveryImage';
import { offersDelivery, offersPickup } from '../utils/fulfillmentModes';
import { storeTypeLabel } from '../utils/catalogHighlights';

export default function DeliveryStoreHeader({
  catalog,
  fulfillmentModes = ['DELIVERY', 'PICKUP'],
  accountSlot,
  account = null,
}) {
  const [addressOpen, setAddressOpen] = useState(false);
  if (!catalog) return null;

  const coverSrc = catalog.coverImage || catalog.coverUrl || catalog.bannerImage;
  const logoSrc = catalog.logoUrl || catalog.logo || catalog.storeLogo;
  const hasAddress = Boolean(catalog.storeAddress && String(catalog.storeAddress).trim());
  const open = Boolean(catalog.open);
  const typeLabel = storeTypeLabel(catalog);
  const fee = Number(catalog.deliveryFee || 0);
  const showFee = offersDelivery(fulfillmentModes) && fee > 0 && !catalog.usesNeighborhoodPricing;
  const accountNode = accountSlot || account;
  const addressHint = hasAddress
    ? (offersPickup(fulfillmentModes) && !offersDelivery(fulfillmentModes) ? 'Retirada' : 'Endereço')
    : '';

  return (
    <header className="delivery-store-header">
      <div
        className={`delivery-store-cover${coverSrc ? '' : ' is-fallback'}`}
        style={coverSrc ? { backgroundImage: `url(${resolveDeliveryImage(coverSrc)})` } : undefined}
        aria-hidden="true"
      />
      {accountNode ? <div className="delivery-store-toolbar">{accountNode}</div> : null}

      <div className="delivery-store-header-inner">
        <div className="delivery-store-identity">
          <div className="delivery-store-logo" aria-hidden={!logoSrc}>
            {logoSrc ? (
              <img src={resolveDeliveryImage(logoSrc)} alt="" loading="lazy" />
            ) : (
              <span>{storeInitials(catalog.storeName)}</span>
            )}
          </div>
          <div className="delivery-store-brand-text">
            <h1 className="delivery-store-title">{catalog.storeName}</h1>
            <div className="delivery-store-meta-line">
              {typeLabel ? <span className="delivery-store-type">{typeLabel}</span> : null}
              <span
                className={`delivery-store-status ${open ? 'is-open' : 'is-closed'}`}
                data-testid="delivery-open-badge"
              >
                <span className="delivery-store-status-dot" aria-hidden="true" />
                {open ? 'Aberto agora' : 'Fechado'}
              </span>
            </div>
          </div>
        </div>

        <div className="delivery-store-info" role="region" aria-label="Informações da loja">
          {hasAddress ? (
            <button
              type="button"
              className="delivery-store-info-item delivery-store-address-btn"
              onClick={() => setAddressOpen((prev) => !prev)}
              aria-expanded={addressOpen}
              aria-label={addressOpen ? 'Ocultar endereço' : 'Ver endereço'}
            >
              <PlaceOutlinedIcon fontSize="inherit" />
              <span>
                <strong>{addressHint}</strong>
                {addressOpen ? catalog.storeAddress : String(catalog.storeAddress).split(',')[0]}
              </span>
            </button>
          ) : null}
          {catalog.estimatedMinutes ? (
            <span className="delivery-store-info-item">
              <AccessTimeIcon fontSize="inherit" />
              <span>
                <strong>Previsão</strong>
                {catalog.estimatedMinutes} min
              </span>
            </span>
          ) : null}
          {showFee ? (
            <span className="delivery-store-info-item">
              <LocalShippingOutlinedIcon fontSize="inherit" />
              <span>
                <strong>Taxa</strong>
                {formatCurrency(fee)}
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
