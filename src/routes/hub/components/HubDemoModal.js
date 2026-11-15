import { useEffect, useRef } from 'react';
import { X, ArrowRight, Store } from 'lucide-react';
import { getActiveDemos } from '../hubConfig';
import { trackBeforeNavigation, trackHubDemoClick } from '../hubAnalytics';

/**
 * Modal de demonstrações do Hub
 */
export default function HubDemoModal({ isOpen, onClose }) {
  const backdropRef = useRef(null);
  const closeButtonRef = useRef(null);
  const demos = getActiveDemos();

  // Bloqueia scroll do body quando modal está aberto
  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Foca no botão de fechar quando modal abre
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Fecha com Escape
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fecha ao clicar no backdrop
  function handleBackdropClick(event) {
    if (event.target === backdropRef.current) {
      onClose();
    }
  }

  async function handleDemoClick(demo) {
    await trackBeforeNavigation(() =>
      trackHubDemoClick(demo.id, demo.name, demo.url)
    );
    window.location.href = demo.url;
  }

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="hub-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div className="hub-modal" role="dialog" aria-modal="true" aria-labelledby="hub-modal-title">
        <div className="hub-modal-header">
          <div className="hub-modal-header-content">
            <h2 id="hub-modal-title" className="hub-modal-title">
              Escolha uma demonstração
            </h2>
            <p className="hub-modal-subtitle">
              Explore como a Weper funciona em diferentes tipos de estabelecimento.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="hub-modal-close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="hub-modal-body">
          <div className="hub-modal-grid">
            {demos.map((demo) => (
              <button
                key={demo.id}
                type="button"
                className="hub-demo-card"
                onClick={() => handleDemoClick(demo)}
              >
                <div className="hub-demo-icon">
                  <Store size={20} />
                </div>
                <div className="hub-demo-content">
                  <div className="hub-demo-title">{demo.name}</div>
                  <div className="hub-demo-description">{demo.description}</div>
                </div>
                <ArrowRight size={16} className="hub-demo-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
