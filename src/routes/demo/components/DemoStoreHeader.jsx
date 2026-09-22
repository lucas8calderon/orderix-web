import { Link } from 'react-router-dom';
import { PATHS } from '../../../services/accessControl';

export default function DemoStoreHeader({ store }) {
  if (!store) return null;

  return (
    <header className="demo-store-header">
      <div className="demo-store-cover" aria-hidden="true">
        <img src={store.cover} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="demo-store-header__inner">
        <Link to={PATHS.DEMO} className="demo-store-header__back">
          Todas as demos
        </Link>
        <div className="demo-store-brand">
          <img className="demo-store-logo" src={store.logo} alt="" loading="lazy" decoding="async" />
          <div className="demo-store-brand__info">
            <h1>{store.name}</h1>
            <div className="demo-store-meta">
              <span className="demo-store-status">Aberto</span>
              <span>{store.typeLabel}</span>
              <span>{store.hours}</span>
            </div>
            <p className="demo-store-address">{store.address}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
