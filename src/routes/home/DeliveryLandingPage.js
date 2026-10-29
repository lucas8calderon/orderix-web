import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Bike, CheckCircle2, ChefHat, ChevronDown, Link2, MapPin, Menu, MessageCircle, ShoppingBag, X } from 'lucide-react';
import { WeperMark } from './components/WeperMark';
import { formatPrice, getMaximumPrice, getMinimumPrice, getTierByRevenue } from '../../config/pricingTiers';
import { PATHS } from '../../services/accessControl';
import { capturePartnerRef } from '../../services/partnerReferral';
import { applyDocumentMeta } from '../partners/partnerSeo';
import { openWhatsApp, WHATSAPP_DISPLAY } from './landingAssets';
import './styles/Rebrand.css';
import './styles/DeliveryLanding.css';

export const DELIVERY_PAGE_SEO = {
  title: 'Delivery próprio sem comissão por pedido | Weper',
  description: 'Receba pedidos de delivery e retirada pelo link da sua loja. Pix e cartão caem na conta de pagamento da própria loja, e a Weper cobra só a mensalidade, sem comissão por pedido.',
  canonical: 'https://www.weper.com.br/delivery-sem-comissao',
};

const DELIVERY_WHATSAPP_MESSAGE = 'Olá! Quero saber como funciona o delivery próprio da Weper.';

// Valores de partida da calculadora; o próprio texto da página diz que são exemplos.
const EXAMPLE_REVENUE = 5000;
const EXAMPLE_COMMISSION = 15;

const STEPS = [
  { Icon: Link2, title: 'A loja tem o próprio link', text: 'Divulgue o endereço do seu delivery no Instagram, no WhatsApp, na embalagem ou num QR Code no balcão.' },
  { Icon: ShoppingBag, title: 'O cliente escolhe e paga', text: 'Ele monta o pedido no cardápio da sua loja e paga online por Pix ou cartão, ou paga na entrega ou na retirada.' },
  { Icon: ChefHat, title: 'A cozinha recebe na hora', text: 'O pedido entra no painel da cozinha junto com os pedidos do salão, e o estoque baixa sozinho.' },
  { Icon: Bike, title: 'O cliente acompanha', text: 'Uma página mostra em que etapa o pedido está, do preparo até a entrega ou a retirada.' },
];

const FEATURES = [
  'Taxa de entrega única ou por bairro, inclusive grátis',
  'Pedido mínimo e horário de funcionamento',
  'Pix e cartão online pelo Mercado Pago, PagBank, Asaas ou InfinitePay da loja',
  'Pagamento na entrega ou na retirada',
  'Página de acompanhamento do pedido para o cliente',
  'Conta do cliente com o histórico de pedidos',
];

const FAQS = [
  ['Preciso sair do aplicativo de entrega que uso hoje?', 'Não. Muitas lojas usam o aplicativo para serem encontradas por clientes novos e o delivery próprio para quem já conhece a loja e volta a pedir. Cada pedido que vem pelo seu link não paga comissão.'],
  ['Para onde vai o dinheiro do pedido?', 'O pagamento online usa a conta que a própria loja tem no provedor (Mercado Pago, PagBank, Asaas ou InfinitePay). O valor vai para essa conta, e as taxas de Pix ou cartão são as do seu contrato com o provedor.'],
  ['A Weper cobra alguma taxa por pedido?', `Não. A Weper cobra uma mensalidade, de ${formatPrice(getMinimumPrice())} a ${formatPrice(getMaximumPrice())}, conforme o volume processado na plataforma. Não há comissão nem taxa por pedido.`],
  ['O cliente precisa criar uma conta?', 'Para pagar online, sim: ele cria o acesso no próprio delivery da loja. Com esse acesso ele também consulta os pedidos que já fez. Quem vai pagar na entrega ou na retirada pode pedir sem criar conta.'],
  ['Quem faz a entrega?', 'A entrega é da loja: sua equipe ou o entregador com quem você já trabalha. O cliente também pode escolher retirar no balcão.'],
  ['Como os clientes chegam ao meu delivery?', 'Pelo link da sua loja. Coloque o link na bio do Instagram, na mensagem de boas-vindas do WhatsApp, no cardápio impresso e num QR Code na embalagem. Quem pede uma vez pelo aplicativo pode passar a pedir direto com você.'],
];

