export default function DemoCategoryNav({ categories, activeId, onSelect }) {
  if (!categories?.length) return null;

  return (
    <nav className="demo-cat-nav" aria-label="Categorias">
      <div className="demo-cat-nav__scroller">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`demo-cat-nav__item${activeId === category.id ? ' is-active' : ''}`}
            onClick={() => onSelect(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
