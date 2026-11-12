import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ORDER_FLOW, SHOWCASE_BLOCKS } from '../featureShowcaseData';
import '../styles/FeatureShowcase.css';

const SCREEN_INTERVAL_MS = 4800;
const FLOW_INTERVAL_MS = 4200;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** `seen` liga uma vez (entrada e carga das telas); `visible` acompanha a tela (rotação). */
function useInView(ref) {
  const supported = typeof IntersectionObserver === 'function';
  const [state, setState] = useState({ seen: !supported, visible: !supported });
  useEffect(() => {
    const node = ref.current;
    if (!supported || !node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setState(current => {
        const visible = entry.isIntersecting;
        const seen = current.seen || visible;
        return current.seen === seen && current.visible === visible ? current : { seen, visible };
      });
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, supported]);
  return state;
}

/** Avança sozinho enquanto o bloco está na tela e ninguém escolheu uma tela. */
function useRotation(count, running, interval) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!running || count < 2) return undefined;
    const timer = setInterval(() => setActive(current => (current + 1) % count), interval);
    return () => clearInterval(timer);
  }, [count, running, interval]);
  return [active, setActive];
}

/** Moldura de aparelho em CSS com as telas empilhadas; só a ativa fica visível. */
function DeviceFrame({ type, size, screens, active, loadAll, className = '' }) {
  return (
    <div className={`wp-device wp-device--${type} ${className}`.trim()}>
      <div className="wp-device__screen" style={{ aspectRatio: `${size.width} / ${size.height}` }}>
        {screens.map((screen, index) => (
          index === active || loadAll ? (
            <img
              key={screen.src}
              src={screen.src}
              alt={index === active ? screen.alt : ''}
              aria-hidden={index === active ? undefined : true}
              className={index === active ? 'is-active' : undefined}
              width={size.width}
              height={size.height}
              loading="lazy"
              decoding="async"
            />
          ) : null
        ))}
      </div>
      {type === 'laptop' ? <div className="wp-device__base" aria-hidden="true" /> : null}
    </div>
  );
}

function BlockActions({ cta, link, extraLink }) {
  return (
    <div className="wp-fs-actions">
      <a className="wp-button wp-button--primary" href={cta.href}>{cta.label}<ArrowRight size={18} aria-hidden="true" /></a>
      {link ? <Link to={link.to} className="wp-text-link">{link.label} <ArrowRight size={16} aria-hidden="true" /></Link> : null}
      {extraLink ? <Link to={extraLink.to} className="wp-text-link wp-fs-extra-link">{extraLink.label} <ArrowRight size={16} aria-hidden="true" /></Link> : null}
    </div>
  );
}

function BlockHead({ block, headingId }) {
  return (
    <div className="wp-fs-head">
      <span className="wp-kicker">{block.kicker}</span>
      <p className="wp-fs-problem">{block.problem}</p>
      <h3 id={headingId}>{block.title}</h3>
      <p className="wp-fs-text">{block.text}</p>
    </div>
  );
}

function OrderFlow() {
  const ref = useRef(null);
  const { seen, visible } = useInView(ref);
  const [touched, setTouched] = useState(false);
  const [hovering, setHovering] = useState(false);
  const running = visible && !touched && !hovering && !prefersReducedMotion();
  const [active, setActive] = useRotation(ORDER_FLOW.steps.length, running, FLOW_INTERVAL_MS);
  const step = ORDER_FLOW.steps[active];
  const unique = key => ORDER_FLOW.steps.map(item => item[key]).filter((item, index, list) => list.indexOf(item) === index);
  const phones = unique('phone');
  const tablets = unique('tablet');
  const choose = index => { setTouched(true); setActive(index); };

  return (
    <article
      ref={ref}
      className={`wp-fs-row wp-fs-row--flow ${seen ? 'is-visible' : ''}`.trim()}
      aria-labelledby="wp-fs-cozinha"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <BlockHead block={ORDER_FLOW} headingId="wp-fs-cozinha" />
      <div className={`wp-fs-visual wp-fs-stage is-focus-${step.focus}`}>
        <DeviceFrame type="tablet" size={ORDER_FLOW.tabletSize} screens={tablets} active={tablets.indexOf(step.tablet)} loadAll={seen} />
        <DeviceFrame type="phone" size={ORDER_FLOW.phoneSize} screens={phones} active={phones.indexOf(step.phone)} loadAll={seen} />
        <p className="wp-fs-note">Demonstração com dados fictícios</p>
      </div>
      <div className="wp-fs-body">
        <ol className="wp-fs-steps" aria-label="Caminho do pedido">
          {ORDER_FLOW.steps.map((item, index) => (
            <li key={item.label}>
              <button
                type="button"
                className={index === active ? 'is-active' : undefined}
                aria-current={index === active ? 'step' : undefined}
                onClick={() => choose(index)}
              >
                <span className="wp-fs-step-number" aria-hidden="true">{index + 1}</span>
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              </button>
            </li>
          ))}
        </ol>
        <BlockActions cta={ORDER_FLOW.cta} link={ORDER_FLOW.link} />
      </div>
    </article>
  );
}

function ShowcaseBlock({ block, reversed }) {
  const ref = useRef(null);
  const { seen, visible } = useInView(ref);
  const [touched, setTouched] = useState(false);
  const [hovering, setHovering] = useState(false);
  const running = visible && !touched && !hovering && !prefersReducedMotion();
  const [active, setActive] = useRotation(block.screens.length, running, SCREEN_INTERVAL_MS);
  const headingId = `wp-fs-${block.id}`;
  const choose = index => { setTouched(true); setActive(index); };

  return (
    <article
      ref={ref}
      className={`wp-fs-row ${reversed ? 'is-reversed' : ''} ${seen ? 'is-visible' : ''}`.replace(/\s+/g, ' ').trim()}
      aria-labelledby={headingId}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <BlockHead block={block} headingId={headingId} />
      <div className={`wp-fs-visual wp-fs-visual--${block.device}`}>
        <DeviceFrame type={block.device} size={block.size} screens={block.screens} active={active} loadAll={seen} />
        {block.screens.length > 1 ? (
          <div className="wp-fs-tabs" role="group" aria-label={`Telas: ${block.kicker.toLowerCase()}`}>
            {block.screens.map((screen, index) => (
              <button type="button" key={screen.label} aria-pressed={index === active} onClick={() => choose(index)}>{screen.label}</button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="wp-fs-body">
        <ul className="wp-fs-points">
          {block.points.map(point => <li key={point}><CheckCircle2 size={18} aria-hidden="true" />{point}</li>)}
        </ul>
        <BlockActions cta={block.cta} link={block.link} extraLink={block.extraLink} />
      </div>
    </article>
  );
}

export default function FeatureShowcase() {
  return (
    <section id="funcionalidades" className="wp-section wp-fs">
      <div className="wp-container">
        <div className="wp-section-heading">
          <div>
            <span className="wp-kicker">FUNCIONALIDADES</span>
            <h2>Tudo o que seu estabelecimento precisa,<br /><em>em um só lugar.</em></h2>
          </div>
          <p>Do pedido à cozinha, do atendimento ao faturamento. Conheça as ferramentas que simplificam sua operação.</p>
        </div>
        <OrderFlow />
        {SHOWCASE_BLOCKS.map((block, index) => <ShowcaseBlock key={block.id} block={block} reversed={index % 2 === 0} />)}
      </div>
    </section>
  );
}
