import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { dashboardItems } from './listItems';
import { DashboardGerencial } from './dashboard-gerencial/DashboardGerencial';
import { Menu } from './menu/Menu';
import { Atendimento } from './atendimento/Atendimento';
import { Kitchen } from './kitchen/Kitchen';
import { Employees } from './employees/Employees';
import { Settings } from './settings/Settings';
import InventoryPanel from './inventory/Inventory';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';
import { getVisibleDashboardItems } from '../../services/accessControl';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Orderix Solutions
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const drawerWidth = 256;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile',
})(({ theme, open, isMobile }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && !isMobile && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DesktopDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

export default function Dashboard() {
    const user = getCurrentUser();
    const visibleItems = getVisibleDashboardItems(user, dashboardItems);
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:900px)');
    const [selectedScreenIndex, setSelectedScreenIndex] = React.useState(0);
    const [navIntent, setNavIntent] = React.useState(null);
    const [desktopOpen, setDesktopOpen] = React.useState(true);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const goToScreen = (title, intent) => {
        const index = visibleItems.findIndex((item) => item.title === title);
        if (index < 0) return;
        setNavIntent(intent || null);
        setSelectedScreenIndex(index);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const screenByTitle = {
        Dashboard: <DashboardGerencial onNavigate={goToScreen} />,
        Colaboradores: <Employees />,
        Catálogo: <Menu />,
        Inventário: <InventoryPanel stockFilter={navIntent?.stockFilter} />,
        Atendimento: <Atendimento />,
        Cozinha: <Kitchen initialFilter={navIntent?.kitchenFilter} />,
        Configurações: <Settings />,
    };
    const screens = visibleItems.map((item) => screenByTitle[item.title]);

    const toggleDrawer = () => {
        if (isMobile) {
            setMobileOpen((prev) => !prev);
            return;
        }
        setDesktopOpen((prev) => !prev);
    };

    const handleSelectScreen = (index) => {
        setNavIntent(null);
        setSelectedScreenIndex(index);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const drawerContent = (
        <>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    minHeight: 72,
                }}
            >
                <Box sx={{ minWidth: 0, display: desktopOpen || isMobile ? 'block' : 'none' }}>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: 'var(--color-sidebar-brand)',
                            lineHeight: 1.2,
                        }}
                    >
                        Orderix
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 12,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--color-sidebar-text)',
                            opacity: 0.8,
                        }}
                    >
                        Gestão
                    </Typography>
                </Box>
                <IconButton onClick={toggleDrawer} aria-label="fechar menu" sx={{ color: 'var(--color-sidebar-text)' }}>
                    <ChevronLeftIcon />
                </IconButton>
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(190, 198, 224, 0.16)' }} />
            <List component="nav" sx={{ px: 0.5, py: 1 }}>
                {visibleItems.map((item, index) => (
                    <ListItemButton
                        onClick={() => handleSelectScreen(index)}
                        key={item.title}
                        selected={selectedScreenIndex === index}
                        sx={{
                            borderRadius: 0,
                            mb: 0.25,
                            color: selectedScreenIndex === index
                                ? 'var(--color-sidebar-brand)'
                                : 'var(--color-sidebar-text)',
                            borderLeft: selectedScreenIndex === index
                                ? '4px solid var(--color-sidebar-brand)'
                                : '4px solid transparent',
                            pl: selectedScreenIndex === index ? 1.25 : 2,
                            '&.Mui-selected': {
                                backgroundColor: 'var(--color-sidebar-selected)',
                                color: 'var(--color-sidebar-brand)',
                                fontWeight: 700,
                                '&:hover': {
                                    backgroundColor: 'var(--color-sidebar-hover)',
                                },
                            },
                            '&:hover': {
                                backgroundColor: 'var(--color-sidebar-hover)',
                                color: 'var(--color-sidebar-brand)',
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 40,
                                color: 'inherit',
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.title}
                            primaryTypographyProps={{
                                noWrap: true,
                                fontWeight: selectedScreenIndex === index ? 700 : 400,
                                color: 'inherit',
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden', bgcolor: 'var(--color-bg)' }}>
            <AppBar position="absolute" open={desktopOpen} isMobile={isMobile} elevation={0} color="transparent">
                <Toolbar
                    sx={{
                        pr: { xs: 1, sm: 3 },
                        pl: { xs: 1, sm: 2 },
                        minHeight: { xs: 56, sm: 64 },
                        gap: 0.5,
                        backgroundColor: 'var(--color-header)',
                        color: 'var(--color-header-text)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid var(--color-border)',
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="abrir menu"
                        onClick={toggleDrawer}
                        sx={{
                            mr: { xs: 0.5, sm: 2 },
                            ...(!isMobile && desktopOpen && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{
                            flexGrow: 1,
                            minWidth: 0,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        {user?.storeName || 'Orderix'}
                    </Typography>
                    <ThemeToggleButton className="header-theme-toggle" size={isMobile ? 'small' : 'medium'} />
                    <Typography
                        variant="body2"
                        sx={{
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        }}
                        onClick={handleLogout}
                    >
                        Sair
                    </Typography>
                    <IconButton color="inherit" size={isMobile ? 'small' : 'medium'}>
                        <Badge badgeContent={4} color="secondary">
                            <NotificationsNoneOutlinedIcon />
                        </Badge>
                    </IconButton>
                </Toolbar>
            </AppBar>
            {isMobile ? (
                <MuiDrawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </MuiDrawer>
            ) : (
                <DesktopDrawer variant="permanent" open={desktopOpen}>
                    {drawerContent}
                </DesktopDrawer>
            )}
            <Box
                component="main"
                sx={{
                    backgroundColor: 'var(--color-bg)',
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
                <Container
                    maxWidth={false}
                    disableGutters={false}
                    sx={{
                        mt: { xs: 2, sm: 3, md: 4 },
                        mb: { xs: 2, sm: 3, md: 4 },
                        px: { xs: 1.5, sm: 3 },
                        maxWidth: '100%',
                    }}
                >
                    <Box sx={{ minWidth: 0, width: '100%' }}>
                        {screens[selectedScreenIndex]}
                    </Box>
                    <Copyright sx={{ pt: 4 }} />
                </Container>
            </Box>
        </Box>
    );
}