function parseAmount(value) {
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function CommissionCalculator() {
  const [revenue, setRevenue] = useState(String(EXAMPLE_REVENUE));
  const [commission, setCommission] = useState(String(EXAMPLE_COMMISSION));
  const monthlyRevenue = parseAmount(revenue);
  const commissionRate = Math.min(parseAmount(commission), 100);
  const commissionCost = monthlyRevenue * commissionRate / 100;
  const tier = getTierByRevenue(monthlyRevenue);
  const difference = commissionCost - tier.monthlyPrice;
  return <div className="wp-price-card wp-delivery-calc">
    <div className="wp-price-top"><span>CALCULE A DIFERENÇA</span><span>Valores de exemplo</span></div>
    <div className="wp-delivery-fields">
      <label htmlFor="wp-delivery-revenue">Quanto sua loja vende por mês no delivery? (R$)
        <input id="wp-delivery-revenue" type="number" inputMode="decimal" min="0" step="100" value={revenue} onChange={event => setRevenue(event.target.value)} />
      </label>
      <label htmlFor="wp-delivery-commission">Comissão que você paga hoje por pedido (%)
        <input id="wp-delivery-commission" type="number" inputMode="decimal" min="0" max="100" step="0.5" value={commission} onChange={event => setCommission(event.target.value)} />
      </label>
    </div>
    <dl className="wp-delivery-result" aria-live="polite">
      <div><dt>Comissão por mês hoje</dt><dd data-testid="delivery-commission-cost">{formatPrice(commissionCost)}</dd></div>
      <div><dt>Mensalidade Weper nessa faixa</dt><dd data-testid="delivery-weper-price">{formatPrice(tier.monthlyPrice)}</dd></div>
      <div className="wp-delivery-result-total"><dt>{difference > 0 ? 'Fica com a loja por mês' : 'Diferença por mês'}</dt><dd data-testid="delivery-difference">{formatPrice(Math.max(difference, 0))}</dd></div>
    </dl>
    <p className="wp-price-note">Use os números do seu contrato. A conta considera que todo o volume informado passa pela Weper. Não inclui taxas de Pix ou cartão do provedor de pagamento, nem o custo da entrega.</p>
    <Link to={`${PATHS.SIGNUP}?plan=${tier.code}`} className="wp-button wp-button--primary">Assinar esta faixa<ArrowUpRight size={18} aria-hidden="true" /></Link>
  </div>;
}

export default function DeliveryLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const location = useLocation();
  useEffect(() => applyDocumentMeta(DELIVERY_PAGE_SEO), []);
  // ?ref=CODIGO (link de parceiro): só guarda na sessão, sem atribuir conversão.
  useEffect(() => { capturePartnerRef(location.search); }, [location.search]);
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);
  return <div className="wp-site wp-delivery-page">
    <a className="wp-skip" href="#wp-main">Ir para o conteúdo</a>
    <header className="wp-header"><div className="wp-container wp-header-inner">
      <Link to={PATHS.HOME} className="wp-logo" aria-label="Weper, início" onClick={closeMenu}><WeperMark size={34} /></Link>
      <button ref={menuButton} className="wp-menu-toggle" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="wp-delivery-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav id="wp-delivery-navigation" aria-label="Navegação principal" className={menuOpen ? 'wp-navigation is-open' : 'wp-navigation'}>
        <a href="/#solucoes" onClick={closeMenu}>Soluções</a>
        <Link to={PATHS.DELIVERY_LANDING} aria-current="page" onClick={closeMenu}>Delivery</Link>
        <a href="/#plans" onClick={closeMenu}>Preços</a>
        <Link to={PATHS.PARTNERS} onClick={closeMenu}>Parceiros</Link>
        <Link to={PATHS.LOGIN} className="wp-mobile-login">Já sou cliente <ArrowUpRight size={15} /></Link>
      </nav>
      <div className="wp-header-actions"><Link to={PATHS.LOGIN}>Entrar <ArrowUpRight size={15} /></Link><a className="wp-button wp-button--primary" href="#calculo">Calcular <ArrowRight size={18} aria-hidden="true" /></a></div>
    </div></header>
    <main id="wp-main">
      <section className="wp-hero" aria-labelledby="delivery-hero-title"><div className="wp-container wp-delivery-hero">
        <span className="wp-eyebrow"><span className="wp-blue-dot" /> Delivery próprio Weper</span>
        <h1 id="delivery-hero-title">Seu delivery, seu cliente. <em>Sem comissão por pedido.</em></h1>
        <p>Receba pedidos de entrega e retirada pelo link da sua loja. O cliente paga por Pix ou cartão na conta de pagamento da própria loja, ou paga na entrega. A Weper cobra só a mensalidade, de {formatPrice(getMinimumPrice())} a {formatPrice(getMaximumPrice())}.</p>
        <div className="wp-actions"><a className="wp-button wp-button--primary" href="#calculo">Calcular quanto fica com a loja <ArrowRight size={18} /></a><Link className="wp-button wp-button--outline" to={`${PATHS.DEMO}/weper-burger`}>Ver um cardápio de demonstração <ArrowRight size={18} /></Link></div>
        <div className="wp-hero-assurance"><span><CheckCircle2 size={15} /> Sem taxa por pedido</span><span><CheckCircle2 size={15} /> O pagamento vai para a conta da loja</span><span><CheckCircle2 size={15} /> Entrega ou retirada</span></div>
      </div></section>

      <section id="como-funciona" className="wp-section"><div className="wp-container">
        <div className="wp-section-heading"><div><span className="wp-kicker">COMO FUNCIONA</span><h2>Do link da loja<br /><em>até o pedido na porta do cliente.</em></h2></div><p>O pedido do delivery entra na mesma operação do salão: mesma cozinha, mesmo estoque, mesmo painel.</p></div>
        <ol className="wp-delivery-steps">{STEPS.map((step, index) => <li key={step.title}><span className="wp-feature-icon"><step.Icon size={22} /></span><span className="wp-delivery-step-number">{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
      </div></section>

      <section id="calculo" className="wp-section wp-pricing-section"><div className="wp-container wp-pricing-grid">
        <div className="wp-pricing-copy"><span className="wp-kicker">COMISSÃO OU MENSALIDADE</span><h2>Quanto da sua venda<br /><em>fica no aplicativo?</em></h2><p>Informe quanto você vende por mês no delivery e a comissão do seu contrato. A calculadora compara com a mensalidade da Weper para esse volume.</p>
          <ul className="wp-benefit-list">{FEATURES.map(feature => <li key={feature}><CheckCircle2 />{feature}</li>)}</ul>
        </div>
        <CommissionCalculator />
      </div></section>

      <section className="wp-section"><div className="wp-container wp-delivery-honest">
        <div><span className="wp-kicker">ANTES DE DECIDIR</span><h2>O que muda<br /><em>quando o delivery é seu.</em></h2></div>
        <div className="wp-delivery-honest-list">
          <article><MapPin size={22} /><h3>Você divulga o link</h3><p>O aplicativo de entrega mostra sua loja para quem ainda não a conhece. No delivery próprio, quem traz o cliente é a sua divulgação: Instagram, WhatsApp, embalagem e balcão.</p></article>
          <article><Bike size={22} /><h3>A entrega é sua</h3><p>A Weper organiza o pedido, o pagamento e o acompanhamento. Quem leva até o cliente é a sua equipe ou o seu entregador, ou o cliente retira na loja.</p></article>
          <article><ShoppingBag size={22} /><h3>O cliente passa a ser seu</h3><p>Quem pede pelo seu link volta direto para você, sem uma vitrine com outras lojas ao lado.</p></article>
        </div>
      </div></section>

      <section id="faq" className="wp-section"><div className="wp-container wp-faq-grid"><div><span className="wp-kicker">PODE PERGUNTAR</span><h2>Dúvidas sobre o delivery</h2><p>Quer ver como ficaria na sua loja?</p><button type="button" className="wp-text-link" onClick={() => openWhatsApp(DELIVERY_WHATSAPP_MESSAGE)}>Converse com a equipe <ArrowUpRight size={18} /></button></div><div className="wp-faq-list">{FAQS.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19} /></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="wp-final"><div className="wp-container wp-final-inner"><span className="wp-kicker">SEU DELIVERY. SUA MARGEM.</span><h2>Quer o seu link<br /><em>de delivery?</em></h2><p>A equipe explica a configuração pelo WhatsApp.</p><button type="button" className="wp-button wp-button--white" onClick={() => openWhatsApp(DELIVERY_WHATSAPP_MESSAGE)}>Falar com a equipe<ArrowUpRight size={18} aria-hidden="true" /></button><span className="wp-final-mark" aria-hidden="true">W</span></div></section>
    </main>
    <footer className="wp-footer"><div className="wp-container"><div className="wp-footer-top"><div><Link to={PATHS.HOME} className="wp-logo" aria-label="Weper, início"><WeperMark size={32} /></Link><p>Tecnologia para conectar<br />seu negócio ao próximo passo.</p></div><nav aria-label="Links do rodapé"><div><strong>Conheça a Weper</strong><a href="/#solucoes">Soluções</a><Link to={PATHS.DELIVERY_LANDING} aria-current="page">Delivery sem comissão</Link><a href="/#plans">Preços</a><Link to={PATHS.PARTNERS}>Parceiros</Link></div><div><strong>Conte com a gente</strong><button onClick={() => openWhatsApp(DELIVERY_WHATSAPP_MESSAGE)} type="button">Fale com a equipe</button><Link to={PATHS.LOGIN}>Acessar minha conta</Link><span>{WHATSAPP_DISPLAY}</span></div></nav></div><div className="wp-footer-bottom"><span>© {new Date().getFullYear()} Weper Solutions.</span><div><Link to={PATHS.PRIVACY}>Privacidade</Link><Link to={PATHS.TERMS}>Termos de uso</Link></div></div></div></footer>
    <button className="wp-contact-float" type="button" aria-label="Falar com a Weper pelo WhatsApp" onClick={() => openWhatsApp(DELIVERY_WHATSAPP_MESSAGE)}><MessageCircle size={22} /></button>
  </div>;
}
