import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, X, Smartphone, LayoutDashboard, UtensilsCrossed, ShoppingBag, ChefHat, Monitor, MessageCircle, Layers, QrCode, CheckCircle2, Coffee, Pizza, Store, MoveRight } from 'lucide-react';
import { WeperMark } from './components/WeperMark';
import { PRICING_TIERS, formatPrice, getMinimumPrice, getMaximumPrice } from '../../config/pricingTiers';
import { PATHS } from '../../services/accessControl';
import { capturePartnerRef } from '../../services/partnerReferral';
import { openWhatsApp, WHATSAPP_DISPLAY } from './landingAssets';
import './styles/Rebrand.css';

const SOLUTIONS = [
  { id: 'atendimento', label: 'Atendimento', Icon: Smartphone, title: 'Mais atenção ao cliente. Menos vai e vem.', text: 'Mesas, comandas e pedidos organizados no app Garçom. Sua equipe acompanha o atendimento sem depender de anotações soltas.', points: ['Pedidos pelo aplicativo Android', 'Mesas e comandas no mesmo fluxo', 'Informações que acompanham o atendimento'], stage: 'Do salão para a cozinha', steps: ['Mesa ou comanda', 'Pedido registrado', 'Preparo organizado'] },
  { id: 'vendas', label: 'Canais de venda', Icon: ShoppingBag, title: 'Seu cardápio, mais perto de quem compra.', text: 'Apresente seus produtos em um cardápio digital e receba pedidos pelo delivery próprio. Uma experiência simples para o seu cliente escolher.', points: ['Cardápio digital com QR Code', 'Delivery próprio e retirada', 'Produtos e disponibilidade organizados'], stage: 'Da escolha ao pedido', steps: ['Cliente escolhe', 'Pedido recebido', 'Entrega ou retirada'] },
  { id: 'cozinha', label: 'Cozinha', Icon: ChefHat, title: 'Cada pedido no seu lugar. Cada etapa à vista.', text: 'Acompanhe o que chegou, o que está em preparo e o que já está pronto. Um painel de produção para ajudar a equipe a manter o ritmo.', points: ['Pedidos organizados por etapa', 'Atualização de status', 'Visibilidade para quem está atendendo'], stage: 'Do preparo à entrega', steps: ['Novo pedido', 'Em preparo', 'Pronto para sair'] },
  { id: 'gestao', label: 'Gestão', Icon: LayoutDashboard, title: 'Decida com uma visão clara do seu negócio.', text: 'Consulte faturamento, pedidos e ticket médio. Organize o catálogo e os acessos da equipe em um painel que conecta a operação.', points: ['Indicadores da operação', 'Catálogo e preços centralizados', 'Equipe e perfis de acesso'], stage: 'Da operação à decisão', steps: ['Vendas registradas', 'Indicadores reunidos', 'Próximos passos claros'] },
];
const FAQS = [
  ['Como faço para contratar?', 'Use Quero começar ou Quero assinar a Weper. A contratação pede o CPF ou CNPJ do responsável financeiro, Pix ou cartão. A loja só abre depois da confirmação do pagamento. Dúvidas continuam no WhatsApp.'],
  ['O que muda entre as faixas de preço?', 'A mensalidade acompanha o volume mensal processado pela plataforma. Os recursos não são divididos entre as faixas: o que muda é o valor da assinatura conforme o movimento do negócio.'],
  ['Existe um limite para a mensalidade?', `Sim. No modelo atual, a mensalidade vai de ${formatPrice(getMinimumPrice())} a ${formatPrice(getMaximumPrice())}. Consulte todas as faixas na seção de preços.`],
  ['Posso conhecer antes de contratar?', 'Sim. As demonstrações de cardápio nesta página permitem simular a experiência de compra. Para conhecer a operação e esclarecer dúvidas, converse com a equipe Weper.'],
  ['Preciso instalar algum programa?', 'O painel web funciona em um navegador atualizado no computador. O app Garçom é utilizado no Android. A equipe orienta quais dispositivos fazem sentido para sua operação.'],
  ['Como funciona o suporte?', 'O contato é pelo WhatsApp. Use o mesmo canal para tirar dúvidas, conversar sobre a contratação e pedir orientação sobre a plataforma.'],
];

