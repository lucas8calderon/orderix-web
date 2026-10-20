import { Link } from 'react-router-dom';
import weperLogo from '../../assets/images/weper-logo.png';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';
import { PATHS } from '../../services/accessControl';
import './PartnerShell.css';

/** Moldura das páginas públicas da Área de Parceiros (login, recuperação, redefinição). */
export function PartnerAuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="partner-auth">
      <div className="partner-auth-top">
        <Link to={PATHS.PARTNERS} aria-label="Weper, programa de parceiros">
          <img src={weperLogo} alt="Weper" />
        </Link>
        <ThemeToggleButton className="header-theme-toggle" />
      </div>
      <main className="partner-auth-card">
        <h1 className="partner-auth-title">{title}</h1>
        {subtitle && <p className="partner-auth-subtitle">{subtitle}</p>}
        {children}
      </main>
      {footer && <p className="partner-auth-footnote">{footer}</p>}
    </div>
  );
}

export default PartnerAuthLayout;
