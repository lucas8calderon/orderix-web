import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { PATHS } from '../../services/accessControl';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';

export default function SubscriptionBlocked() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0B1220 0%, #1E3A8A 55%, #060B14 100%)',
        px: 2,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12, color: '#fff' }}>
        <ThemeToggleButton className="header-theme-toggle" />
      </Box>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          textAlign: 'center',
          bgcolor: 'var(--color-surface)',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'var(--color-text-primary)' }}>
          Assinatura indisponível
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Entre em contato com o administrador para regularizar sua assinatura.
        </Typography>
        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
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
