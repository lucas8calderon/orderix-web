import { Link } from 'react-router-dom';
import { demoStorePath, listDemoStores } from '../demoStores';
import { DEMO_EVENTS, trackDemoEvent } from '../demoAnalytics';

export function DemoStoreCards({ onSelect, source = 'demo_index' }) {
  const stores = listDemoStores();

  const handleSelect = (store) => {
    trackDemoEvent(DEMO_EVENTS.STORE_SELECTED, { slug: store.slug, source });
    if (onSelect) onSelect(store);
  };

  return (
    <div className="demo-store-grid">
      {stores.map((store) => (
        <article
          key={store.slug}
          className="demo-store-card"
          style={{ '--demo-accent': store.accent, '--demo-accent-soft': store.accentSoft }}
        >
          <Link
            to={demoStorePath(store.slug)}
            className="demo-store-card__link"
            onClick={() => handleSelect(store)}
          >
            <div className="demo-store-card__media">
              <img src={store.cover} alt="" loading="lazy" decoding="async" />
              <img className="demo-store-card__logo" src={store.logo} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="demo-store-card__body">
              <span className="demo-store-card__type">{store.typeLabel}</span>
              <h3>{store.name}</h3>
              <p>{store.description}</p>
              <span className="demo-store-card__cta">Ver demonstração</span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
