import React from 'react';
import { Smartphone, Monitor, BarChart3, CreditCard, Shield, Sparkles } from 'lucide-react';
import { LandingImage } from './DeviceMockups';
import '../styles/LandingPremium.css';

function Spotlight({
  id,
  eyebrow,
  title,
  description,
  points,
  imageKey,
  reverse = false,
  shift = false,
  dots = false,
}) {
  return (
    <section
      className={`lp-premium${shift ? ' lp-premium--shift' : ''}`}
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="lp-premium__glow" aria-hidden="true" />
      {dots ? <div className="lp-premium__dots" aria-hidden="true" /> : null}
      <div className={`lp-premium__container lp-spotlight ${reverse ? 'lp-spotlight--reverse' : ''}`.trim()}>
        <div className="lp-premium-copy">
          <span className="lp-premium__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            {eyebrow}
          </span>
          <h2 id={`${id}-title`} className="lp-premium__title">{title}</h2>
          <p className="lp-premium__subtitle">{description}</p>
          <ul className="lp-premium-points">
            {points.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className="lp-premium-points__icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lp-premium-media lp-spotlight__media">
          <LandingImage imageKey={imageKey} className="lp-spotlight__visual" />
        </div>
      </div>
    </section>
  );
}

/** Uso real + Desktop/PDV — sem repetir o banner do hero. */
export function ProductSpotlightSections() {
  return (
    <>
      <Spotlight
        id="atendimento"
        eyebrow="Uso real"
        title={(
          <>
            Atendimento ágil na
            {' '}
            <span className="lp-premium__accent">palma da mão</span>
          </>
        )}
        description="A equipe opera no celular: mesas, pedidos e status do turno. Menos espera e mais foco no cliente."
        imageKey="lifestyle"
        points={[
          { icon: Smartphone, text: 'Mesas, comandas, balcão e pedidos em um toque' },
          { icon: BarChart3, text: 'Resumo do turno com faturamento e status' },
          { icon: Shield, text: 'Histórico e cardápio sempre à mão' },
        ]}
      />

      <Spotlight
        id="painel"
        eyebrow="Desktop / PDV"
        title={(
          <>
            Gestão e caixa
            {' '}
            <span className="lp-premium__accent">no computador</span>
          </>
        )}
        description="Dashboard, cardápio, checkout e impressão térmica na mesma estação, com visão clara para decidir no expediente."
        imageKey="desktop"
        reverse
        shift
        dots
        points={[
          { icon: Monitor, text: 'Indicadores e operação na mesma tela' },
          { icon: BarChart3, text: 'Faturamento, pedidos e status em tempo real' },
          { icon: CreditCard, text: 'Pronto para caixa com impressora térmica' },
        ]}
      />
    </>
  );
}
