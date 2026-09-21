import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Sticky category nav + IntersectionObserver scroll-spy.
 * Pausing observer updates while programmatic scroll avoids flicker.
 */
export default function useCategoryScrollSpy(categoryIds = [], { enabled = true, offset = 140 } = {}) {
  const [activeId, setActiveId] = useState(null);
  const lockRef = useRef(false);
  const unlockTimer = useRef(null);
  const idsKey = categoryIds.join(',');

  useEffect(() => {
    if (!enabled || !categoryIds.length) {
      setActiveId(null);
      return undefined;
    }

    setActiveId((prev) => (categoryIds.includes(prev) ? prev : categoryIds[0]));

    const elements = categoryIds
      .map((id) => document.getElementById(`delivery-cat-${id}`))
      .filter(Boolean);

    if (!elements.length) return undefined;
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0];
        if (!top) return;
        const raw = top.target.getAttribute('data-category-id');
        if (raw == null) return;
        const next = Number.isNaN(Number(raw)) ? raw : Number(raw);
        setActiveId(next);
      },
      {
        root: null,
        rootMargin: `-${offset}px 0px -50% 0px`,
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // idsKey captures categoryIds identity without unstable array refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, idsKey, offset]);

  const scrollToCategory = useCallback((id) => {
    const el = document.getElementById(`delivery-cat-${id}`);
    if (!el) return;
    setActiveId(id);
    lockRef.current = true;
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    unlockTimer.current = window.setTimeout(() => {
      lockRef.current = false;
    }, 900);
  }, []);

  useEffect(() => () => {
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
  }, []);

  return { activeId, setActiveId, scrollToCategory };
}
