import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import TableBarIcon from '@mui/icons-material/TableBar';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import KitchenIcon from '@mui/icons-material/Kitchen';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';

export const dashboardItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />
  },
  {
    title: 'Colaboradores',
    icon: <PeopleIcon />
  },
  {
    title: 'Catálogo',
    icon: <MenuBookIcon />
  },
  {
    title: 'Inventário',
    icon: <InventoryIcon />
  },
  {
    title: 'Mesas',
    icon: <TableBarIcon />
  },
  {
    title: 'Cozinha',
    icon: <KitchenIcon />
  },
  {
    title: 'Configurações',
    icon: <SettingsIcon />,
    adminOnly: true
  },
];
