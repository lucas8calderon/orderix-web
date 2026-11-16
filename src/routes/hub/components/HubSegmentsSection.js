import { Beef, Pizza, IceCream, UtensilsCrossed, Fish } from 'lucide-react';
import { trackBeforeNavigation, trackHubDemoClick } from '../hubAnalytics';

/**
 * Seção "Explore por segmento" com cards de demonstração
 */

const SEGMENTS = [
  {
    id: 'hamburgueria',
    name: 'Hamburgueria',
    icon: Beef,
    url: '/demo/weper-burger',
  },
  {
    id: 'pizzaria',
    name: 'Pizzaria',
    icon: Pizza,
    url: '/demo/weper-pizza',
  },
  {
    id: 'acai',
    name: 'Açaí',
    icon: IceCream,
    url: '/delivery/acai',
  },
  {
    id: 'marmitaria',
    name: 'Marmitaria',
    icon: UtensilsCrossed,
    url: 'https://www.weper.com.br/delivery/marmita',
  },
  {
    id: 'japones',
    name: 'Japonês',
    icon: Fish,
    url: 'https://www.weper.com.br/delivery/japa',
  },
];

export default function HubSegmentsSection() {
  async function handleSegmentClick(segment, e) {
    e.preventDefault();
    await trackBeforeNavigation(() =>
      trackHubDemoClick(segment.id, segment.name, segment.url)
    );
    window.location.href = segment.url;
  }

  return (
    <section className="hub-segments">
      <h3 className="hub-segments-title">Explore por segmento</h3>
      <div className="hub-segments-scroll">
        {SEGMENTS.map((segment) => {
          const Icon = segment.icon;
          return (
            <a
              key={segment.id}
              href={segment.url}
              className="hub-segment-card"
              onClick={(e) => handleSegmentClick(segment, e)}
            >
              <div className="hub-segment-icon">
                <Icon size={24} />
              </div>
              <span className="hub-segment-name">{segment.name}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
