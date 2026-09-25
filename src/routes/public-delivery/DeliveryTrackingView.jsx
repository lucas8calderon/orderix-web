import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { formatCurrency } from '../../services/accessControl';
import { WEPER_COMMERCIAL_URL } from '../../config/weperSite';
import {
  buildTelUrl,
  buildWhatsAppUrl,
  formatDeliveryAddressSummary,
  formatEstimateWindow,
  formatPaymentLabel,
  FULFILLMENT,
  getCurrentStatusCard,
  getEstimateCopy,
  getFulfillmentBadge,
  getTrackingSteps,
  itemCount,
  normalizeFulfillment,
  STEP_STATE,
  TRACKING_STATUS,
} from './orderTrackingConfig';

function WeperTrackingPromo() {
  return (
    <div className="dt-weper-promo">
      <section className="dt-weper-card" aria-labelledby="dt-weper-title">
        <p className="dt-weper-brand">
          <span className="dt-weper-logo">weper</span>
          <span className="dt-weper-tagline">Tecnologia para negócios de alimentação</span>
        </p>
        <h2 className="dt-weper-title" id="dt-weper-title">
          Seu estabelecimento também pode ter pedidos online.
        </h2>
        <p className="dt-weper-desc">
          Delivery próprio, cardápio digital e gestão em um só lugar.
        </p>
        <a
          className="dt-weper-cta"
          href={WEPER_COMMERCIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Conhecer a Weper
          <span className="dt-weper-cta-arrow" aria-hidden="true">↗</span>
        </a>
      </section>
      <p className="dt-weper-note">
        Este pedido é atendido pelo estabelecimento. Plataforma desenvolvida pela weper.
      </p>
    </div>
  );
}

function StatusIcon({ name, className }) {
  const props = { className, fontSize: 'inherit', 'aria-hidden': true };
  switch (name) {
    case 'chef':
    case 'ready':
      return <RestaurantIcon {...props} />;
    case 'delivery':
      return <DeliveryDiningIcon {...props} />;
    case 'store':
      return <StorefrontIcon {...props} />;
    case 'cancel':
      return <CancelOutlinedIcon {...props} />;
    case 'received':
    case 'check':
    default:
      return <CheckCircleIcon {...props} />;
  }
}

/**
 * Layout visual compartilhado do acompanhamento de pedido (delivery real e demo).
 */
export default function DeliveryTrackingView({
  order,
  lastUpdatedLabel = 'Atualizado agora',
  subtitle = 'Acompanhamento em tempo real',
  onGoHome,
  homeButtonLabel = 'Voltar ao início',
  showHomeButton = true,
  helpUrl: helpUrlProp,
  helpTitle = 'Precisa de ajuda com o pedido?',
  helpDescription = 'Fale diretamente com o estabelecimento.',
  helpDisabledDescription = 'O estabelecimento ainda não informou um canal de contato.',
  onHelpClick,
  helpAriaLabel = 'Falar com o estabelecimento',
  banner = null,
  actions = null,
  footer,
  refreshError = null,
  onRetryRefresh = null,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const fulfillment = normalizeFulfillment(order?.fulfillment);
  const isPickup = fulfillment === FULFILLMENT.PICKUP;
  const statusCard = order ? getCurrentStatusCard(order) : null;
  const steps = order ? getTrackingSteps(order) : [];
  const badge = getFulfillmentBadge(fulfillment);
  const estimateLabel = getEstimateCopy(fulfillment);
  const estimateWindow = formatEstimateWindow(order?.estimatedReadyFrom, order?.estimatedReadyTo);
  const derivedHelpUrl = helpUrlProp !== undefined
    ? helpUrlProp
    : (buildWhatsAppUrl(order?.storePhone) || buildTelUrl(order?.storePhone));
  const storeAddress = (order?.storeAddress || '').trim();
  const items = order?.items || [];
  const count = itemCount(items);
  const paymentLabel = formatPaymentLabel(order?.paymentMethod, fulfillment, order?.onlinePayment);
  const fulfillmentDetail = isPickup
    ? 'No estabelecimento'
    : formatDeliveryAddressSummary(order);

  const handleCopyAddress = async () => {
    if (!storeAddress) return;
    try {
      await navigator.clipboard.writeText(storeAddress);
    } catch {
      /* ignore */
    }
    setCopyToast(true);
  };

  if (!order) return null;

  return (
    <>
      {refreshError ? (
        <Alert
          severity="warning"
          className="dt-refresh-alert"
          action={onRetryRefresh ? (
            <Button color="inherit" size="small" onClick={onRetryRefresh}>
              Tentar novamente
            </Button>
          ) : null}
        >
          {refreshError}
        </Alert>
      ) : null}

      {banner}

      <header className="dt-header">
        <div className="dt-header-main">
          <Typography className="dt-order-title" component="h1">
            Pedido #{order.id}
          </Typography>
          <Typography className="dt-store-name">{order.storeName || 'Estabelecimento'}</Typography>
          <Typography className="dt-subtitle">{subtitle}</Typography>
        </div>
        <div className={`dt-fulfillment-badge${isPickup ? '' : ' is-delivery'}`} aria-label={badge.label}>
          <StatusIcon name={badge.icon} className="dt-fulfillment-icon" />
          <span>{badge.label}</span>
        </div>
      </header>

      {statusCard ? (
        <section
          className={`dt-status-card tone-${statusCard.tone}${statusCard.emphasize ? ' is-emphasized' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="dt-status-ring" aria-hidden="true">
            <StatusIcon name={statusCard.icon} className="dt-status-icon" />
          </div>
          <div className="dt-status-body">
            <Typography className="dt-status-eyebrow">{statusCard.eyebrow}</Typography>
            <Typography className="dt-status-title" component="h2">{statusCard.title}</Typography>
            <Typography className="dt-status-desc">{statusCard.description}</Typography>
          </div>
        </section>
      ) : null}

      {showHomeButton && onGoHome ? (
        <Button className="dt-home-button" variant="contained" fullWidth onClick={onGoHome}>
          {homeButtonLabel}
        </Button>
      ) : null}

      {actions}

      {order.trackingStatus !== TRACKING_STATUS.CANCELLED ? (
        <section className="dt-estimate-card" aria-label={estimateLabel}>
          <AccessTimeIcon className="dt-estimate-icon" aria-hidden="true" />
          <div className="dt-estimate-body">
            <Typography className="dt-estimate-label">{estimateLabel}</Typography>
            <Typography className="dt-estimate-value">
              {estimateWindow || 'Previsão sendo calculada'}
            </Typography>
          </div>
          <div className="dt-estimate-fresh">
            <span className="dt-fresh-dot" aria-hidden="true" />
            <span>{lastUpdatedLabel}</span>
          </div>
        </section>
      ) : null}

      {isPickup && storeAddress ? (
        <section className="delivery-pickup-address dt-pickup-block">
          <Typography className="delivery-pickup-address-text">{storeAddress}</Typography>
          <IconButton
            className="delivery-pickup-copy"
            size="small"
            aria-label="Copiar endereço"
            onClick={handleCopyAddress}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </section>
      ) : null}

      {steps.length > 0 ? (
        <ol className="dt-timeline" aria-label="Progresso do pedido">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <li
                key={step.id}
                className={`dt-timeline-step state-${step.state.toLowerCase()}`}
              >
                <div className="dt-timeline-rail" aria-hidden="true">
                  <span className="dt-timeline-dot">
                    {step.state === STEP_STATE.COMPLETED ? (
                      <CheckCircleIcon fontSize="inherit" />
                    ) : (
                      <StatusIcon name={step.icon} />
                    )}
                  </span>
                  {!isLast ? <span className="dt-timeline-line" /> : null}
                </div>
                <div className="dt-timeline-content">
                  <div className="dt-timeline-title-row">
                    <Typography className="dt-timeline-label">{step.label}</Typography>
                    {step.timestamp ? (
                      <Typography className="dt-timeline-time" component="time">
                        {step.timestamp}
                      </Typography>
                    ) : null}
                  </div>
                  <Typography className="dt-timeline-desc">{step.description}</Typography>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      <section className="dt-summary-card" aria-label="Resumo do pedido">
        <div className="dt-summary-head">
          <Typography className="dt-summary-title" component="h2">Resumo do pedido</Typography>
          <Button
            className="dt-summary-details"
            onClick={() => setDetailsOpen(true)}
            endIcon={<ChevronRightIcon />}
          >
            Ver detalhes
          </Button>
        </div>
        <div className="dt-summary-body">
          <div className="dt-summary-items">
            <Typography className="dt-summary-count">
              {count} {count === 1 ? 'item' : 'itens'}
            </Typography>
            <ul className="dt-summary-list">
              {items.slice(0, 4).map((item, index) => (
                <li key={`${item.productId || item.name}-${index}`}>
                  {item.quantity}x {item.name}
                </li>
              ))}
              {items.length > 4 ? <li>+ {items.length - 4} mais</li> : null}
            </ul>
          </div>
          <div className="dt-summary-total">
            <Typography className="dt-summary-total-label">Total</Typography>
            <Typography className="dt-summary-total-value">{formatCurrency(order.total)}</Typography>
          </div>
        </div>
        <div className="dt-summary-meta">
          <div className="dt-meta-cell">
            <CreditCardIcon className="dt-meta-icon" aria-hidden="true" />
            <div>
              <Typography className="dt-meta-label">Pagamento</Typography>
              <Typography className="dt-meta-value">{paymentLabel}</Typography>
            </div>
          </div>
          <div className="dt-meta-cell">
            <StatusIcon name={isPickup ? 'store' : 'delivery'} className="dt-meta-icon" />
            <div>
              <Typography className="dt-meta-label">{isPickup ? 'Retirada' : 'Entrega'}</Typography>
              <Typography className="dt-meta-value">{fulfillmentDetail}</Typography>
            </div>
          </div>
        </div>
      </section>

      {onHelpClick ? (
        <button
          type="button"
          className="dt-help-card"
          onClick={onHelpClick}
          aria-label={helpAriaLabel}
        >
          <ChatBubbleOutlineIcon className="dt-help-icon" aria-hidden="true" />
          <div className="dt-help-body">
            <Typography className="dt-help-title">{helpTitle}</Typography>
            <Typography className="dt-help-desc">{helpDescription}</Typography>
          </div>
          <ChevronRightIcon className="dt-help-chevron" aria-hidden="true" />
        </button>
      ) : derivedHelpUrl ? (
        <a
          className="dt-help-card"
          href={derivedHelpUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={helpAriaLabel}
        >
          <ChatBubbleOutlineIcon className="dt-help-icon" aria-hidden="true" />
          <div className="dt-help-body">
            <Typography className="dt-help-title">{helpTitle}</Typography>
            <Typography className="dt-help-desc">{helpDescription}</Typography>
          </div>
          <ChevronRightIcon className="dt-help-chevron" aria-hidden="true" />
        </a>
      ) : (
        <div className="dt-help-card is-disabled" role="note">
          <ChatBubbleOutlineIcon className="dt-help-icon" aria-hidden="true" />
          <div className="dt-help-body">
            <Typography className="dt-help-title">{helpTitle}</Typography>
            <Typography className="dt-help-desc">{helpDisabledDescription}</Typography>
          </div>
        </div>
      )}

      <footer className="dt-footer">
        {footer !== undefined ? footer : <WeperTrackingPromo />}
      </footer>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="dt-details-title"
      >
        <DialogTitle id="dt-details-title" className="dt-details-title">
          Detalhes do pedido
          <IconButton aria-label="Fechar" onClick={() => setDetailsOpen(false)} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="dt-details-content">
          <ul className="dt-details-list">
            {items.map((item, index) => (
              <li key={`${item.productId || item.name}-detail-${index}`} className="dt-details-item">
                <div className="dt-details-item-row">
                  <Typography className="dt-details-name">
                    {item.quantity}x {item.name}
                  </Typography>
                  {item.unitPrice != null ? (
                    <Typography className="dt-details-price">
                      {formatCurrency(Number(item.unitPrice) * Number(item.quantity || 1))}
                    </Typography>
                  ) : null}
                </div>
                {item.observation ? (
                  <Typography className="dt-details-obs">{item.observation}</Typography>
                ) : null}
              </li>
            ))}
          </ul>
          {order.observation ? (
            <Typography className="dt-details-obs" sx={{ mt: 2 }}>
              Obs. do pedido: {order.observation}
            </Typography>
          ) : null}
          <Collapse in>
            <Box className="dt-details-total-row">
              <span>Total</span>
              <strong>{formatCurrency(order.total)}</strong>
            </Box>
          </Collapse>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={copyToast}
        autoHideDuration={2000}
        onClose={() => setCopyToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setCopyToast(false)}>
          Endereço copiado
        </Alert>
      </Snackbar>
    </>
  );
}
