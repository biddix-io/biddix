import { logger } from './logger';

type EventName = 'bid_placed' | 'auction_viewed' | 'lot_status_changed' | 'error_encountered';

export const trackEvent = (eventName: EventName, properties?: Record<string, any>) => {
  logger.info(`[Analytics] ${eventName}`, properties);

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }

  // Example for Segment or Mixpanel
  // analytics.track(eventName, properties);
};

export const useAnalytics = () => {
  return { trackEvent };
};
