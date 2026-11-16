import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';
import { WeperMark } from '../../home/components/WeperMark';
import { HUB_SEGMENTS, resolveSegmentDestination } from '../hubSegments';
import {
  trackBeforeNavigation,
  trackHubLinkClick,
  trackHubSegmentClick,
  trackHubSegmentDemoClick,
} from '../hubAnalytics';
import '../HubSegmentsCarousel.css';

const DRAG_THRESHOLD = 8;

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readGap(element) {
  const raw = window.getComputedStyle(element).columnGap;
  const gap = Number.parseFloat(raw);
  return Number.isFinite(gap) ? gap : 0;
}

function contentLeft(element, item) {
  return item.getBoundingClientRect().left - element.getBoundingClientRect().left + element.scrollLeft;
}

function snapTrack(element) {
  const items = [...element.querySelectorAll('.hub-seg-item')];
  if (!items.length) return;
  const current = element.scrollLeft;
  let target = contentLeft(element, items[0]);
  let best = Infinity;
  items.forEach((item) => {
    const left = contentLeft(element, item);
    const distance = Math.abs(left - current);
    if (distance < best) {
      best = distance;
      target = left;
    }
  });
  element.scrollTo({
    left: Math.max(0, target),
    behavior: reducedMotion() ? 'auto' : 'smooth',
  });
}

function focusableIn(dialog) {
  return [...dialog.querySelectorAll('button:not([disabled]), a[href]')];
}

