import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

/**
 * Rodapé do Hub
 * REDESIGN COMPLETO: com botão de copiar link e compartilhar
 */
export default function HubFooter() {
  const [copied, setCopied] = useState(false);
  const currentYear = new Date().getFullYear();
  const hubUrl = 'https://www.weper.com.br/links';

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(hubUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback para navegadores antigos
      const input = document.createElement('input');
      input.value = hubUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShare() {
    const shareData = {
      title: 'Weper | Do pedido ao resultado',
      text: 'Conheça a Weper - Gestão completa para food service',
      url: hubUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await handleCopyLink();
      }
    } catch (error) {
      // Usuário cancelou - não fazer nada
    }
  }

  return (
    <footer className="hub-footer">
      <div className="hub-footer-actions">
        <button
          type="button"
          className="hub-footer-button"
          onClick={handleCopyLink}
          disabled={copied}
        >
          {copied ? (
            <>
              <Check size={16} />
              <span>Link copiado!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copiar link deste Hub</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          className="hub-footer-button hub-footer-button--share"
          onClick={handleShare}
          aria-label="Compartilhar Hub"
        >
          <Share2 size={16} />
        </button>
      </div>

      <p className="hub-footer-text">
        © {currentYear} Weper. Do pedido ao resultado.
      </p>
    </footer>
  );
}
