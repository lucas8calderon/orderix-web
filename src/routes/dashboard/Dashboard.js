import * as React from 'react';
import { Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Typography, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { dashboardItems } from './listItems';
import { DashboardGerencial } from './dashboard-gerencial/DashboardGerencial';
import { Menu } from './menu/Menu';
import { Atendimento } from './atendimento/Atendimento';
import { Kitchen } from './kitchen/Kitchen';
import { Employees } from './employees/Employees';
import { WaiterHome } from './WaiterHome';
import { Settings } from './settings/Settings';
import { getCurrentUser, logout } from '../../services/authService';
import { getPostLoginPath, getVisibleDashboardItems, PATHS } from '../../services/accessControl';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';
import weperLogo from '../../assets/images/weper-logo.png';
import './Workspace.css';

const GROUPS = [
  { label: 'Visão geral', slugs: ['dashboard'] },
  { label: 'Operação', slugs: ['atendimento', 'cozinha', 'garcom'] },
  { label: 'Gestão', slugs: ['produtos', 'colaboradores'] },
  { label: 'Sistema', slugs: ['configuracoes'] },
];

export default function Dashboard() {
  const user = getCurrentUser();
  const visibleItems = getVisibleDashboardItems(user, dashboardItems);
  const navigate = useNavigate();
  const { section } = useParams();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [navIntent, setNavIntent] = React.useState(null);
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const expanded = isMobile || desktopOpen;
  const drawerWidth = desktopOpen ? 240 : 72;
  const selectedItem = visibleItems.find(item => item.slug === section);

  const goToScreen = (title, intent) => {
    const item = visibleItems.find(entry => entry.title === title);
    if (!item) return;
    setNavIntent(intent || null);
    navigate(item.path);
    setMobileOpen(false);
  };
  const toggleDrawer = () => isMobile ? setMobileOpen(open => !open) : setDesktopOpen(open => !open);
  const handleLogout = () => { logout(); navigate(PATHS.LOGIN); };
  const screens = {
    dashboard: <DashboardGerencial onNavigate={goToScreen} />,
    colaboradores: <Employees />, produtos: <Menu />, atendimento: <Atendimento />,
    cozinha: <Kitchen initialFilter={navIntent?.kitchenFilter} />,
    garcom: <WaiterHome user={user} />, configuracoes: <Settings />,
  };
  if (!selectedItem) return <Navigate to={getPostLoginPath(user)} replace />;

  const navigation = <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Toolbar sx={{ minHeight: '72px !important', px: '16px !important', gap: 1 }}>
      {expanded && <Box sx={{ flex: 1 }}><Box component="img" src={weperLogo} alt="Weper" sx={{ width: 100, display: 'block' }} /></Box>}
      <IconButton aria-label={expanded ? 'Recolher menu' : 'Expandir menu'} onClick={toggleDrawer} sx={{ color: 'var(--color-sidebar-text)' }}>{expanded ? <ChevronLeftIcon /> : <MenuIcon />}</IconButton>
    </Toolbar>
    <Box component="nav" aria-label="Navegação principal" sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}>
      {GROUPS.map(group => {
        const items = visibleItems.filter(item => group.slugs.includes(item.slug));
        if (!items.length) return null;
        return <Box key={group.label} sx={{ mb: 2 }}>
          {expanded && <Typography component="p" sx={{ px: 1.5, py: 1, fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-sidebar-text)' }}>{group.label}</Typography>}
          <List disablePadding>{items.map(item => <Tooltip key={item.slug} title={expanded ? '' : item.title} placement="right">
            <ListItemButton component={Link} to={item.path} aria-label={item.title} aria-current={item.slug === section ? 'page' : undefined} selected={item.slug === section} onClick={() => { setNavIntent(null); setMobileOpen(false); }} sx={{ minHeight: 44, px: 1.5, mb: .5, borderRadius: '8px', color: 'var(--color-sidebar-text)', '&.Mui-selected': { color: 'var(--color-sidebar-brand)', bgcolor: 'var(--color-sidebar-selected)' }, '&:hover': { bgcolor: 'var(--color-sidebar-hover)' } }}>
              <ListItemIcon sx={{ minWidth: expanded ? 34 : 24, color: 'inherit', '& svg': { fontSize: 20 } }}>{item.icon}</ListItemIcon>
              {expanded && <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: 14, fontWeight: item.slug === section ? 600 : 400 }} />}
            </ListItemButton>
          </Tooltip>)}</List>
        </Box>;
      })}
    </Box>
    {expanded && <Box sx={{ m: 2, pt: 2, borderTop: '1px solid rgba(148,163,184,.18)' }}><Typography sx={{ fontSize: 13, color: '#E2E8F0', overflowWrap: 'anywhere' }}>{user?.name || 'Minha conta'}</Typography><Typography sx={{ fontSize: 12, color: 'var(--color-sidebar-text)', mt: .5 }}>Weper · Gestão do estabelecimento</Typography></Box>}
  </Box>;

  return <Box className="weper-workspace" sx={{ display: 'flex', minHeight: '100dvh' }}>
    <a className="weper-skip-link" href="#workspace-main">Ir para o conteúdo</a>
    <Drawer variant={isMobile ? 'temporary' : 'permanent'} open={isMobile ? mobileOpen : true} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ width: isMobile ? 0 : drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: isMobile ? 264 : drawerWidth, boxSizing: 'border-box', borderRadius: 0 } }}>{navigation}</Drawer>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <Toolbar sx={{ gap: 1, minHeight: '64px !important', px: { xs: '16px !important', md: '32px !important' } }}>
          {isMobile && <IconButton aria-label="Abrir menu" aria-expanded={mobileOpen} onClick={toggleDrawer}><MenuIcon /></IconButton>}
          <Box sx={{ flex: 1, minWidth: 0 }}><Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>{user?.storeName || 'Weper'}</Typography><Typography noWrap sx={{ color: 'text.secondary', fontSize: 12 }}>{selectedItem.title}</Typography></Box>
          <ThemeToggleButton className="header-theme-toggle" />
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutOutlinedIcon sx={{ fontSize: 18 }} />}>Sair</Button>
        </Toolbar>
      </Box>
      <Box component="main" id="workspace-main" tabIndex={-1} sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1600, mx: 'auto', minWidth: 0 }}>{screens[selectedItem.slug]}</Box>
    </Box>
  </Box>;
}
