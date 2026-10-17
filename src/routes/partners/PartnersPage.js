import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Handshake,
  Headphones,
  Layers,
  Megaphone,
  Menu,
  MessageCircle,
  Printer,
  Repeat,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { getFeatureById } from '../../config/weperFeatures';
import { formatPrice } from '../../config/pricingTiers';
import { PATHS } from '../../services/accessControl';
import { WeperMark } from '../home/components/WeperMark';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../home/landingAssets';
import '../home/styles/Rebrand.css';
import PartnersSimulator from './PartnersSimulator';
import { applyPartnerDocumentMeta } from './partnerSeo';
import {
  PARTNER_ADVANTAGES,
  PARTNER_AUDIENCE,
  PARTNER_DEFAULT_RATE,
  PARTNER_FAQS,
  PARTNER_SOLUTIONS,
  PARTNER_STEPS,
  PARTNER_WHATSAPP_MESSAGE,
  buildPartnerExamples,
  getPartnerReferencePlan,
} from './partnerProgram';
import './Partners.css';

const STEP_ICONS = {
  join: Handshake,
  refer: Store,
  subscribe: BadgeCheck,
  receive: Repeat,
};

const ADVANTAGE_ICONS = {
  recurring: Repeat,
  ready: Sparkles,
  fit: Layers,
  together: TrendingUp,
  clear: ShieldCheck,
  support: Headphones,
};

const AUDIENCE_ICONS = [Users, Megaphone, MessageCircle, Briefcase];

const SOLUTIONS = PARTNER_SOLUTIONS.map((item) => {
  const feature = item.featureId ? getFeatureById(item.featureId) : null;
  return {
    id: item.id,
    title: item.title,
    description: item.description || feature?.description || '',
    Icon: feature?.Icon || Printer,
  };
});

function scrollToSection(event, sectionId) {
  event.preventDefault();
  const element = document.getElementById(sectionId);
  if (!element) return;
  const reduce = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  window.history?.replaceState?.(null, '', `#${sectionId}`);
}

