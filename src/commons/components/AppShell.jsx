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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Link } from 'react-router-dom';
import { ThemeToggleButton } from './ThemeToggleButton';
import './AppShell.css';

export function AppShell({
  logo,
  contextLabel,
  contextHint,
  groups = [],
  accountName,
  accountHint,
  onLogout,
  onNavigate,
  flush = false,
  children,
}) {
  const isMobile = useMediaQuery('(max-width:900px)');
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const expanded = isMobile || desktopOpen;
  const drawerWidth = desktopOpen ? 248 : 72;

  const toggleDrawer = () => {
    if (isMobile) setMobileOpen((open) => !open);
    else setDesktopOpen((open) => !open);
  };

  const handleNavigate = () => {
    onNavigate?.();
    setMobileOpen(false);
  };

  const navigation = (
    <Box className="weper-shell-nav">
      <Toolbar className="weper-shell-brand">
        {expanded && logo && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box component="img" src={logo} alt="Weper" className="weper-shell-logo" />
          </Box>
        )}
        <IconButton
          aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
          onClick={toggleDrawer}
          sx={{ color: 'var(--color-sidebar-text)' }}
        >
          {expanded ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      <Box component="nav" aria-label="Navegação principal" className="weper-shell-menu">
        {groups.map((group) => {
          if (!group.items?.length) return null;
          return (
            <Box key={group.label} className="weper-shell-group">
              {expanded && <p className="weper-shell-group-label">{group.label}</p>}
              <List disablePadding>
                {group.items.map((item) => (
                  <Tooltip key={item.key} title={expanded ? '' : item.title} placement="right">
                    <ListItemButton
                      className="weper-nav-item"
                      component={Link}
                      to={item.to}
                      aria-label={item.title}
                      aria-current={item.selected ? 'page' : undefined}
                      selected={item.selected}
                      onClick={handleNavigate}
                    >
                      <ListItemIcon className="weper-nav-icon">{item.icon}</ListItemIcon>
                      {expanded && (
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: item.selected ? 600 : 400,
                          }}
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

      {expanded && (
        <Box className="weper-shell-account">
          <Typography className="weper-shell-account-name">{accountName || 'Minha conta'}</Typography>
          {accountHint && <Typography className="weper-shell-account-hint">{accountHint}</Typography>}
        </Box>
      )}
    </Box>
  );

  return (
    <Box className="weper-workspace weper-shell">
      <a className="weper-skip-link" href="#workspace-main">Ir para o conteúdo</a>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? 0 : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? 264 : drawerWidth,
            boxSizing: 'border-box',
            borderRadius: 0,
            overflowX: 'hidden',
            transition: 'width 180ms ease',
          },
        }}
      >
        {navigation}
      </Drawer>

      <Box className="weper-shell-column">
        <Box component="header" className="weper-shell-header">
          <Toolbar className="weper-shell-toolbar">
            {isMobile && (
              <IconButton aria-label="Abrir menu" aria-expanded={mobileOpen} onClick={toggleDrawer}>
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
