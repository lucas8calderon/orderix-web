import React from 'react';
import {
  Coffee,
  Cone,
  Cookie,
  Store,
  UtensilsCrossed,
  Wine,
  Beer,
  Sandwich,
} from 'lucide-react';

const SEGMENTS = [
  { icon: UtensilsCrossed, label: 'Restaurantes' },
  { icon: Beer, label: 'Bares' },
  { icon: Coffee, label: 'Cafeterias' },
  { icon: Store, label: 'Lanchonetes' },
  { icon: Cone, label: 'Sorveterias' },
  { icon: Wine, label: 'Adegas' },
  { icon: Cookie, label: 'Pastelarias' },
  { icon: Sandwich, label: 'Hamburguerias' },
];

const SegmentsStrip = () => {
  return (
    <section className="segments-strip" id="solucoes" aria-label="Tipos de estabelecimento">
      <div className="lp-container segments-strip__inner">
        <p className="segments-strip__label">Para todos os tipos de estabelecimento</p>
        <div className="segments-strip__track" role="list">
          {SEGMENTS.map(({ icon: Icon, label }) => (
            <span key={label} className="segments-chip" role="listitem">
              <Icon aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SegmentsStrip;
