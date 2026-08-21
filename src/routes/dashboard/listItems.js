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
    icon: <DashboardOutlinedIcon />
  },
  {
    title: 'Colaboradores',
    icon: <BadgeOutlinedIcon />
  },
  {
    title: 'Catálogo',
    icon: <MenuBookOutlinedIcon />
  },
  {
    title: 'Inventário',
    icon: <Inventory2OutlinedIcon />
  },
  {
    title: 'Atendimento',
    icon: <TableRestaurantOutlinedIcon />
  },
  {
    title: 'Cozinha',
    icon: <SoupKitchenOutlinedIcon />
  },
  {
    title: 'Configurações',
    icon: <SettingsOutlinedIcon />,
    adminOnly: true
  },
];
