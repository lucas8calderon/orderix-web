import { DEMO_OPTIONS } from './hubConfig';
import { HUB_SEGMENTS, resolveSegmentDestination } from './hubSegments';

const DEMO_BY_SEGMENT = {
  hamburguerias: 'weper-burger',
  pizzarias: 'weper-pizza',
  acaiterias: 'weper-acai',
  pastelarias: 'weper-pastel',
};

const DELIVERY_BY_SEGMENT = {
  japones: 'https://www.weper.com.br/delivery/japa',
  marmitarias: 'https://www.weper.com.br/delivery/marmita',
};

describe('hubSegments', () => {
  it('lista os vinte segmentos pedidos, sem id repetido', () => {
    expect(HUB_SEGMENTS).toHaveLength(20);
    expect(new Set(HUB_SEGMENTS.map((segment) => segment.id)).size).toBe(20);
    HUB_SEGMENTS.forEach((segment) => {
      expect(segment.name).toEqual(expect.any(String));
      expect(segment.description).toEqual(expect.any(String));
      expect(segment.benefits).toHaveLength(3);
      expect(segment.icon).toBeTruthy();
      segment.benefits.forEach((benefit) => {
        expect(benefit.title).toEqual(expect.any(String));
        expect(benefit.description).toEqual(expect.any(String));
        expect(benefit.icon).toBeTruthy();
      });
    });
  });

  it('usa os textos do modal de lanchonetes', () => {
    const segment = HUB_SEGMENTS.find((item) => item.id === 'lanchonetes');
    expect(segment.description).toBe('Pedido rápido no balcão ou viagem.');
    expect(segment.benefits.map((item) => [item.title, item.description])).toEqual([
      ['Atendimento de balcão', 'Agilidade e organização nas vendas.'],
      ['Cardápio sempre visível no celular', 'Mais praticidade para seus clientes.'],
      ['Conta e pagamento sem papel', 'Mais controle e eficiência no caixa.'],
    ]);
  });

  it('liga demonstrações às URLs ativas do hubConfig', () => {
    Object.entries(DEMO_BY_SEGMENT).forEach(([segmentId, demoId]) => {
      const segment = HUB_SEGMENTS.find((item) => item.id === segmentId);
      const demo = DEMO_OPTIONS.find((item) => item.id === demoId);
      expect(resolveSegmentDestination(segment)).toBe(demo.url);
    });
  });

  it('liga japonês e marmita aos deliveries já existentes', () => {
    Object.entries(DELIVERY_BY_SEGMENT).forEach(([segmentId, url]) => {
      const segment = HUB_SEGMENTS.find((item) => item.id === segmentId);
      expect(resolveSegmentDestination(segment)).toBe(url);
    });
  });

  it('deixa os demais segmentos sem destino, para o modal', () => {
    const linked = new Set([
      ...Object.keys(DEMO_BY_SEGMENT),
      ...Object.keys(DELIVERY_BY_SEGMENT),
    ]);
    const informational = HUB_SEGMENTS.filter((segment) => !linked.has(segment.id));
    expect(informational.map((segment) => segment.id)).toEqual([
      'lanchonetes',
      'padarias',
      'sorveterias',
      'restaurantes',
      'cafeterias',
      'docerias',
      'confeitarias',
      'bares',
      'espetarias',
      'churrascarias',
      'food-trucks',
      'rotisserias',
      'sucos',
      'comida-saudavel',
    ]);
    informational.forEach((segment) => {
      expect(resolveSegmentDestination(segment)).toBeNull();
    });
  });

  it('ignora URL de delivery que não está na lista conhecida', () => {
    expect(resolveSegmentDestination({
      id: 'inventado',
      deliveryUrl: 'https://example.com/delivery/foo',
    })).toBeNull();
  });

  it('usa a capa da demo em hamburgueria, pizzaria e pastelaria e foto Pexels no restante', () => {
    const demoCovers = {
      hamburguerias: '/images/demo/burger/cover.jpg',
      pizzarias: '/images/demo/pizza/cover.jpg',
      pastelarias: '/images/demo/pastel/cover.jpg',
    };
    const withPhoto = [
      'hamburguerias',
      'pizzarias',
      'acaiterias',
      'marmitarias',
      'japones',
      'lanchonetes',
      'padarias',
      'sorveterias',
      'restaurantes',
      'cafeterias',
      'pastelarias',
      'docerias',
      'confeitarias',
      'bares',
      'espetarias',
      'churrascarias',
      'food-trucks',
      'comida-saudavel',
    ];
    const withoutPhoto = ['rotisserias', 'sucos'];

    withPhoto.forEach((id) => {
      const segment = HUB_SEGMENTS.find((item) => item.id === id);
      expect(segment.image).toBe(demoCovers[id] || `/images/segments/${id}.webp`);
    });
    withoutPhoto.forEach((id) => {
      expect(HUB_SEGMENTS.find((item) => item.id === id).image).toBeUndefined();
    });

    const images = HUB_SEGMENTS.map((segment) => segment.image).filter(Boolean);
    const pexelsImages = images.filter((image) => !Object.values(demoCovers).includes(image));
    expect(images).toHaveLength(withPhoto.length);
    expect(pexelsImages).toHaveLength(withPhoto.length - Object.keys(demoCovers).length);
    expect(pexelsImages.every((image) => image.startsWith('/images/segments/') && image.endsWith('.webp'))).toBe(true);
    expect(new Set(images).size).toBe(images.length);
  });
});
