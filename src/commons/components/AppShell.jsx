import * as React from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Link } from 'react-router-dom';
import { ThemeToggleButton } from './ThemeToggleButton';
import './AppShell.css';

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;
const MOBILE_WIDTH = 264;
const COLLAPSE_STORAGE_KEY = 'weper.sidebar.collapsed';

function readStoredCollapsed() {
  try {
    const value = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (value === 'true') return true;
    if (value === 'false') return false;
  } catch {
    // Armazenamento indisponível (modo privado, bloqueio): usa o padrão do breakpoint.
  }
  return null;
}

function storeCollapsed(collapsed) {
  try {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
  } catch {
    // Sem persistência: o menu continua funcionando na sessão atual.
  }
}

function getInitial(name) {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed.charAt(0).toLocaleUpperCase('pt-BR') : '?';
}

export function AppShell({
  logo,
  brandMark,
  contextLabel,
  contextHint,
  groups = [],
  accountName,
  accountRole,
  accountHint,
  onLogout,
  onNavigate,
  /** Conteúdo opcional acima da conta (ex.: menu Ajuda). Recebe { collapsed }. */
  renderFooter,
  flush = false,
  className = '',
  children,
}) {
  const isMobile = useMediaQuery('(max-width:900px)');
  const isTablet = useMediaQuery('(max-width:1199px)');
  const [storedCollapsed, setStoredCollapsed] = React.useState(readStoredCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const menuButtonRef = React.useRef(null);

  // Sem preferência salva, o tablet começa recolhido e o desktop expandido.
  const collapsed = !isMobile && (storedCollapsed ?? isTablet);
  const expanded = !collapsed;
  const drawerWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const displayName = accountName || 'Minha conta';
  const secondaryLine = accountRole || accountHint;

  const toggleCollapsed = () => {
    const next = !collapsed;
    storeCollapsed(next);
    setStoredCollapsed(next);
  };

  const closeMobile = () => {
    setMobileOpen(false);
    // Devolve o foco ao botão que abriu o drawer.
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  const handleNavigate = () => {
    onNavigate?.();
    if (isMobile) setMobileOpen(false);
  };

  const brandImage = brandMark || logo;

  const header = (
    <Box className="weper-shell-brand">
      {expanded ? (
        <>
          <Box className="weper-shell-brand-lockup">
            {brandMark ? (
              <>
                <Box component="img" src={brandMark} alt="" className="weper-shell-mark" />
                <span className="weper-shell-wordmark">Weper</span>
              </>
            ) : (
              logo && <Box component="img" src={logo} alt="Weper" className="weper-shell-logo" />
            )}
          </Box>
          {isMobile ? (
            <IconButton className="weper-shell-toggle" aria-label="Fechar menu" onClick={closeMobile}>
              <CloseIcon />
            </IconButton>
          ) : (
            <Tooltip title="Recolher menu" placement="right">
              <IconButton
                className="weper-shell-toggle"
                aria-label="Recolher menu"
                aria-expanded="true"
                onClick={toggleCollapsed}
              >
                <KeyboardDoubleArrowLeftIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      ) : (
        <Tooltip title="Expandir menu" placement="right">
          <IconButton
            className="weper-shell-brand-button"
            aria-label="Expandir menu"
            aria-expanded="false"
            onClick={toggleCollapsed}
          >
            {brandImage && <Box component="img" src={brandImage} alt="" className="weper-shell-mark" />}
            <KeyboardDoubleArrowRightIcon className="weper-shell-brand-expand" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  const navigation = (
    <Box className={`weper-shell-nav ${collapsed ? 'is-collapsed' : ''}`}>
      {header}

      <Box component="nav" aria-label="Navegação principal" className="weper-shell-menu">
        {groups.map((group) => {
          if (!group.items?.length) return null;
          return (
            <Box key={group.label} className="weper-shell-group" role="group" aria-label={group.label}>
              {expanded
                ? <p className="weper-shell-group-label" aria-hidden="true">{group.label}</p>
                : <span className="weper-shell-group-divider" aria-hidden="true" />}
              <List disablePadding>
                {group.items.map((item) => (
                  <Tooltip
                    key={item.key}
                    title={collapsed ? item.title : ''}
                    placement="right"
                    disableInteractive
                  >
                    <ListItemButton
                      className="weper-nav-item"
                      component={Link}
                      to={item.to}
                      aria-label={collapsed ? item.title : undefined}
                      aria-current={item.selected ? 'page' : undefined}
                      selected={item.selected}
                      onClick={handleNavigate}
                    >
                      <ListItemIcon className="weper-nav-icon">{item.icon}</ListItemIcon>
                      {expanded && (
                        <ListItemText
                          className="weper-nav-label"
                          primary={item.title}
                          primaryTypographyProps={{ noWrap: true }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                ))}
              </List>
            </Box>
          );
        })}
      </Box>

      {renderFooter ? <Box className="weper-shell-footer">{renderFooter({ collapsed })}</Box> : null}
      <Box className="weper-shell-account">
        <Tooltip
          title={collapsed ? [displayName, secondaryLine].filter(Boolean).join(' · ') : ''}
          placement="right"
        >
          <Box
            className="weper-shell-account-card"
            tabIndex={collapsed ? 0 : undefined}
            aria-label={collapsed ? [displayName, secondaryLine].filter(Boolean).join(', ') : undefined}
          >
            <span className="weper-shell-avatar" aria-hidden="true">{getInitial(accountName)}</span>
            {expanded && (
              <Box className="weper-shell-account-text">
                <Typography noWrap className="weper-shell-account-name">{displayName}</Typography>
                {secondaryLine && (
                  <Typography noWrap className="weper-shell-account-hint">{secondaryLine}</Typography>
                )}
              </Box>
            )}
            {expanded && onLogout && (
              <Tooltip title="Sair">
                <IconButton className="weper-shell-account-logout" aria-label="Sair" onClick={onLogout}>
                  <LogoutOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box className={`weper-workspace weper-shell ${className}`}>
      <a className="weper-skip-link" href="#workspace-main">Ir para o conteúdo</a>
      <Drawer
        className="weper-shell-drawer"
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={closeMobile}
        ModalProps={{
          keepMounted: true,
          BackdropProps: { className: 'weper-shell-backdrop' },
        }}
        PaperProps={{ component: 'aside', 'aria-label': 'Menu lateral' }}
        sx={{
          width: isMobile ? 0 : drawerWidth,
          flexShrink: 0,
          transition: 'width 200ms ease',
          '& .MuiDrawer-paper': {
            width: isMobile ? `min(${MOBILE_WIDTH}px, calc(100vw - 48px))` : drawerWidth,
          },
        }}
      >
        {navigation}
      </Drawer>

      <Box className="weper-shell-column">
        <Box component="header" className="weper-shell-header">
          <Toolbar className="weper-shell-toolbar">
            {isMobile && (
              <IconButton
                ref={menuButtonRef}
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box className="weper-shell-context">
              <Typography noWrap className="weper-shell-context-title">{contextLabel || 'Weper'}</Typography>
              {contextHint && <Typography noWrap className="weper-shell-context-hint">{contextHint}</Typography>}
            </Box>
            <ThemeToggleButton className="header-theme-toggle" />
            <Button
              color="inherit"
              onClick={onLogout}
              startIcon={<LogoutOutlinedIcon sx={{ fontSize: 18 }} />}
              aria-label="Sair"
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Sair</Box>
            </Button>
          </Toolbar>
        </Box>
        <Box
          component="main"
          id="workspace-main"
          tabIndex={-1}
          className={flush ? 'weper-shell-main is-flush' : 'weper-shell-main'}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
