import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';

export default function SubscriptionBlocked() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0A6847 0%, #0d3d2c 55%, #102018 100%)',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
          Assinatura indisponível
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Entre em contato com o administrador para regularizar sua assinatura.
        </Typography>
        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            backgroundColor: '#0A6847',
            '&:hover': { backgroundColor: '#085538' },
            textTransform: 'none',
            px: 4,
          }}
        >
          Sair
        </Button>
      </Paper>
    </Box>
  );
}
