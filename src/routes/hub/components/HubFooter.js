import { PATHS } from '../../../services/accessControl';

/**
 * Rodapé do Hub
 * REDESIGN: mais compacto e discreto
 */
export default function HubFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hub-footer">
      <p className="hub-footer-text">
        © {currentYear} Weper · Do pedido ao resultado
        <br />
        <a href={PATHS.HOME} className="hub-footer-link">
          www.weper.com.br
        </a>
      </p>
    </footer>
  );
}
