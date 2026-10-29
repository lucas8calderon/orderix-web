import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Bike, CheckCircle2, ChefHat, Link2, MapPin, ShoppingBag } from 'lucide-react';
import { formatPrice, getMaximumPrice, getMinimumPrice, getTierByRevenue } from '../../config/pricingTiers';
import { PATHS } from '../../services/accessControl';
import FeaturePageLayout, { FeatureNotes } from './features/FeaturePageLayout';

export const DELIVERY_PAGE_SEO = {
  title: 'Delivery próprio sem comissão por pedido | Weper',
  description: 'Receba pedidos de delivery e retirada pelo link da sua loja. Pix e cartão caem na conta de pagamento da própria loja, e a Weper cobra só a mensalidade, sem comissão por pedido.',
  canonical: 'https://www.weper.com.br/delivery-sem-comissao',
};

const DELIVERY_WHATSAPP_MESSAGE = 'Olá! Quero saber como funciona o delivery próprio da Weper.';

// Valores de partida da calculadora; o próprio texto da página diz que são exemplos.
const EXAMPLE_REVENUE = 5000;
const EXAMPLE_COMMISSION = 15;

const STEPS = {
  title: 'Do link da loja',
  highlight: 'até o pedido na porta do cliente.',
  text: 'O pedido do delivery entra na mesma operação do salão: mesma cozinha, mesmo estoque, mesmo painel.',
  items: [
    { Icon: Link2, title: 'A loja tem o próprio link', text: 'Divulgue o endereço do seu delivery no Instagram, no WhatsApp, na embalagem ou num QR Code no balcão.' },
    { Icon: ShoppingBag, title: 'O cliente escolhe e paga', text: 'Ele monta o pedido no cardápio da sua loja e paga online por Pix ou cartão, ou paga na entrega ou na retirada.' },
    { Icon: ChefHat, title: 'A cozinha recebe na hora', text: 'O pedido entra no painel da cozinha junto com os pedidos do salão, e o estoque baixa sozinho.' },
    { Icon: Bike, title: 'O cliente acompanha', text: 'Uma página mostra em que etapa o pedido está, do preparo até a entrega ou a retirada.' },
  ],
};

const FEATURES = [
  'Taxa de entrega única ou por bairro, inclusive grátis',
  'Pedido mínimo e horário de funcionamento',
  'Pix e cartão online pelo Mercado Pago, PagBank, Asaas ou InfinitePay da loja',
  'Pagamento na entrega ou na retirada',
  'Página de acompanhamento do pedido para o cliente',
  'Conta do cliente com o histórico de pedidos',
];

const NOTES = [
  { Icon: MapPin, title: 'Você divulga o link', text: 'O aplicativo de entrega mostra sua loja para quem ainda não a conhece. No delivery próprio, quem traz o cliente é a sua divulgação: Instagram, WhatsApp, embalagem e balcão.' },
  { Icon: Bike, title: 'A entrega é sua', text: 'A Weper organiza o pedido, o pagamento e o acompanhamento. Quem leva até o cliente é a sua equipe ou o seu entregador, ou o cliente retira na loja.' },
  { Icon: ShoppingBag, title: 'O cliente passa a ser seu', text: 'Quem pede pelo seu link volta direto para você, sem uma vitrine com outras lojas ao lado.' },
];

const FAQS = {
  title: 'Dúvidas sobre o delivery',
  items: [
    ['Preciso sair do aplicativo de entrega que uso hoje?', 'Não. Muitas lojas usam o aplicativo para serem encontradas por clientes novos e o delivery próprio para quem já conhece a loja e volta a pedir. Cada pedido que vem pelo seu link não paga comissão.'],
    ['Para onde vai o dinheiro do pedido?', 'O pagamento online usa a conta que a própria loja tem no provedor (Mercado Pago, PagBank, Asaas ou InfinitePay). O valor vai para essa conta, e as taxas de Pix ou cartão são as do seu contrato com o provedor.'],
    ['A Weper cobra alguma taxa por pedido?', `Não. A Weper cobra uma mensalidade, de ${formatPrice(getMinimumPrice())} a ${formatPrice(getMaximumPrice())}, conforme o volume processado na plataforma. Não há comissão nem taxa por pedido.`],
    ['O cliente precisa criar uma conta?', 'Para pagar online, sim: ele cria o acesso no próprio delivery da loja. Com esse acesso ele também consulta os pedidos que já fez. Quem vai pagar na entrega ou na retirada pode pedir sem criar conta.'],
    ['Quem faz a entrega?', 'A entrega é da loja: sua equipe ou o entregador com quem você já trabalha. O cliente também pode escolher retirar no balcão.'],
    ['Como os clientes chegam ao meu delivery?', 'Pelo link da sua loja. Coloque o link na bio do Instagram, na mensagem de boas-vindas do WhatsApp, no cardápio impresso e num QR Code na embalagem. Quem pede uma vez pelo aplicativo pode passar a pedir direto com você.'],
  ],
};

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
  const hero = {
    eyebrow: 'Delivery próprio Weper',
    title: 'Seu delivery, seu cliente.',
    highlight: 'Sem comissão por pedido.',
    text: `Receba pedidos de entrega e retirada pelo link da sua loja. O cliente paga por Pix ou cartão na conta de pagamento da própria loja, ou paga na entrega. A Weper cobra só a mensalidade, de ${formatPrice(getMinimumPrice())} a ${formatPrice(getMaximumPrice())}.`,
    actions: <><a className="wp-button wp-button--primary" href="#calculo">Calcular quanto fica com a loja <ArrowRight size={18} /></a><Link className="wp-button wp-button--outline" to={`${PATHS.DEMO}/weper-burger`}>Ver um cardápio de demonstração <ArrowRight size={18} /></Link></>,
    assurances: ['Sem taxa por pedido', 'O pagamento vai para a conta da loja', 'Entrega ou retirada'],
  };
  return <FeaturePageLayout
    seo={DELIVERY_PAGE_SEO}
    path={PATHS.DELIVERY_LANDING}
    whatsappMessage={DELIVERY_WHATSAPP_MESSAGE}
    hero={hero}
    steps={STEPS}
    faqs={FAQS}
    finalCta={{ kicker: 'SEU DELIVERY. SUA MARGEM.', title: 'Quer o seu link', highlight: 'de delivery?' }}
  >
    <section id="calculo" className="wp-section wp-pricing-section"><div className="wp-container wp-pricing-grid">
      <div className="wp-pricing-copy"><span className="wp-kicker">COMISSÃO OU MENSALIDADE</span><h2>Quanto da sua venda<br /><em>fica no aplicativo?</em></h2><p>Informe quanto você vende por mês no delivery e a comissão do seu contrato. A calculadora compara com a mensalidade da Weper para esse volume.</p>
        <ul className="wp-benefit-list">{FEATURES.map(feature => <li key={feature}><CheckCircle2 />{feature}</li>)}</ul>
      </div>
      <CommissionCalculator />
    </div></section>
    <FeatureNotes title="O que muda" highlight="quando o delivery é seu." notes={NOTES} />
  </FeaturePageLayout>;
}
