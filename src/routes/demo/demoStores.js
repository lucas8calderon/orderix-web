import { demoAsset } from './demoAssets';

const img = (folder, file) => demoAsset(`/images/demo/${folder}/${file}`);

function extra(id, name, price) {
  return { id, name, price };
}

function group(id, name, items) {
  return { id, name, items };
}

function option(id, name, price = 0) {
  return { id, name, price };
}

function product(partial) {
  return {
    available: true,
    extras: [],
    mandatoryGroups: [],
    ...partial,
  };
}

/**
 * Catálogos locais da demonstração institucional.
 * Para incluir Adega, Restaurante etc.: adicione um objeto em DEMO_STORES.
 */
export const DEMO_STORES = [
  {
    slug: 'weper-burger',
    name: 'Weper Burger',
    type: 'burger',
    typeLabel: 'Hamburgueria',
    description: 'Smash burgers, combos e acompanhamentos no ritmo de uma hamburgueria de verdade.',
    seoTitle: 'Demo Cardápio Digital para Hamburgueria | Weper',
    seoDescription: 'Experimente o cardápio digital Weper em uma hamburgueria de demonstração. Monte o pedido como seus clientes fariam.',
    logo: img('burger', 'logo.jpg'),
    cover: img('burger', 'cover.jpg'),
    accent: '#C2410C',
    accentSoft: 'rgba(194, 65, 12, 0.14)',
    hours: '18:00 – 23:30',
    address: 'Rua das Grelhas, 120 — Vila Weper, São Paulo',
    open: true,
    settings: {
      deliveryFee: 6.9,
      minOrder: 0,
      defaultCustomerName: 'Visitante',
      estimatedMinutes: 25,
    },
    categories: [
      {
        id: 'smash',
        name: 'Smash',
        products: [
          product({
            id: 'smash-cheddar',
            name: 'Smash Cheddar',
            description: 'Pão brioche, carne smash, cheddar, alface, tomate, cebola roxa e molho especial.',
            price: 22.9,
            image: img('burger', 'smash-cheddar.jpg'),
            extras: [
              extra('bacon', 'Bacon crocante', 4.5),
              extra('cheddar', 'Cheddar extra', 3.5),
              extra('ovo', 'Ovo', 3),
            ],
          }),
          product({
            id: 'smash-bacon',
            name: 'Smash Bacon',
            description: 'Pão brioche, carne smash, cheddar, bacon crocante, alface, tomate, cebola roxa e molho da casa.',
            price: 34.9,
            image: img('burger', 'smash-bacon.jpg'),
            extras: [
              extra('cheddar', 'Cheddar extra', 3.5),
              extra('jalapeno', 'Jalapeño', 2.5),
            ],
          }),
          product({
            id: 'smash-original',
            name: 'Smash Original',
            description: 'Pão brioche, duas carnes smash, cheddar, bacon crocante, alface, tomate e molho da casa.',
            price: 36.9,
            image: img('burger', 'smash-original.jpg'),
            extras: [
              extra('bacon', 'Bacon extra', 4.5),
              extra('cheddar', 'Cheddar extra', 3.5),
              extra('molho', 'Molho especial', 2),
            ],
          }),
        ],
      },
      {
        id: 'classicos',
        name: 'Clássicos',
        products: [
          product({
            id: 'classico-cheddar',
            name: 'Clássico Cheddar',
            description: 'Pão brioche, carne smash, cheddar, alface, tomate e molho da casa.',
            price: 24.9,
            image: img('burger', 'classico-cheddar.jpg'),
            extras: [
              extra('bacon', 'Bacon crocante', 4.5),
              extra('ovo', 'Ovo', 3),
            ],
          }),
          product({
            id: 'classico-americano',
            name: 'Clássico Americano',
            description: 'Pão brioche, carne smash, queijo prato, alface, tomate e molho da casa.',
            price: 25.9,
            image: img('burger', 'classico-americano.jpg'),
            extras: [
              extra('bacon', 'Bacon crocante', 4.5),
              extra('cheddar', 'Cheddar extra', 3.5),
            ],
          }),
          product({
            id: 'classico-weper',
            name: 'Clássico Weper',
            description: 'Pão brioche, carne smash, queijo prato, cebola caramelizada, alface, tomate e molho da casa.',
            price: 27.9,
            image: img('burger', 'classico-weper.jpg'),
            extras: [
              extra('bacon', 'Bacon crocante', 4.5),
              extra('molho', 'Molho especial', 2),
            ],
          }),
          product({
            id: 'bacon-weper',
            name: 'Bacon Weper',
            description: 'Pão brioche, carne smash, cheddar, bacon crocante, alface, tomate e molho especial.',
            price: 31.9,
            image: img('burger', 'bacon-weper.jpg'),
            extras: [
              extra('cheddar', 'Cheddar extra', 3.5),
              extra('cebola', 'Cebola crispy', 2.5),
            ],
          }),
          product({
            id: 'veggie',
            name: 'Veggie Weper',
            description: 'Pão brioche, hambúrguer vegetal, queijo, alface, tomate, cebola roxa e molho especial.',
            price: 27.9,
            image: img('burger', 'veggie.jpg'),
            available: false,
          }),
          product({
            id: 'chicken-crispy',
            name: 'Chicken Crispy',
            description: 'Pão brioche, frango empanado crocante, alface, tomate e molho especial.',
            price: 32.9,
            image: img('burger', 'chicken-crispy.jpg'),
            extras: [
              extra('bacon', 'Bacon crocante', 4.5),
              extra('cheddar', 'Cheddar extra', 3.5),
            ],
          }),
        ],
      },
      {
        id: 'acompanhamentos',
        name: 'Acompanhamentos',
        products: [
          product({
            id: 'batata',
            name: 'Batatas Weper',
            description: 'Crocantes por fora, macias por dentro. O acompanhamento perfeito para o seu burger.',
            price: 14.9,
            image: img('burger', 'batatas.jpg'),
            extras: [extra('cheddar', 'Cheddar extra', 3.5)],
          }),
          product({
            id: 'onion-rings',
            name: 'Onion Rings Weper',
            description: 'Crocância que vicia em cada mordida.',
            price: 16.9,
            image: img('burger', 'onion-rings.jpg'),
          }),
          product({
            id: 'nuggets',
            name: 'Nuggets Weper',
            description: 'Crocante por fora, suculento por dentro.',
            price: 18.9,
            image: img('burger', 'nuggets.jpg'),
          }),
        ],
      },
      {
        id: 'bebidas',
        name: 'Bebidas',
        products: [
          product({
            id: 'refri-lata',
            name: 'Refrigerante lata',
            description: '350ml bem gelado. Coca-Cola, Sprite ou Fanta.',
            price: 7.9,
            image: img('burger', 'refrigerante-lata.jpg'),
            extras: [
              extra('coca', 'Coca-Cola', 0),
              extra('sprite', 'Sprite', 0),
              extra('fanta', 'Fanta Laranja', 0),
            ],
          }),
          product({
            id: 'sucos',
            name: 'Sucos naturais',
            description: 'Mais saúde e sabor para o seu dia.',
            price: 11.9,
            image: img('burger', 'sucos.jpg'),
            extras: [
              extra('laranja', 'Laranja', 0),
              extra('morango', 'Morango', 0),
              extra('abacaxi', 'Abacaxi', 0),
            ],
          }),
          product({
            id: 'milkshake',
            name: 'Milkshakes Weper',
            description: 'Cremosos, gelados e irresistíveis.',
            price: 16.9,
            image: img('burger', 'milkshake.jpg'),
            extras: [
              extra('chocolate', 'Chocolate', 0),
              extra('cookies', 'Cookies and Cream', 0),
              extra('morango', 'Morango', 0),
            ],
          }),
        ],
      },
    ],
  },
  {
    slug: 'weper-pizza',
    name: 'Weper Pizza',
    type: 'pizza',
    typeLabel: 'Pizzaria',
    description: 'Pizzas no ponto, tamanho e borda como no salão — experimente o pedido digital.',
    seoTitle: 'Demo Cardápio Digital para Pizzaria | Weper',
    seoDescription: 'Experimente o cardápio digital Weper em uma pizzaria de demonstração. Escolha tamanho, borda e finalize o pedido.',
    logo: img('pizza', 'logo.jpg'),
    cover: img('pizza', 'cover.jpg'),
    accent: '#B91C1C',
    accentSoft: 'rgba(185, 28, 28, 0.14)',
    hours: '17:30 – 23:00',
    address: 'Alameda do Forno, 45 — Centro, São Paulo',
    open: true,
    settings: {
      deliveryFee: 8.5,
      minOrder: 0,
      defaultCustomerName: 'Visitante',
      estimatedMinutes: 40,
    },
    categories: [
      {
        id: 'tradicionais',
        name: 'Tradicionais',
        products: [
          product({
            id: 'margherita',
            name: 'Margherita',
            description: 'A simplicidade que conquista sempre. Molho de tomate, mussarela e manjericão fresco.',
            price: 42.9,
            image: img('pizza', 'margherita.jpg'),
            mandatoryGroups: [
              group('tamanho', 'Tamanho', [
                option('p', 'Pequena', 0),
                option('m', 'Média', 8),
                option('g', 'Grande', 16),
              ]),
            ],
            extras: [
              extra('massa-fina', 'Massa fina', 0),
              extra('borda-catupiry', 'Borda de catupiry', 9.9),
              extra('borda-cheddar', 'Borda de cheddar', 9.9),
            ],
          }),
          product({
            id: 'calabresa',
            name: 'Calabresa',
            description: 'O sabor tradicional que nunca sai de moda.',
            price: 46.9,
            image: img('pizza', 'calabresa.jpg'),
            mandatoryGroups: [
              group('tamanho', 'Tamanho', [
                option('p', 'Pequena', 0),
                option('m', 'Média', 8),
                option('g', 'Grande', 16),
              ]),
            ],
            extras: [
              extra('massa-fina', 'Massa fina', 0),
              extra('borda-catupiry', 'Borda de catupiry', 9.9),
              extra('borda-cheddar', 'Borda de cheddar', 9.9),
            ],
          }),
          product({
            id: 'portuguesa',
            name: 'Portuguesa',
            description: 'Tradição e sabor em cada fatia.',
            price: 49.9,
            image: img('pizza', 'portuguesa.jpg'),
            available: false,
            mandatoryGroups: [
              group('tamanho', 'Tamanho', [
                option('p', 'Pequena', 0),
                option('m', 'Média', 8),
                option('g', 'Grande', 16),
              ]),
            ],
            extras: [
              extra('borda-catupiry', 'Borda de catupiry', 9.9),
            ],
          }),
        ],
      },
      {
        id: 'especiais',
        name: 'Especiais',
        products: [
          product({
            id: 'quatro-queijos',
            name: 'Quatro Queijos',
            description: 'Quatro sabores, uma experiência incrível.',
            price: 54.9,
            image: img('pizza', 'quatro-queijos.jpg'),
            mandatoryGroups: [
              group('tamanho', 'Tamanho', [
                option('p', 'Pequena', 0),
                option('m', 'Média', 8),
                option('g', 'Grande', 16),
              ]),
            ],
            extras: [
              extra('massa-fina', 'Massa fina', 0),
              extra('borda-catupiry', 'Borda de catupiry', 9.9),
            ],
          }),
          product({
            id: 'frango-catupiry',
            name: 'Frango com Catupiry',
            description: 'Uma combinação que todo mundo ama.',
            price: 52.9,
            image: img('pizza', 'frango-catupiry.jpg'),
            mandatoryGroups: [
              group('tamanho', 'Tamanho', [
                option('p', 'Pequena', 0),
                option('m', 'Média', 8),
                option('g', 'Grande', 16),
              ]),
            ],
            extras: [
              extra('borda-catupiry', 'Borda de catupiry', 9.9),
              extra('borda-cheddar', 'Borda de cheddar', 9.9),
            ],
          }),
          product({
            id: 'pepperoni',
            name: 'Pepperoni',
            description: 'O clássico que nunca sai de moda.',
            price: 51.9,
            image: img('pizza', 'pepperoni.jpg'),
            mandatoryGroups: [
              group('tamanho', 'Tamanho', [
                option('p', 'Pequena', 0),
                option('m', 'Média', 8),
                option('g', 'Grande', 16),
              ]),
            ],
            extras: [
              extra('massa-fina', 'Massa fina', 0),
              extra('borda-cheddar', 'Borda de cheddar', 9.9),
            ],
          }),
        ],
      },
      {
        id: 'doces',
        name: 'Doces',
        products: [
          product({
            id: 'pizza-chocolate',
            name: 'Chocolate com morango',
            description: 'Um doce final para momentos especiais.',
            price: 48.9,
            image: img('pizza', 'chocolate.jpg'),
            mandatoryGroups: [
              group('tamanho', 'Tamanho', [
                option('p', 'Pequena', 0),
                option('m', 'Média', 6),
              ]),
            ],
          }),
        ],
      },
      {
        id: 'bebidas-pizza',
        name: 'Bebidas',
        products: [
          product({
            id: 'refri-lata',
            name: 'Refrigerante lata',
            description: '350ml bem gelado. Coca-Cola, Sprite ou Fanta.',
            price: 7.9,
            image: img('burger', 'refrigerante-lata.jpg'),
            extras: [
              extra('coca', 'Coca-Cola', 0),
              extra('sprite', 'Sprite', 0),
              extra('fanta', 'Fanta Laranja', 0),
            ],
          }),
          product({
            id: 'sucos',
            name: 'Sucos naturais',
            description: 'Mais saúde e sabor para o seu dia.',
            price: 11.9,
            image: img('burger', 'sucos.jpg'),
            extras: [
              extra('laranja', 'Laranja', 0),
              extra('morango', 'Morango', 0),
              extra('abacaxi', 'Abacaxi', 0),
            ],
          }),
          product({
            id: 'milkshake',
            name: 'Milkshakes Weper',
            description: 'Cremosos, gelados e irresistíveis.',
            price: 16.9,
            image: img('burger', 'milkshake.jpg'),
            extras: [
              extra('chocolate', 'Chocolate', 0),
              extra('cookies', 'Cookies and Cream', 0),
              extra('morango', 'Morango', 0),
            ],
          }),
        ],
      },
    ],
  },
  {
    slug: 'weper-pastel',
    name: 'Weper Pastel',
    type: 'pastel',
    typeLabel: 'Pastelaria',
    description: 'Pastéis crocantes, caldo e sucos — o pedido da feira, em cardápio digital.',
    seoTitle: 'Demo Cardápio Digital para Pastelaria | Weper',
    seoDescription: 'Experimente o cardápio digital Weper em uma pastelaria de demonstração. Monte o pedido como na feira.',
    logo: img('pastel', 'logo.svg'),
    cover: img('pastel', 'cover.svg'),
    accent: '#D97706',
    accentSoft: 'rgba(217, 119, 6, 0.16)',
    hours: '10:00 – 19:00',
    address: 'Feira da Praça Weper, box 08 — São Paulo',
    open: true,
    settings: {
      deliveryFee: 5.5,
      minOrder: 0,
      defaultCustomerName: 'Visitante',
      estimatedMinutes: 20,
    },
    categories: [
      {
        id: 'salgados',
        name: 'Salgados',
        products: [
          product({
            id: 'pastel-carne',
            name: 'Pastel de carne',
            description: 'Carne moída temperada na massa crocante.',
            price: 12.9,
            image: img('pastel', 'carne.svg'),
            extras: [
              extra('azeitona', 'Azeitona', 1.5),
              extra('queijo', 'Queijo extra', 2.5),
            ],
          }),
          product({
            id: 'pastel-queijo',
            name: 'Pastel de queijo',
            description: 'Mussarela derretida, bem recheado.',
            price: 11.9,
            image: img('pastel', 'queijo.svg'),
            extras: [extra('oregano', 'Orégano', 0)],
          }),
          product({
            id: 'pastel-pizza',
            name: 'Pastel de pizza',
            description: 'Presunto, queijo, tomate e orégano.',
            price: 13.9,
            image: img('pastel', 'pizza.svg'),
            extras: [extra('azeitona', 'Azeitona', 1.5)],
          }),
          product({
            id: 'pastel-frango',
            name: 'Pastel de frango',
            description: 'Frango desfiado com catupiry.',
            price: 14.9,
            image: img('pastel', 'frango.svg'),
            extras: [extra('catupiry', 'Catupiry extra', 2.5)],
          }),
          product({
            id: 'pastel-palmito',
            name: 'Pastel de palmito',
            description: 'Palmito cremoso com azeitona.',
            price: 13.5,
            image: img('pastel', 'palmito.svg'),
            available: false,
          }),
        ],
      },
      {
        id: 'doces-pastel',
        name: 'Doces',
        products: [
          product({
            id: 'pastel-chocolate',
            name: 'Pastel de chocolate',
            description: 'Chocolate ao leite derretido.',
            price: 12.5,
            image: img('pastel', 'chocolate.svg'),
          }),
          product({
            id: 'pastel-banana',
            name: 'Banana com canela',
            description: 'Banana, canela e açúcar.',
            price: 11.5,
            image: img('pastel', 'banana.svg'),
          }),
        ],
      },
      {
        id: 'combos',
        name: 'Combos',
        products: [
          product({
            id: 'combo-feira',
            name: 'Combo feira',
            description: '2 pastéis salgados + caldo de cana.',
            price: 28.9,
            image: img('pastel', 'combo.svg'),
            extras: [extra('pastel-extra', 'Pastel extra', 11.9)],
          }),
        ],
      },
      {
        id: 'bebidas-pastel',
        name: 'Bebidas',
        products: [
          product({
            id: 'caldo-cana',
            name: 'Caldo de cana',
            description: 'Natural, 400ml. Com ou sem limão.',
            price: 8.9,
            image: img('pastel', 'caldo.svg'),
            extras: [extra('limao', 'Com limão', 0)],
          }),
          product({
            id: 'guarana',
            name: 'Guaraná lata',
            description: '350ml.',
            price: 7.5,
            image: img('shared', 'soda.svg'),
          }),
          product({
            id: 'suco-maracuja',
            name: 'Suco de maracujá',
            description: 'Natural, 400ml.',
            price: 9.9,
            image: img('shared', 'juice.svg'),
          }),
        ],
      },
    ],
  },
];

/** Âncora da grade de lojas em /demo (CTA “Outras lojas de demonstração”). */
export const DEMO_STORES_SECTION_ID = 'demo-stores';

export function listDemoStores() {
  return DEMO_STORES;
}

export function getDemoStore(slug) {
  if (!slug) return null;
  return DEMO_STORES.find((store) => store.slug === slug) || null;
}

export function findDemoProduct(store, productId) {
  if (!store || productId == null) return null;
  for (const category of store.categories || []) {
    const found = (category.products || []).find((product) => product.id === productId);
    if (found) return found;
  }
  return null;
}

export function demoStorePath(slug) {
  return `/demo/${slug}`;
}
