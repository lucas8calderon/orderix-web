import { WeperMark } from '../../home/components/WeperMark';
import { Check, MessageCircle, Share2 } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../home/landingAssets';

/**
 * Cabeçalho do Hub: logo, slogan, introdução e ícones de segmentos
 * REDESIGN COMPLETO: seguindo layout de referência
 */
export default function HubHeader() {
  function handleWhatsAppClick() {
    const message = encodeURIComponent('Olá! Vim pelo Weper Hub e gostaria de saber mais.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  }

  async function handleShareClick() {
    const shareData = {
      title: 'Weper | Do pedido ao resultado',
      text: 'Conheça a Weper - Gestão completa para food service',
      url: 'https://www.weper.com.br/links',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      // Usuário cancelou ou erro - não fazer nada
    }
  }

  return (
    <header className="hub-header">
      {/* Indicadores superiores */}
      <div className="hub-header-top">
        <div className="hub-online-indicator">
          <span className="hub-online-dot" />
          <span className="hub-online-text">Atendimento Online</span>
        </div>
        <div className="hub-header-actions">
          <button
            type="button"
            className="hub-header-icon-btn"
            onClick={handleWhatsAppClick}
            aria-label="Contato via WhatsApp"
          >
            <MessageCircle size={20} />
          </button>
          <button
            type="button"
            className="hub-header-icon-btn"
            onClick={handleShareClick}
            aria-label="Compartilhar"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Logo e marca */}
      <div className="hub-logo-wrapper">
        <div className="hub-logo-circle">
          <WeperMark size={48} showWordmark={false} />
        </div>
        <span className="weper-verified-badge" role="img" aria-label="Perfil oficial da Weper">
          <Check size={13} strokeWidth={3} aria-hidden="true" />
        </span>
      </div>
      <h1 className="hub-brand-name">Weper</h1>
      <p className="hub-slogan">Do pedido ao resultado</p>

      {/* Título e descrição principal */}
      <h2 className="hub-title">Tudo que seu negócio precisa para vender mais.</h2>
      <p className="hub-description">
        Delivery próprio, cardápio digital, mesas e comandas, cozinha (KDS), estoque, pagamentos e muito mais.
      </p>
    </header>
  );
}
