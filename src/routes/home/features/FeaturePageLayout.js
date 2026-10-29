import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, Menu, MessageCircle, X } from 'lucide-react';
import { WeperMark } from '../components/WeperMark';
import { PATHS } from '../../../services/accessControl';
import { capturePartnerRef } from '../../../services/partnerReferral';
import { applyDocumentMeta } from '../../partners/partnerSeo';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../landingAssets';
import '../styles/Rebrand.css';
import '../styles/DeliveryLanding.css';
import { FEATURE_PAGES } from './featurePages';

/**
 * Esqueleto comum das páginas de funcionalidade: cabeçalho, abertura, passo a passo,
 * dúvidas, chamada final e rodapé. O conteúdo próprio de cada página entra em children,
 * entre o passo a passo e as dúvidas.
 */
export default function FeaturePageLayout({ seo, path, whatsappMessage, hero, steps, faqs, finalCta, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const location = useLocation();
  useEffect(() => applyDocumentMeta(seo), [seo]);
  // ?ref=CODIGO (link de parceiro): só guarda na sessão, sem atribuir conversão.
  useEffect(() => { capturePartnerRef(location.search); }, [location.search]);
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);
  const contact = () => openWhatsApp(whatsappMessage);
  return <div className="wp-site wp-feature-page">
    <a className="wp-skip" href="#wp-main">Ir para o conteúdo</a>
    <header className="wp-header"><div className="wp-container wp-header-inner">
      <Link to={PATHS.HOME} className="wp-logo" aria-label="Weper, início" onClick={closeMenu}><WeperMark size={34} /></Link>
      <button ref={menuButton} className="wp-menu-toggle" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="wp-feature-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav id="wp-feature-navigation" aria-label="Navegação principal" className={menuOpen ? 'wp-navigation is-open' : 'wp-navigation'}>
        <a href="/#solucoes" onClick={closeMenu}>Soluções</a>
        <a href="/#demo" onClick={closeMenu}>Demonstração</a>
        <a href="/#plans" onClick={closeMenu}>Preços</a>
        <Link to={PATHS.PARTNERS} onClick={closeMenu}>Parceiros</Link>
        <Link to={PATHS.LOGIN} className="wp-mobile-login">Já sou cliente <ArrowUpRight size={15} /></Link>
      </nav>
      <div className="wp-header-actions"><Link to={PATHS.LOGIN}>Entrar <ArrowUpRight size={15} /></Link><a className="wp-button wp-button--primary" href="/#plans">Contratar <ArrowRight size={18} aria-hidden="true" /></a></div>
    </div></header>
    <main id="wp-main">
      <section className="wp-hero" aria-labelledby="feature-hero-title"><div className="wp-container wp-delivery-hero">
        <span className="wp-eyebrow"><span className="wp-blue-dot" /> {hero.eyebrow}</span>
        <h1 id="feature-hero-title">{hero.title} <em>{hero.highlight}</em></h1>
        <p>{hero.text}</p>
        <div className="wp-actions">{hero.actions}</div>
        <div className="wp-hero-assurance">{hero.assurances.map(item => <span key={item}><CheckCircle2 size={15} /> {item}</span>)}</div>
      </div></section>

      <section id="como-funciona" className="wp-section"><div className="wp-container">
        <div className="wp-section-heading"><div><span className="wp-kicker">COMO FUNCIONA</span><h2>{steps.title}<br /><em>{steps.highlight}</em></h2></div><p>{steps.text}</p></div>
        <ol className="wp-delivery-steps">{steps.items.map((step, index) => <li key={step.title}><span className="wp-feature-icon"><step.Icon size={22} /></span><span className="wp-delivery-step-number">{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
      </div></section>

      {children}

      <section id="faq" className="wp-section"><div className="wp-container wp-faq-grid"><div><span className="wp-kicker">PODE PERGUNTAR</span><h2>{faqs.title}</h2><p>Quer ver como ficaria na sua loja?</p><button type="button" className="wp-text-link" onClick={contact}>Converse com a equipe <ArrowUpRight size={18} /></button></div><div className="wp-faq-list">{faqs.items.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19} /></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="wp-final"><div className="wp-container wp-final-inner"><span className="wp-kicker">{finalCta.kicker}</span><h2>{finalCta.title}<br /><em>{finalCta.highlight}</em></h2><p>A equipe explica a configuração pelo WhatsApp.</p><button type="button" className="wp-button wp-button--white" onClick={contact}>Falar com a equipe<ArrowUpRight size={18} aria-hidden="true" /></button><span className="wp-final-mark" aria-hidden="true">W</span></div></section>
    </main>
    <footer className="wp-footer"><div className="wp-container"><div className="wp-footer-top"><div><Link to={PATHS.HOME} className="wp-logo" aria-label="Weper, início"><WeperMark size={32} /></Link><p>Tecnologia para conectar<br />seu negócio ao próximo passo.</p></div><nav aria-label="Links do rodapé"><div><strong>Funcionalidades</strong>{FEATURE_PAGES.map(page => <Link key={page.path} to={page.path} aria-current={page.path === path ? 'page' : undefined}>{page.label}</Link>)}</div><div><strong>Conheça a Weper</strong><a href="/#solucoes">Soluções</a><a href="/#plans">Preços</a><Link to={PATHS.PARTNERS}>Parceiros</Link></div><div><strong>Conte com a gente</strong><button onClick={contact} type="button">Fale com a equipe</button><Link to={PATHS.LOGIN}>Acessar minha conta</Link><span>{WHATSAPP_DISPLAY}</span></div></nav></div><div className="wp-footer-bottom"><span>© {new Date().getFullYear()} Weper Solutions.</span><div><Link to={PATHS.PRIVACY}>Privacidade</Link><Link to={PATHS.TERMS}>Termos de uso</Link></div></div></div></footer>
    <button className="wp-contact-float" type="button" aria-label="Falar com a Weper pelo WhatsApp" onClick={contact}><MessageCircle size={22} /></button>
  </div>;
}

/** Bloco de duas colunas: título à esquerda, lista de recursos à direita. */
export function FeatureList({ kicker, title, highlight, text, items }) {
  return <section className="wp-section wp-pricing-section"><div className="wp-container wp-delivery-honest">
    <div><span className="wp-kicker">{kicker}</span><h2>{title}<br /><em>{highlight}</em></h2>{text ? <p className="wp-feature-list-text">{text}</p> : null}</div>
    <ul className="wp-benefit-list wp-feature-list">{items.map(item => <li key={item}><CheckCircle2 />{item}</li>)}</ul>
  </div></section>;
}

/** Cartões de "antes de decidir": o que a funcionalidade pede da loja. */
export function FeatureNotes({ kicker = 'ANTES DE DECIDIR', title, highlight, notes }) {
  return <section className="wp-section"><div className="wp-container wp-delivery-honest">
    <div><span className="wp-kicker">{kicker}</span><h2>{title}<br /><em>{highlight}</em></h2></div>
    <div className="wp-delivery-honest-list">{notes.map(note => <article key={note.title}><note.Icon size={22} /><h3>{note.title}</h3><p>{note.text}</p></article>)}</div>
  </div></section>;
}
