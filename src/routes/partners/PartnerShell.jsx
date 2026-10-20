import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import weperLogo from '../../assets/images/weper-logo.png';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';
import { PATHS } from '../../services/accessControl';
import { getCurrentUser } from '../../services/session';
import { logoutPartner, partnerFullName } from '../../services/partnerService';
import './PartnerShell.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Início', to: PATHS.PARTNERS_DASHBOARD, Icon: DashboardOutlinedIcon },
  { key: 'payouts', label: 'Pagamentos', to: PATHS.PARTNERS_PAYOUTS, Icon: PaymentsOutlinedIcon },
  { key: 'profile', label: 'Meu perfil', to: PATHS.PARTNERS_PROFILE, Icon: PersonOutlineIcon },
];

/**
 * Layout da Área de Parceiros: claro, de uma coluna, com cartões brancos.
 * Fica separado do AppShell da loja (sem sidebar escura nem rotas de /app).
 */
export function PartnerShell({ children, maxWidth = 1120 }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const displayName = partnerFullName(user) || user?.name || 'Parceiro';

  const handleLogout = () => {
    logoutPartner();
    navigate(PATHS.PARTNERS_LOGIN, { replace: true });
  };

  return (
    <div className="partner-shell">
      <a className="weper-skip-link" href="#partner-main">Ir para o conteúdo</a>
      <header className="partner-shell-header">
        <div className="partner-shell-bar" style={{ maxWidth }}>
          <Link to={PATHS.PARTNERS_DASHBOARD} className="partner-shell-brand" aria-label="Weper Parceiros, início">
            <img src={weperLogo} alt="Weper" />
            <span className="partner-shell-badge">Parceiros</span>
          </Link>

          <nav className="partner-shell-nav" aria-label="Navegação da Área de Parceiros">
            {NAV_ITEMS.map(({ key, label, to, Icon }) => (
              <NavLink
                key={key}
                to={to}
                className={({ isActive }) => (isActive ? 'partner-shell-link is-active' : 'partner-shell-link')}
              >
                <Icon fontSize="small" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="partner-shell-account">
            <span className="partner-shell-user" title={displayName}>{displayName}</span>
            <ThemeToggleButton className="header-theme-toggle" />
            <Button
              color="inherit"
              onClick={handleLogout}
              aria-label="Sair"
              startIcon={<LogoutOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{ minWidth: 0, color: 'var(--color-text-secondary)' }}
            >
              <span className="partner-shell-logout-label">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main id="partner-main" tabIndex={-1} className="partner-shell-main" style={{ maxWidth }}>
        {children}
      </main>

      <nav className="partner-shell-tabbar" aria-label="Navegação inferior">
        {NAV_ITEMS.map(({ key, label, to, Icon }) => (
          <NavLink
            key={key}
            to={to}
            className={({ isActive }) => (isActive ? 'partner-shell-tab is-active' : 'partner-shell-tab')}
          >
            <Icon fontSize="small" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default PartnerShell;
