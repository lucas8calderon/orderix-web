/**
 * Assets da landing Weper (composições oficiais).
 */
import ecosystemDevices from '../../assets/images/landing/ecosystem-devices.webp';
import desktopPdv from '../../assets/images/landing/desktop-pdv.webp';
import lifestyleWaiter from '../../assets/images/landing/lifestyle-waiter.webp';

export const LANDING_IMAGES = {
  ecosystem: {
    src: ecosystemDevices,
    alt: 'Weper no mobile, tablet landscape e desktop',
    width: 1600,
    height: 1066,
  },
  desktop: {
    src: desktopPdv,
    alt: 'Estação desktop Weper com monitor, teclado, mouse e impressora térmica',
    width: 1600,
    height: 1066,
  },
  lifestyle: {
    src: lifestyleWaiter,
    alt: 'Garçom com polo Weper atendendo família à mesa, com celular e resumo do turno',
    width: 1400,
    height: 1120,
  },
};

export const WHATSAPP_NUMBER = '5511924570853';
export const WHATSAPP_DISPLAY = '+55 11 92457-0853';

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