function ContactButton({ children = 'Quero começar', secondary = false, message, to }) {
  const className = `wp-button ${secondary ? 'wp-button--white' : 'wp-button--primary'}`;
  if (to) {
    return <Link to={to} className={className}>{children}<ArrowUpRight size={18} aria-hidden="true" /></Link>;
  }
  return <button type="button" className={className} onClick={() => openWhatsApp(message)}>{children}<ArrowUpRight size={18} aria-hidden="true" /></button>;
}

function ProductPreview() {
  return <div className="wp-product-stage">
    <div className="wp-stage-orbit" aria-hidden="true" />
    <div className="wp-product-window">
      <div className="wp-window-bar"><div className="wp-window-dots" aria-hidden="true"><i /><i /><i /></div><span>Seu negócio conectado</span><span className="wp-window-lock"><Layers size={13} /> Weper</span></div>
      <div className="wp-preview-shell">
        <aside className="wp-preview-nav" aria-hidden="true"><WeperMark size={28} showWordmark={false} /><LayoutDashboard /><ShoppingBag /><UtensilsCrossed /><ChefHat /></aside>
        <div className="wp-preview-content">
          <div className="wp-preview-title"><div><span>VISÃO DA OPERAÇÃO</span><h2>Tudo no seu ritmo.</h2></div><span className="wp-preview-avatar">W</span></div>
          <div className="wp-preview-summary"><div><ShoppingBag size={17} /><strong>Pedidos</strong><span>Organizados</span></div><div><ChefHat size={17} /><strong>Cozinha</strong><span>Conectada</span></div><div><LayoutDashboard size={17} /><strong>Gestão</strong><span>À vista</span></div></div>
          <div className="wp-preview-board"><div className="wp-preview-board-head"><strong>Um fluxo. Do pedido à entrega.</strong><span>•••</span></div>
            <div className="wp-order"><span className="wp-order-symbol"><UtensilsCrossed size={17} /></span><div><strong>Mesa 04</strong><span>Atendimento no salão</span></div><b className="wp-badge wp-badge--blue">Novo pedido</b></div>
            <div className="wp-order"><span className="wp-order-symbol"><ShoppingBag size={17} /></span><div><strong>Delivery</strong><span>Pedido pelo cardápio</span></div><b className="wp-badge wp-badge--amber">Em preparo</b></div>
            <div className="wp-order"><span className="wp-order-symbol"><QrCode size={17} /></span><div><strong>Retirada</strong><span>Cliente a caminho</span></div><b className="wp-badge wp-badge--green">Pronto</b></div>
          </div>
          <div className="wp-preview-foot"><span><CheckCircle2 size={14} /> Atendimento + cozinha + gestão</span><small>Visualização ilustrativa</small></div>
        </div>
      </div>
    </div>
    <div className="wp-floating-note"><span><Check size={18} /></span><div><strong>Menos tarefas espalhadas.</strong><small>Mais clareza para a sua operação.</small></div></div>
  </div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSolution, setActiveSolution] = useState(0);
  const [tierId, setTierId] = useState(PRICING_TIERS[0].id);
  const menuButton = useRef(null);
  const location = useLocation();
  const solution = SOLUTIONS[activeSolution];
  // ?ref=CODIGO (link de parceiro): só guarda na sessão, sem atribuir conversão.
  useEffect(() => { capturePartnerRef(location.search); }, [location.search]);
  const tier = PRICING_TIERS.find(item => item.id === tierId) || PRICING_TIERS[0];
  useEffect(() => {
    const title = document.title;
    document.title = 'Weper | Seu negócio no controle. Do pedido à gestão.';
    return () => { document.title = title; };
  }, []);
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menuOpen]);
  return <div className="wp-site">
    <a className="wp-skip" href="#wp-main">Ir para o conteúdo</a>
    <header className="wp-header"><div className="wp-container wp-header-inner">
      <a href="#home" className="wp-logo" aria-label="Weper, início" onClick={() => setMenuOpen(false)}><WeperMark size={34} /></a>
      <button ref={menuButton} className="wp-menu-toggle" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="wp-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav id="wp-navigation" aria-label="Navegação principal" className={menuOpen ? 'wp-navigation is-open' : 'wp-navigation'}>
        {[['solucoes', 'Soluções'], ['demo', 'Demonstração'], ['plans', 'Preços'], ['faq', 'Dúvidas']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
        <Link to={PATHS.PARTNERS} onClick={() => setMenuOpen(false)}>Parceiros</Link>
        <Link to="/login" className="wp-mobile-login">Já sou cliente <ArrowUpRight size={15} /></Link>
      </nav>
      <div className="wp-header-actions"><Link to="/login">Entrar <ArrowUpRight size={15} /></Link><ContactButton to="/contratar" /></div>
    </div></header>
    <main id="wp-main">
      <section id="home" className="wp-hero"><div className="wp-container wp-hero-grid">
        <div className="wp-hero-copy"><span className="wp-eyebrow"><span className="wp-blue-dot" /> A operação flui. Seu negócio evolui.</span>
          <h1>Seu negócio <br />no controle.<br /><em>Você no próximo<br className="wp-desktop-break" /> passo.</em></h1>
          <p>Do primeiro pedido ao fechamento, conecte atendimento, cozinha e gestão. Mais organização no dia a dia. Mais espaço para crescer.</p>
          <div className="wp-actions"><ContactButton to="/contratar" /><a className="wp-button wp-button--outline" href="#demo">Explorar demonstração <ArrowRight size={18} /></a></div>
          <div className="wp-hero-assurance"><span><Check size={15} /> A partir de {formatPrice(getMinimumPrice())}/mês</span><span><Check size={15} /> Ativação com a equipe</span></div>
        </div>
        <ProductPreview />
      </div><div className="wp-container wp-audience"><span>FEITA PARA O RITMO DO SEU NEGÓCIO</span><div><span><UtensilsCrossed />Restaurantes</span><span><Pizza />Pizzarias</span><span><ShoppingBag />Hamburguerias</span><span><Coffee />Bares e cafés</span><span><Store />E muito mais</span></div></div></section>

      <section id="solucoes" className="wp-section wp-solutions"><div className="wp-container">
        <div className="wp-section-heading"><div><span className="wp-kicker">MENOS COMPLICAÇÃO. MAIS CONEXÃO.</span><h2>Uma operação inteira.<br /><em>Um jeito mais simples de gerir.</em></h2></div><p>As informações acompanham o pedido. E você acompanha o negócio, sem perder o foco no cliente.</p></div>
        <div className="wp-solution-tabs" role="tablist" aria-label="Conheça as soluções">{SOLUTIONS.map((item, index) => <button type="button" role="tab" key={item.id} id={`wp-tab-${item.id}`} aria-controls="wp-solution-panel" aria-selected={index === activeSolution} tabIndex={index === activeSolution ? 0 : -1} onClick={() => setActiveSolution(index)} onKeyDown={event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % SOLUTIONS.length : event.key === 'ArrowLeft' ? (index + SOLUTIONS.length - 1) % SOLUTIONS.length : event.key === 'Home' ? 0 : event.key === 'End' ? SOLUTIONS.length - 1 : null;
          if (next === null) return; event.preventDefault(); setActiveSolution(next); document.getElementById(`wp-tab-${SOLUTIONS[next].id}`)?.focus();
        }}><item.Icon size={19} />{item.label}</button>)}</div>
        <div id="wp-solution-panel" role="tabpanel" aria-labelledby={`wp-tab-${solution.id}`} className="wp-solution-panel"><div className="wp-solution-copy"><span className="wp-feature-icon"><solution.Icon size={25} /></span><h3>{solution.title}</h3><p>{solution.text}</p><ul>{solution.points.map(point => <li key={point}><CheckCircle2 size={18} />{point}</li>)}</ul><a href="#plans" className="wp-text-link">Conhecer a assinatura <ArrowRight size={17} /></a></div><div className="wp-flow-visual"><span className="wp-kicker">TUDO SE CONECTA</span><h3>{solution.stage}</h3><div className="wp-flow-line">{solution.steps.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < 2 ? <ChevronDown size={18} /> : <CheckCircle2 size={18} />}</div>)}</div><p>Uma informação. O próximo passo certo.</p></div></div>
      </div></section>

      <section className="wp-control-section"><div className="wp-container wp-control-grid"><div><span className="wp-kicker">TECNOLOGIA QUE CABE NA ROTINA</span><h2>Na mão de quem atende.<br />Na visão de quem gerencia.</h2><p>O app acompanha a equipe no salão. O painel reúne as informações no computador. Cada pessoa com as ferramentas para fazer sua parte.</p><a href="#demo" className="wp-button wp-button--white">Conheça a experiência <ArrowRight size={18} /></a></div><div className="wp-device-pair"><article><Smartphone size={30} /><span>01 / NA OPERAÇÃO</span><h3>Agilidade para atender</h3><p>App Garçom para Android, com mesas, comandas e pedidos.</p></article><article><Monitor size={30} /><span>02 / NA GESTÃO</span><h3>Clareza para decidir</h3><p>Painel web com catálogo, equipe e indicadores da loja.</p></article></div></div></section>

      <section id="demo" className="wp-section"><div className="wp-container"><div className="wp-section-heading"><div><span className="wp-kicker">CONHEÇA ANTES DE CONTRATAR</span><h2>Seu próximo pedido<br /><em>começa com uma boa experiência.</em></h2></div><p>Explore um cardápio de demonstração e veja como o cliente escolhe os produtos. Os pedidos são apenas uma simulação.</p></div><div className="wp-demo-grid">{[{slug:'weper-burger', name:'Weper Burger', tag:'HAMBURGUERIA', cover:'/images/demo/burger/cover.jpg', description:'Combos, acompanhamentos e um pedido do seu jeito.'}, {slug:'weper-pizza',name:'Weper Pizza',tag:'PIZZARIA',cover:'/images/demo/pizza/cover.jpg',description:'Sabores e opções organizados para facilitar a escolha.'}, {slug:'weper-pastel',name:'Weper Pastel',tag:'PASTELARIA',cover:'/images/demo/pastel/cover.jpg',description:'Um cardápio simples de explorar, do começo ao fim.'}].map((demo,index) => <Link to={`/demo/${demo.slug}`} key={demo.slug} className={`wp-demo-card wp-demo-card--${index}`}><div className="wp-demo-art"><img src={demo.cover} alt="" /></div><div className="wp-demo-body"><span className="wp-kicker">{demo.tag}</span><h3>{demo.name}</h3><p>{demo.description}</p><span className="wp-text-link">Explorar demonstração <ArrowRight size={17} /></span></div></Link>)}</div></div></section>

      <section id="plans" className="wp-section wp-pricing-section"><div className="wp-container wp-pricing-grid"><div className="wp-pricing-copy"><span className="wp-kicker">PREÇO CLARO, DESDE O COMEÇO</span><h2>Uma assinatura.<br /><em>Espaço para crescer.</em></h2><p>Você acessa a plataforma. A mensalidade acompanha o volume processado no mês, com um teto de {formatPrice(getMaximumPrice())}.</p><ul className="wp-benefit-list"><li><CheckCircle2 />Recursos reunidos em uma assinatura</li><li><CheckCircle2 />Sem trocar de plano para liberar módulos</li><li><CheckCircle2 />Contato direto com a equipe pelo WhatsApp</li></ul><div className="wp-onboarding"><strong>Começar é uma conversa.</strong><p>Conte como funciona seu estabelecimento. A equipe apresenta a plataforma e orienta a ativação.</p><span>Converse <MoveRight size={16} /> Conheça <MoveRight size={16} /> Comece</span></div></div><div className="wp-price-card"><div className="wp-price-top"><span>ASSINATURA WEPER</span><span>Plataforma completa</span></div><label htmlFor="wp-volume">Quanto sua loja processa por mês?</label><div className="wp-select-wrap"><select id="wp-volume" value={tier.id} onChange={event => setTierId(event.target.value)}>{PRICING_TIERS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><ChevronDown size={18} /></div><div className="wp-price-value" aria-live="polite"><span>{formatPrice(tier.monthlyPrice)}</span><small>/mês</small></div><p className="wp-price-caption">Mensalidade para a faixa selecionada.</p><ContactButton to={`/contratar?plan=${tier.code}`}>Quero assinar a Weper</ContactButton><p className="wp-price-note">A loja abre depois da confirmação do pagamento.<br />O valor sai do catálogo, não desta tela.</p><details className="wp-tier-details"><summary>Ver todas as faixas de preço <ChevronDown size={16} /></summary><table><caption>Mensalidade por volume processado</caption><thead><tr><th scope="col">Volume mensal</th><th scope="col">Mensalidade</th></tr></thead><tbody>{PRICING_TIERS.map(item => <tr key={item.id}><td>{item.label}</td><td>{formatPrice(item.monthlyPrice)}</td></tr>)}</tbody></table></details></div></div></section>

      <section id="faq" className="wp-section"><div className="wp-container wp-faq-grid"><div><span className="wp-kicker">PODE PERGUNTAR</span><h2>Mais clareza.<br /><em>Menos dúvidas.</em></h2><p>Precisa entender como a Weper se encaixa no seu negócio?</p><button type="button" className="wp-text-link" onClick={() => openWhatsApp()}>Converse com a equipe <ArrowUpRight size={18} /></button></div><div className="wp-faq-list">{FAQS.map(([question,answer]) => <details key={question}><summary>{question}<ChevronDown size={19} /></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="wp-final"><div className="wp-container wp-final-inner"><span className="wp-kicker">SEU NEGÓCIO. SEU PRÓXIMO PASSO.</span><h2>Mais conectado.<br />Mais organizado.<br /><em>Mais Weper.</em></h2><p>Vamos simplificar a operação do seu estabelecimento?</p><ContactButton secondary>Quero conhecer a Weper</ContactButton><span className="wp-final-mark" aria-hidden="true">W</span></div></section>
    </main>
    <footer className="wp-footer"><div className="wp-container"><div className="wp-footer-top"><div><a href="#home" className="wp-logo" aria-label="Weper, início"><WeperMark size={32} /></a><p>Tecnologia para conectar<br />seu negócio ao próximo passo.</p></div><nav aria-label="Links do rodapé"><div><strong>Conheça a Weper</strong><a href="#solucoes">Soluções</a><a href="#demo">Demonstração</a><a href="#plans">Preços</a><Link to={PATHS.PARTNERS}>Parceiros</Link><Link to={PATHS.PARTNERS_LOGIN}>Área de Parceiros</Link></div><div><strong>Conte com a gente</strong><button onClick={() => openWhatsApp()} type="button">Fale com a equipe</button><Link to="/login">Acessar minha conta</Link><span>{WHATSAPP_DISPLAY}</span></div></nav></div><div className="wp-footer-bottom"><span>© {new Date().getFullYear()} Weper Solutions.</span><div><Link to="/privacy">Privacidade</Link><Link to="/terms">Termos de uso</Link></div></div></div></footer>
    <button className="wp-contact-float" type="button" aria-label="Falar com a Weper pelo WhatsApp" onClick={() => openWhatsApp()}><MessageCircle size={22} /></button>
  </div>;
}
