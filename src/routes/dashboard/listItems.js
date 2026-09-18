import * as React from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SoupKitchenOutlinedIcon from '@mui/icons-material/SoupKitchenOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { PATHS, ROLES } from '../../services/accessControl';

export const dashboardItems = [
  {
    title: 'Dashboard',
    slug: 'dashboard',
    path: PATHS.APP_DASHBOARD,
    icon: <DashboardOutlinedIcon />,
    roles: [ROLES.ADMIN, ROLES.STORE_ADMIN],
  },
  {
    title: 'Atendimento',
    slug: 'atendimento',
    path: PATHS.APP_ATENDIMENTO,
    icon: <TableRestaurantOutlinedIcon />,
    roles: [ROLES.ADMIN, ROLES.STORE_ADMIN, ROLES.CASHIER],
  },
  {
    title: 'Cozinha',
    slug: 'cozinha',
    path: PATHS.APP_COZINHA,
    icon: <SoupKitchenOutlinedIcon />,
    roles: [ROLES.ADMIN, ROLES.STORE_ADMIN, ROLES.KITCHEN],
  },
  {
    title: 'Catálogo',
    slug: 'produtos',
    path: PATHS.APP_PRODUTOS,
    icon: <MenuBookOutlinedIcon />,
    roles: [ROLES.ADMIN, ROLES.STORE_ADMIN],
  },
  {
    title: 'Colaboradores',
    slug: 'colaboradores',
    path: PATHS.APP_COLABORADORES,
    icon: <BadgeOutlinedIcon />,
    roles: [ROLES.ADMIN, ROLES.STORE_ADMIN],
  },
  {
    title: 'Garçom',
    slug: 'garcom',
    path: PATHS.APP_GARCOM,
    icon: <RoomServiceOutlinedIcon />,
    roles: [ROLES.WAITER],
  },
  {
    title: 'Configurações',
    slug: 'configuracoes',
    path: PATHS.APP_CONFIGURACOES,
    icon: <SettingsOutlinedIcon />,
    roles: [ROLES.ADMIN, ROLES.STORE_ADMIN],
  },
];
