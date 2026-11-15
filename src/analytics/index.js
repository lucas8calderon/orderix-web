export {
  acceptAll,
  CONSENT_ACCEPTED,
  CONSENT_KEY,
  CONSENT_REJECTED,
  hasAnalyticsConsent,
  hasMarketingConsent,
  rejectOptional,
  savePreferences,
} from './analyticsConsent';
export { EVENTS, isCommercialPath } from './analyticsEvents';
export { noteArrival } from './campaignTracking';
export { trackBeginCheckout, trackConfirmedPurchase, shouldRecordAcquisition } from './conversionTracking';
export {
  handleCommercialClick,
  startCommercialListeners,
  track,
  trackAnalyticsPageView,
  trackGenerateLead,
  trackPlanSelected,
  trackPlansView,
  trackSubscriptionModalOpened,
  trackWhatsAppClick,
} from './analyticsService';
export { usePlansView } from './usePlansView';
