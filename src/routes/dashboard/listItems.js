import * as React from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SoupKitchenOutlinedIcon from '@mui/icons-material/SoupKitchenOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export const dashboardItems = [
  {
    title: 'Dashboard',
    icon: <DashboardOutlinedIcon />,
    roles: ['ADMIN', 'STORE_ADMIN'],
  },
  {
    title: 'Atendimento',
    icon: <TableRestaurantOutlinedIcon />,
    roles: ['ADMIN', 'STORE_ADMIN', 'CASHIER', 'WAITER'],
  },
  {
    title: 'Cozinha',
    icon: <SoupKitchenOutlinedIcon />,
    roles: ['ADMIN', 'STORE_ADMIN', 'KITCHEN'],
  },
  {
    title: 'Catálogo',
    icon: <MenuBookOutlinedIcon />,
    roles: ['ADMIN', 'STORE_ADMIN'],
  },
  {
    title: 'Inventário',
    icon: <Inventory2OutlinedIcon />,
    roles: ['ADMIN', 'STORE_ADMIN'],
  },
  {
    title: 'Colaboradores',
    icon: <BadgeOutlinedIcon />,
    roles: ['ADMIN', 'STORE_ADMIN'],
  },
  {
    title: 'Configurações',
    icon: <SettingsOutlinedIcon />,
    adminOnly: true,
    roles: ['ADMIN', 'STORE_ADMIN'],
  },
];