function SegmentInfoModal({ segment, onClose }) {
  const backdropRef = useRef(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const Icon = segment.icon;
  const demoUrl = resolveSegmentDestination(segment);
  const showPhoto = Boolean(segment.image) && !photoFailed;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const nodes = focusableIn(dialogRef.current);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  async function openWeper(event) {
    event.preventDefault();
    await trackBeforeNavigation(() =>
      trackHubLinkClick('conhecer-weper', 'Conhecer a Weper', PATHS.HOME, {
        segment_id: segment.id,
      })
    );
    window.location.href = PATHS.HOME;
  }

  async function openDemo(event) {
    event.preventDefault();
    if (!demoUrl) return;
    await trackBeforeNavigation(() => trackHubSegmentDemoClick(segment.id, demoUrl));
    window.location.href = demoUrl;
  }

  return (
    <div
      ref={backdropRef}
      className="hub-seg-backdrop"
      onClick={(event) => {
        if (event.target === backdropRef.current) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="hub-seg-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hub-segment-modal-title"
        aria-describedby="hub-segment-modal-desc"
      >
        <div className={`hub-seg-modal-media${showPhoto ? '' : ' hub-seg-modal-media--fallback'}`}>
          {showPhoto ? (
            <img
              src={segment.image}
              alt={`Foto ilustrativa de ${segment.name}`}
              className="hub-seg-modal-photo"
              width="640"
              height="800"
              style={{ objectPosition: segment.imagePosition || 'center' }}
              loading="lazy"
              decoding="async"
              draggable="false"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <Icon className="hub-seg-modal-fallback-icon" size={42} strokeWidth={1.75} aria-hidden="true" />
          )}
          <span className="hub-seg-modal-wave" aria-hidden="true">
            <svg viewBox="0 0 148 112" focusable="false">
              <path
                fill="currentColor"
                d="M0 112V46c20 2 34-28 66-18 26 8 28 36 82 22v62H0z"
              />
            </svg>
            <Icon size={22} strokeWidth={1.75} />
          </span>
        </div>

        <div className="hub-seg-modal-main">
          <div className="hub-seg-dialog-header">
            <div className="hub-seg-dialog-brand">
              <span className="hub-seg-dialog-logo" aria-hidden="true">
                <WeperMark size={28} showWordmark={false} />
              </span>
              <h2 id="hub-segment-modal-title" className="hub-seg-dialog-title">
                {segment.name}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="hub-seg-dialog-close"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="hub-seg-dialog-body">
            <p id="hub-segment-modal-desc" className="hub-seg-dialog-lead">
              {segment.description}
            </p>
            <p className="hub-seg-benefits-label">Como a Weper ajuda</p>
            <ul className="hub-seg-benefits">
              {segment.benefits.map((benefit) => {
                const BenefitIcon = benefit.icon;
                return (
                  <li key={benefit.title}>
                    <span className="hub-seg-benefit-icon" aria-hidden="true">
                      {BenefitIcon ? <BenefitIcon size={18} strokeWidth={1.75} /> : null}
                    </span>
                    <span className="hub-seg-benefit-copy">
                      <span className="hub-seg-benefit-title">{benefit.title}</span>
                      <span className="hub-seg-benefit-desc">{benefit.description}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hub-seg-actions">
            {demoUrl ? (
              <a className="hub-seg-cta" href={demoUrl} onClick={openDemo}>
                Ver demonstração
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            ) : null}
            <a
              className={demoUrl ? 'hub-seg-cta hub-seg-cta--ghost' : 'hub-seg-cta'}
              href={PATHS.HOME}
              onClick={openWeper}
            >
              <span className="hub-seg-cta-mark" aria-hidden="true">
                <WeperMark size={28} showWordmark={false} />
              </span>
              Conhecer a Weper
              {demoUrl ? null : <ArrowRight size={18} aria-hidden="true" />}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HubSegmentsSection() {
  const trackRef = useRef(null);
  const triggerRef = useRef(null);
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const suppressClickRef = useRef(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [selected, setSelected] = useState(null);

  const updateEdges = useCallback(() => {
    const element = trackRef.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    const next = {
      start: element.scrollLeft <= 2,
      end: max <= 2 || element.scrollLeft >= max - 2,
    };
    setEdges((current) => (
      current.start === next.start && current.end === next.end ? current : next
    ));
  }, []);

  useEffect(() => {
    const element = trackRef.current;
    if (!element) return undefined;
    updateEdges();
    const observer = new ResizeObserver(() => updateEdges());
    observer.observe(element);
    return () => observer.disconnect();
  }, [updateEdges]);

  useEffect(() => {
    function onMove(event) {
      const drag = dragRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;
      const delta = event.clientX - drag.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD) drag.moved = true;
      const element = trackRef.current;
      if (!element) return;
      if (drag.moved) {
        element.classList.add('is-dragging');
        element.scrollLeft = drag.scrollLeft - delta;
        event.preventDefault();
      }
    }

    function onUp(event) {
      const drag = dragRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;
      const moved = drag.moved;
      drag.active = false;
      drag.moved = false;
      trackRef.current?.classList.remove('is-dragging');
      if (moved && trackRef.current) {
        suppressClickRef.current = true;
        snapTrack(trackRef.current);
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 90);
      }
      updateEdges();
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [updateEdges]);

  function onPointerDown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const element = trackRef.current;
    if (!element) return;
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
      moved: false,
    };
  }

  function scrollByCard(direction) {
    const element = trackRef.current;
    if (!element) return;
    const item = element.querySelector('.hub-seg-item');
    const amount = (item?.getBoundingClientRect().width || 200) + readGap(element);
    element.scrollBy({
      left: direction * amount,
      behavior: reducedMotion() ? 'auto' : 'smooth',
    });
  }

  function onTrackClick(event) {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const origin = event.target instanceof Element ? event.target : null;
    const card = origin?.closest('[data-segment-id]');
    if (!card || !trackRef.current?.contains(card)) return;
    const segment = HUB_SEGMENTS.find((item) => item.id === card.dataset.segmentId);
    if (!segment) return;

    event.preventDefault();
    triggerRef.current = card;
    trackHubSegmentClick(segment.id);
    setSelected(segment);
  }

  const closeModal = useCallback(() => {
    setSelected(null);
    triggerRef.current?.focus?.();
  }, []);

  return (
    <section className="hub-segments" aria-labelledby="hub-segments-title">
      <div className="hub-segments-heading">
        <h2 id="hub-segments-title" className="hub-segments-title">
          Feita para o seu negócio
        </h2>
        <p className="hub-segments-subtitle">
          Do pequeno delivery ao restaurante completo. A Weper acompanha seu negócio.
        </p>
      </div>

      <div className="hub-segments-carousel">
        <button
          type="button"
          className="hub-seg-arrow hub-seg-arrow--prev"
          onClick={() => scrollByCard(-1)}
          disabled={edges.start}
          aria-label="Segmento anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <ul
          ref={trackRef}
          className="hub-seg-track"
          aria-label="Segmentos atendidos pela Weper"
          onPointerDown={onPointerDown}
          onScroll={updateEdges}
          onClick={onTrackClick}
          onDragStart={(event) => event.preventDefault()}
        >
          {HUB_SEGMENTS.map((segment, index) => {
            const Icon = segment.icon;
            const tone = index % 4;

            return (
              <li key={segment.id} className="hub-seg-item">
                <button
                  type="button"
                  className="hub-seg-card"
                  data-segment-id={segment.id}
                  aria-haspopup="dialog"
                >
                  {segment.image ? (
                    <div className="hub-seg-media">
                      <img
                        src={segment.image}
                        alt={`Foto ilustrativa de ${segment.name}`}
                        className="hub-seg-photo"
                        style={{ objectPosition: segment.imagePosition || 'center' }}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable="false"
                      />
                    </div>
                  ) : (
                    <div className={`hub-seg-media hub-seg-media--tone-${tone}`}>
                      <Icon size={28} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                  )}
                  <span className="hub-seg-access" aria-hidden="true">
                    <ArrowUpRight size={13} />
                  </span>
                  <span className="hub-seg-body">
                    <span className="hub-seg-name">{segment.name}</span>
                    <span className="hub-seg-desc">{segment.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="hub-seg-arrow hub-seg-arrow--next"
          onClick={() => scrollByCard(1)}
          disabled={edges.end}
          aria-label="Próximo segmento"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {selected ? (
        <SegmentInfoModal key={selected.id} segment={selected} onClose={closeModal} />
      ) : null}
    </section>
  );
}
