import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import KitchenIcon from '@mui/icons-material/Kitchen';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { AvatarWithInitials } from './AvatarWithInitials';

export function CardEmployee({ employee, onEdit, onDelete }) {
  const getProfileLabel = (profile) => {
    if (profile === 'GARCOM') return 'Garçom';
    if (profile === 'COZINHA') return 'Cozinha';
    if (profile === 'CAIXA') return 'Caixa';
    return profile;
  };

  const getProfileIcon = (profile) => {
    if (profile === 'GARCOM') return <RestaurantIcon sx={{ fontSize: 16 }} />;
    if (profile === 'COZINHA') return <KitchenIcon sx={{ fontSize: 16 }} />;
    if (profile === 'CAIXA') return <LocalAtmIcon sx={{ fontSize: 16 }} />;
    return null;
  };

  const getProfileChipClass = (profile) => {
    if (profile === 'GARCOM') return 'profile-chip-garcom';
    if (profile === 'COZINHA') return 'profile-chip-cozinha';
    if (profile === 'CAIXA') return 'profile-chip-caixa';
    return '';
  };

  return (
    <Card className="employee-card">
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <AvatarWithInitials name={employee.name} size={56} />
          <Box className="action-buttons">
            <IconButton 
              className="action-button"
              onClick={() => onEdit(employee)}
              sx={{ 
                color: '#6B7280',
                '&:hover': { 
                  backgroundColor: '#F3F4F6',
                  color: 'var(--color-primary)'
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              className="action-button"
              onClick={() => onDelete(employee)}
              sx={{ 
                color: '#6B7280',
                '&:hover': { 
                  backgroundColor: '#F3F4F6',
                  color: '#DC2626'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography className="employee-name">
          {employee.name}
        </Typography>

        <Typography className="employee-info">
          {employee.email}
        </Typography>

        <Typography className="employee-info">
          {employee.phone}
        </Typography>

        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Chip
            icon={getProfileIcon(employee.profile)}
            label={getProfileLabel(employee.profile)}
            size="small"
            className={getProfileChipClass(employee.profile)}
            sx={{ 
              fontWeight: 600,
              borderRadius: '20px',
              '& .MuiChip-icon': {
                color: 'white',
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