export default function PartnersPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const reference = getPartnerReferencePlan();
  const examples = buildPartnerExamples(reference, PARTNER_DEFAULT_RATE);

  useEffect(() => applyPartnerDocumentMeta(), []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const join = (event) => {
    if (event?.preventDefault) scrollToSection(event, 'quero-ser-parceiro');
    closeMenu();
  };

  return (
    <div className="wp-site wp-partners">
      <a className="wp-skip" href="#wp-main">Ir para o conteúdo</a>
      <header className="wp-header">
        <div className="wp-container wp-header-inner">
          <Link to={PATHS.HOME} className="wp-logo" aria-label="Weper, início" onClick={closeMenu}>
            <WeperMark size={34} />
          </Link>
          <button
            ref={menuButton}
            className="wp-menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="wp-partners-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav
            id="wp-partners-navigation"
            aria-label="Navegação principal"
            className={menuOpen ? 'wp-navigation is-open' : 'wp-navigation'}
          >
            <a href="/#solucoes" onClick={closeMenu}>Soluções</a>
            <a href="/#plans" onClick={closeMenu}>Preços</a>
            <Link to={PATHS.PARTNERS} aria-current="page" onClick={closeMenu}>Parceiros</Link>
            <Link to={PATHS.LOGIN} className="wp-mobile-login" onClick={closeMenu}>Entrar <ArrowUpRight size={15} /></Link>
          </nav>
          <div className="wp-header-actions">
            <Link to={PATHS.LOGIN}>Entrar <ArrowUpRight size={15} /></Link>
            <button type="button" className="wp-button wp-button--primary" onClick={join}>Quero ser parceiro</button>
          </div>
        </div>
      </header>

      <main id="wp-main">
        <section className="wp-hero" aria-labelledby="partner-hero-title">
          <div className="wp-container wp-hero-grid">
            <div className="wp-hero-copy">
              <span className="wp-eyebrow"><span className="wp-blue-dot" /> Programa de Parceiros Weper</span>
              <h1 id="partner-hero-title">
                Indique a Weper. <em>Cresça junto com a gente.</em> <span aria-hidden="true">💙</span>
              </h1>
              <p>
                Faça parte do nosso programa de parceiros, indique estabelecimentos que podem se beneficiar das soluções Weper e tenha a oportunidade de receber comissões recorrentes pelas assinaturas.
              </p>
              <div className="wp-actions">
                <a className="wp-button wp-button--primary" href="#simulador" onClick={(event) => scrollToSection(event, 'simulador')}>
                  Simular meus ganhos <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a className="wp-button wp-button--outline" href="#quero-ser-parceiro" onClick={join}>
                  Quero ser parceiro
                </a>
              </div>
              <div className="wp-hero-assurance">
                <span><CheckCircle2 size={15} aria-hidden="true" /> Indicação de estabelecimentos</span>
                <span><CheckCircle2 size={15} aria-hidden="true" /> Comissão sobre assinaturas pagas</span>
              </div>
            </div>
            <div className="wp-partners-stage" aria-hidden="true">
              <div className="wp-stage-orbit" />
              <div className="wp-partners-board">
                <div className="wp-window-bar">
                  <div className="wp-window-dots"><i /><i /><i /></div>
                  <span>Crescimento da parceria</span>
                  <span className="wp-window-lock"><Layers size={13} /> Weper</span>
                </div>
                <div className="wp-partners-board-body">
                  <p>Receita recorrente</p>
                  <strong>Indicações que continuam ativas</strong>
                  <div className="wp-partners-board-metrics">
                    <div><span>Indicar</span><b>Apresente</b></div>
                    <div><span>Assinar</span><b>Cliente paga</b></div>
                    <div><span>Receber</span><b>Todo mês</b></div>
                  </div>
                  <div className="wp-partners-board-bars">
                    {[42, 56, 48, 70, 63, 84, 76, 96].map((height) => (
                      <span key={height} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <small>Visualização ilustrativa</small>
                </div>
              </div>
              <div className="wp-floating-note">
                <span><TrendingUp size={18} /></span>
                <div>
                  <strong>Parceria em crescimento</strong>
                  <small>A comissão acompanha a mensalidade.</small>
                </div>
              </div>
            </div>
          </div>
          <div className="wp-container wp-audience">
            <span>QUEM PODE PARTICIPAR</span>
            <div>
              {PARTNER_AUDIENCE.map((label, index) => {
                const Icon = AUDIENCE_ICONS[index];
                return <span key={label}><Icon aria-hidden="true" />{label}</span>;
              })}
            </div>
          </div>
        </section>

        <PartnersSimulator />

        <section id="exemplos" className="wp-section" aria-labelledby="partner-examples-title">
          <div className="wp-container">
            <div className="wp-section-heading">
              <div>
                <span className="wp-kicker">EXEMPLOS ILUSTRATIVOS</span>
                <h2 id="partner-examples-title">Três jeitos de participar.<br /><em>A mesma regra de cálculo.</em></h2>
              </div>
              <p>
                Estimativa mensal com a faixa {reference.label}, mensalidade de {formatPrice(reference.monthlyPrice)} e comissão ilustrativa de {PARTNER_DEFAULT_RATE}%.
              </p>
            </div>
            <div className="wp-partners-examples">
              {examples.map((example) => (
                <article key={example.id} className="wp-partners-example">
                  <h3>{example.title}</h3>
                  <p>{example.text}</p>
                  <p className="wp-partners-example-count">{example.stores} estabelecimentos</p>
                  <p className="wp-partners-example-value">
                    <strong>{formatPrice(example.estimate.monthlyCommission)}</strong>
                    <span>de comissão mensal estimada</span>
                  </p>
                </article>
              ))}
            </div>
            <p className="wp-partners-examples-note">Os resultados dependem das assinaturas efetivamente pagas. Estes exemplos não são uma meta nem um ganho garantido.</p>
          </div>
        </section>

        <section id="solucoes-weper" className="wp-section wp-partners-solutions-section" aria-labelledby="partner-solutions-title">
          <div className="wp-container">
            <div className="wp-section-heading">
              <div>
                <span className="wp-kicker">O QUE VOCÊ VAI INDICAR</span>
                <h2 id="partner-solutions-title">Conheça a Weper<br /><em>antes de apresentar.</em></h2>
              </div>
              <p>Um resumo do que o estabelecimento encontra na plataforma. Assim fica mais fácil explicar o valor da indicação.</p>
            </div>
            <div className="wp-partners-solutions">
              {SOLUTIONS.map((item) => (
                <article key={item.id} className="wp-partners-solution">
                  <span className="wp-feature-icon"><item.Icon size={22} aria-hidden="true" /></span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
            <a className="wp-button wp-button--outline wp-partners-solutions-cta" href="/#solucoes">
              Conhecer as funcionalidades <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section id="vantagens" className="wp-section" aria-labelledby="partner-advantages-title">
          <div className="wp-container">
            <div className="wp-section-heading">
              <div>
                <span className="wp-kicker">POR QUE PARTICIPAR</span>
                <h2 id="partner-advantages-title">Vantagens de indicar<br /><em>uma plataforma pronta.</em></h2>
              </div>
              <p>O programa foi pensado para quem quer apresentar a Weper e acompanhar o resultado das indicações elegíveis.</p>
            </div>
            <div className="wp-partners-advantages">
              {PARTNER_ADVANTAGES.map((item) => {
                const Icon = ADVANTAGE_ICONS[item.id];
                return (
                  <article key={item.id} className="wp-partners-card">
                    <span className="wp-feature-icon"><Icon size={22} aria-hidden="true" /></span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="wp-section wp-partners-steps-section" aria-labelledby="partner-steps-title">
          <div className="wp-container">
            <div className="wp-section-heading">
              <div>
                <span className="wp-kicker">COMO FUNCIONA</span>
                <h2 id="partner-steps-title">Quatro passos.<br /><em>Uma parceria simples de entender.</em></h2>
              </div>
              <p>Você indica. O estabelecimento conhece a Weper. Se a assinatura elegível for paga, a comissão pode continuar mês a mês.</p>
            </div>
            <ol className="wp-partners-steps">
              {PARTNER_STEPS.map((step, index) => {
                const Icon = STEP_ICONS[step.id];
                return (
                  <li key={step.id} className="wp-partners-step">
                    <span className="wp-partners-step-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span className="wp-feature-icon"><Icon size={22} aria-hidden="true" /></span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="faq" className="wp-section" aria-labelledby="partner-faq-title">
          <div className="wp-container wp-faq-grid">
            <div>
              <span className="wp-kicker">PERGUNTAS FREQUENTES</span>
              <h2 id="partner-faq-title">Antes de chamar<br /><em>a gente, vale ler.</em></h2>
              <p>As regras finais da parceria são apresentadas na formalização. Aqui você encontra o que já dá para saber.</p>
            </div>
            <div className="wp-faq-list">
              {PARTNER_FAQS.map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <ChevronDown size={19} aria-hidden="true" />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="quero-ser-parceiro" className="wp-final" aria-labelledby="partner-join-title">
          <div className="wp-container wp-final-inner">
            <span className="wp-kicker">PROGRAMA DE PARCEIROS</span>
            <h2 id="partner-join-title">Vamos crescer juntos? <span aria-hidden="true">💙</span></h2>
            <p>Estamos buscando pessoas que acreditam no potencial dos empreendedores e querem ajudar estabelecimentos a evoluir com tecnologia. Se você se identifica com essa proposta, queremos conhecer você!</p>
            <button type="button" className="wp-button wp-button--white" onClick={() => openWhatsApp(PARTNER_WHATSAPP_MESSAGE)}>
              Quero fazer parte <ArrowUpRight size={18} aria-hidden="true" />
            </button>
            <span className="wp-final-mark" aria-hidden="true">W</span>
          </div>
        </section>
      </main>

      <footer className="wp-footer">
        <div className="wp-container">
          <div className="wp-footer-top">
            <div>
              <Link to={PATHS.HOME} className="wp-logo" aria-label="Weper, início"><WeperMark size={32} /></Link>
              <p>Tecnologia para conectar<br />seu negócio ao próximo passo.</p>
            </div>
            <nav aria-label="Links do rodapé">
              <div>
                <strong>Conheça a Weper</strong>
                <a href="/#solucoes">Soluções</a>
                <a href="/#plans">Preços</a>
                <Link to={PATHS.PARTNERS} aria-current="page">Parceiros</Link>
              </div>
              <div>
                <strong>Conte com a gente</strong>
                <button type="button" onClick={() => openWhatsApp(PARTNER_WHATSAPP_MESSAGE)}>Fale com a equipe</button>
                <Link to={PATHS.LOGIN}>Acessar minha conta</Link>
                <span>{WHATSAPP_DISPLAY}</span>
              </div>
            </nav>
          </div>
          <div className="wp-footer-bottom">
            <span>© {new Date().getFullYear()} Weper Solutions.</span>
            <div>
              <Link to={PATHS.PRIVACY}>Privacidade</Link>
              <Link to={PATHS.TERMS}>Termos de uso</Link>
            </div>
          </div>
        </div>
      </footer>

      <button
        className="wp-contact-float"
        type="button"
        aria-label="Falar com a Weper pelo WhatsApp"
        onClick={() => openWhatsApp(PARTNER_WHATSAPP_MESSAGE)}
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
