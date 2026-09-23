import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { RowActions } from '../../../../commons/components/RowActions';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import KitchenIcon from '@mui/icons-material/Kitchen';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { AvatarWithInitials } from './AvatarWithInitials';

export function CardEmployee({ employee, onEdit, onDelete }) {
  const getProfileLabel = (profile) => {
    if (profile === 'GARCOM' || profile === 'WAITER') return 'Garçom';
    if (profile === 'ADMIN' || profile === 'STORE_ADMIN') return 'Administrador';
    if (profile === 'COZINHA' || profile === 'KITCHEN') return 'Cozinha';
    if (profile === 'CAIXA' || profile === 'CASHIER') return 'Caixa';
    return profile;
  };

  const getProfileIcon = (profile) => {
    if (profile === 'GARCOM' || profile === 'WAITER') return <RestaurantIcon sx={{ fontSize: 16 }} />;
    if (profile === 'ADMIN' || profile === 'STORE_ADMIN') return <LocalAtmIcon sx={{ fontSize: 16 }} />;
    if (profile === 'COZINHA' || profile === 'KITCHEN') return <KitchenIcon sx={{ fontSize: 16 }} />;
    if (profile === 'CAIXA' || profile === 'CASHIER') return <LocalAtmIcon sx={{ fontSize: 16 }} />;
    return null;
  };


  return (
    <Card className="employee-card">
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <AvatarWithInitials name={employee.name} size={56} />
<RowActions name={employee.name} onEdit={() => onEdit(employee)} onDelete={() => onDelete(employee)} />
        </Box>

        <Typography className="employee-name" sx={{ wordBreak: 'break-word' }}>
          {employee.name}
        </Typography>

        <Typography className="employee-info" sx={{ wordBreak: 'break-word' }}>
          {employee.email}
        </Typography>

        {employee.phone ? (
          <Typography className="employee-info">
            {employee.phone}
          </Typography>
        ) : null}

        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={getProfileIcon(employee.profile)}
            label={getProfileLabel(employee.profile)}
            size="small"
            sx={{ 
              fontWeight: 600,
              borderRadius: '6px',
              color: 'var(--status-neutral-text)',
              bgcolor: 'var(--status-neutral-bg)',
              '& .MuiChip-icon': {
                color: 'inherit',
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

