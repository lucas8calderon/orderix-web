import { useEffect, useRef } from 'react';

export default function DeliveryCategoryNav({ categories, activeId, onSelect }) {
  const scrollerRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (!activeRef.current || !scrollerRef.current) return;
    const parent = scrollerRef.current;
    const el = activeRef.current;
    const left = el.offsetLeft - parent.clientWidth / 2 + el.clientWidth / 2;
    parent.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [activeId]);

  if (!categories?.length) return null;

  return (
    <nav className="delivery-category-nav" aria-label="Categorias">
      <div className="delivery-category-nav-scroller" ref={scrollerRef}>
        {categories.map((category) => {
          const active = String(category.id) === String(activeId);
          return (
            <button
              key={category.id}
              type="button"
              ref={active ? activeRef : null}
              className={`delivery-cat-chip${active ? ' is-active' : ''}`}
              onClick={() => onSelect(category.id)}
              aria-current={active ? 'true' : undefined}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
