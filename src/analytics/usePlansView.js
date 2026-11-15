import { useEffect } from 'react';
import { CONSENT_EVENT } from './analyticsConsent';
import { trackPlansView } from './analyticsService';

/** 50% quando a área cabe na tela. Se não couber, a fração que a tela consegue mostrar. */
export function plansVisibilityThreshold(targetHeight, viewportHeight) {
  if (!viewportHeight || viewportHeight <= 0) return 0.5;
  if (!targetHeight || targetHeight <= viewportHeight) return 0.5;
  const maxRatio = viewportHeight / targetHeight;
  return Math.max(0.15, Math.min(0.5, maxRatio * 0.75));
}

export function resolvePlansTarget(section, viewportHeight) {
  if (!section) return null;
  const height = section.getBoundingClientRect?.().height || 0;
  if (viewportHeight > 0 && height > viewportHeight) {
    return section.querySelector('[data-plans-sentinel]') || section;
  }
  return section;
}

export function usePlansView(sectionRef) {
  useEffect(() => {
    const section = sectionRef?.current;
    if (!section || typeof IntersectionObserver !== 'function') return undefined;

    let observer;
    let seen = false;

    const attach = () => {
      if (seen) return;
      observer?.disconnect();
      const viewportHeight = window.innerHeight || 0;
      const target = resolvePlansTarget(section, viewportHeight) || section;
      const height = target.getBoundingClientRect?.().height || 0;
      const threshold = plansVisibilityThreshold(height, viewportHeight);
      observer = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) => (
          entry.isIntersecting && entry.intersectionRatio + 0.001 >= threshold
        ));
        if (!visible || seen) return;
        const result = trackPlansView(window.location.pathname);
        if (result?.sent || result?.reason === 'duplicate') {
          seen = true;
          observer?.disconnect();
        }
      }, { threshold: [threshold] });
      observer.observe(target);
    };

    attach();
    window.addEventListener('resize', attach);
    window.addEventListener('load', attach);
    window.addEventListener(CONSENT_EVENT, attach);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', attach);
      window.removeEventListener('load', attach);
      window.removeEventListener(CONSENT_EVENT, attach);
    };
  }, [sectionRef]);
}
