/**
 * Conteúdo da seção "Funcionalidades" da home.
 *
 * As telas são capturas do produto com dados fictícios da loja de demonstração
 * "Weper Burger" (painel web e delivery) e capturas do app Android do garçom.
 * Só entra aqui o que está pronto no produto (docs/weper-context/12).
 */
import { PATHS } from '../../services/accessControl';
import deliveryCardapio from '../../assets/images/landing/features/delivery-cardapio.webp';
import deliveryProduto from '../../assets/images/landing/features/delivery-produto.webp';
import deliveryCarrinho from '../../assets/images/landing/features/delivery-carrinho.webp';
import deliveryRecebido from '../../assets/images/landing/features/delivery-recebido.webp';
import deliveryAcompanhamento from '../../assets/images/landing/features/delivery-acompanhamento.webp';
import cozinhaAntes from '../../assets/images/landing/features/cozinha-antes.webp';
import cozinhaNovo from '../../assets/images/landing/features/cozinha-novo.webp';
import cozinhaProducao from '../../assets/images/landing/features/cozinha-producao.webp';
import salaoPdv from '../../assets/images/landing/features/salao-pdv.webp';
import salaoMesas from '../../assets/images/landing/features/salao-mesas.webp';
import salaoComandas from '../../assets/images/landing/features/salao-comandas.webp';
import gestaoDashboard from '../../assets/images/landing/features/gestao-dashboard.webp';
import gestaoEstoque from '../../assets/images/landing/features/gestao-estoque.webp';
import garcomMesas from '../../assets/images/landing/features/garcom-mesas.webp';
import garcomComandas from '../../assets/images/landing/features/garcom-comandas.webp';
import garcomAtendimento from '../../assets/images/landing/features/garcom-atendimento.webp';

const PLANS_ANCHOR = '#plans';
const PHONE_WEB = { width: 640, height: 1313 };
const PHONE_ANDROID = { width: 640, height: 1367 };
const LAPTOP = { width: 1600, height: 1000 };
const TABLET = { width: 1500, height: 1040 };

const phoneCart = { src: deliveryCarrinho, alt: 'Delivery da loja no celular: carrinho com três itens, taxa de entrega e botão Finalizar pedido' };
const phoneReceived = { src: deliveryRecebido, alt: 'Acompanhamento do pedido no celular: pedido recebido pela loja' };
const phonePreparing = { src: deliveryAcompanhamento, alt: 'Acompanhamento do pedido no celular: pedido em preparação' };
const kitchenBefore = { src: cozinhaAntes, alt: 'Painel da cozinha com os pedidos do salão e do balcão por etapa' };
const kitchenNew = { src: cozinhaNovo, alt: 'Painel da cozinha: o pedido do delivery aparece na coluna Novo' };
const kitchenProducing = { src: cozinhaProducao, alt: 'Painel da cozinha: o pedido do delivery passou para Em Produção' };

/** Demonstração do caminho de um pedido, do celular do cliente até a cozinha. */
export const ORDER_FLOW = {
  id: 'cozinha',
  kicker: 'DO PEDIDO À COZINHA',
  problem: 'Pedido anotado num lugar, cozinha esperando em outro.',
  title: 'Do pedido à cozinha, tudo conectado.',
  text: 'Salão, balcão e delivery caem no mesmo painel. A equipe avança cada pedido por etapa e o cliente acompanha pelo celular.',
  phoneSize: PHONE_WEB,
  tabletSize: TABLET,
  steps: [
    { label: 'O cliente pede pelo celular', detail: 'No cardápio da sua loja, sem app de terceiros.', focus: 'phone', phone: phoneCart, tablet: kitchenBefore },
    { label: 'O pedido chega à cozinha', detail: 'Entra na coluna Novo, com itens e observações.', focus: 'tablet', phone: phoneReceived, tablet: kitchenNew },
    { label: 'A equipe avança o preparo', detail: 'Novo, em produção, feito e entregue.', focus: 'tablet', phone: phoneReceived, tablet: kitchenProducing },
    { label: 'O cliente vê o status mudar', detail: 'O acompanhamento mostra cada etapa.', focus: 'phone', phone: phonePreparing, tablet: kitchenProducing },
  ],
  cta: { label: 'Quero conhecer a Weper', href: PLANS_ANCHOR },
  link: { label: 'Conhecer o painel da cozinha', to: PATHS.KITCHEN_LANDING },
};

