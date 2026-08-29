/**
 * Assets da landing Weper.
 * Imagens atuais: Chefia (temporárias). Trocar pelos paths futuros quando disponíveis.
 */
import waiterImg from '../../assets/images/1.png';
import selfServiceImg from '../../assets/images/mesa.png';

export const LANDING_IMAGES = {
  dashboard: {
    src: null,
    futurePath: '/images/weper-dashboard.webp',
    alt: 'Painel administrativo Weper',
  },
  waiter: {
    src: waiterImg,
    futurePath: '/images/weper-waiter.webp',
    alt: 'App Garçom Weper',
  },
  kds: {
    src: null,
    futurePath: '/images/weper-kds.webp',
    alt: 'Sistema KDS Weper',
  },
  selfService: {
    src: selfServiceImg,
    futurePath: '/images/weper-self-service.webp',
    alt: 'Autoatendimento Weper',
  },
};

export const WHATSAPP_NUMBER = '5511977844172';

export function openWhatsApp(message) {
  const text = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer');
}

export function scrollToId(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