export const SHOWCASE_BLOCKS = [
  {
    id: 'delivery',
    device: 'phone',
    size: PHONE_WEB,
    kicker: 'DELIVERY PRÓPRIO E CARDÁPIO DIGITAL',
    problem: 'Comissão em cada pedido e cliente que é do aplicativo, não seu.',
    title: 'Seu delivery. Sua marca. Seus clientes.',
    text: 'Receba pedidos pelo link da sua loja. A Weper cobra a mensalidade, não comissão por pedido.',
    points: [
      'Cardápio com categorias, fotos e adicionais',
      'Entrega ou retirada, com taxa de entrega por bairro',
      'Pix e cartão online direto na conta da sua loja',
      'Cardápio por QR Code para consultar na mesa',
    ],
    screens: [
      { label: 'Cardápio', src: deliveryCardapio, alt: 'Cardápio do delivery no celular: capa da loja, categorias, destaque e produtos com preço' },
      { label: 'Produto', src: deliveryProduto, alt: 'Detalhe do produto no celular: foto, descrição, adicionais e botão de adicionar ao carrinho' },
    ],
    cta: { label: 'Quero meu delivery próprio', href: PLANS_ANCHOR },
    link: { label: 'Ver demonstração', to: `${PATHS.DEMO}/weper-burger` },
    extraLink: { label: 'Como funciona o delivery próprio', to: PATHS.DELIVERY_LANDING },
  },
  {
    id: 'salao',
    device: 'laptop',
    size: LAPTOP,
    kicker: 'MESAS, COMANDAS E PDV',
    problem: 'Comanda de papel, pedido falado no balcão e conta que não fecha.',
    title: 'Mais agilidade no atendimento, menos confusão na operação.',
    text: 'Mesas, comandas e balcão no mesmo painel. Lance, acompanhe e cobre sem trocar de sistema.',
    points: [
      'PDV de balcão com busca de produto e carrinho',
      'Mesas e comandas: livre, em uso, lançar e cobrar',
      'Abertura e fechamento de caixa, com sangria e suprimento',
    ],
    screens: [
      { label: 'PDV do balcão', src: salaoPdv, alt: 'PDV do balcão: produtos por categoria e carrinho do pedido com total e botão Cobrar' },
      { label: 'Mesas', src: salaoMesas, alt: 'Atendimento: mesas livres e em uso, com as ações Lançar e Cobrar' },
      { label: 'Comandas', src: salaoComandas, alt: 'Atendimento: comandas disponíveis e em uso' },
    ],
    cta: { label: 'Conhecer os planos', href: PLANS_ANCHOR },
  },
  {
    id: 'gestao',
    device: 'laptop',
    size: LAPTOP,
    kicker: 'DASHBOARD E ESTOQUE',
    problem: 'Fechar o dia sem saber quanto vendeu nem o que acabou.',
    title: 'Entenda seus números e controle o que sai da loja.',
    text: 'Os pedidos alimentam o painel de vendas e baixam o estoque. Você acompanha o movimento e o que precisa repor.',
    points: [
      'Faturamento, pedidos e ticket médio por período',
      'Vendas por horário e produtos mais vendidos',
      'Saldo baixa a cada venda, com aviso de reposição',
    ],
    screens: [
      { label: 'Dashboard', src: gestaoDashboard, alt: 'Dashboard: faturamento, pedidos, ticket médio, operação agora e gráficos de vendas' },
      { label: 'Estoque', src: gestaoEstoque, alt: 'Estoque: saldo de cada produto, estoque baixo, sem estoque e ações de entrada e saída' },
    ],
    cta: { label: 'Conhecer os planos', href: PLANS_ANCHOR },
    link: { label: 'Conhecer o controle de estoque', to: PATHS.INVENTORY_LANDING },
  },
  {
    id: 'garcom',
    device: 'phone',
    size: PHONE_ANDROID,
    kicker: 'APP DO GARÇOM · ANDROID',
    problem: 'Garçom indo e voltando do caixa só para lançar pedido.',
    title: 'O pedido sai da mesa direto para a cozinha.',
    text: 'A equipe lança o pedido no celular, ao lado do cliente, em mesas, comandas ou balcão.',
    points: [
      'Mesas e comandas com status de livre e ocupada',
      'Pedido lançado no app aparece no painel da cozinha',
      'Resumo dos pedidos ativos do turno',
    ],
    screens: [
      { label: 'Mesas', src: garcomMesas, alt: 'App do garçom no Android: lista de mesas disponíveis e ocupadas' },
      { label: 'Comandas', src: garcomComandas, alt: 'App do garçom no Android: comandas disponíveis e ocupadas' },
      { label: 'Turno', src: garcomAtendimento, alt: 'App do garçom no Android: pedidos ativos do turno em mesas, comandas e balcão' },
    ],
    cta: { label: 'Quero conhecer a Weper', href: PLANS_ANCHOR },
    link: { label: 'Conhecer o app do garçom', to: PATHS.WAITER_LANDING },
    extraLink: { label: 'Autoatendimento: o cliente pede no tablet da loja', to: PATHS.SELF_SERVICE_LANDING },
  },
];
