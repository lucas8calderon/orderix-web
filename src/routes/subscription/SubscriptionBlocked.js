import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../../services/authService';
import { isLimitedSubscription, isStoreAdmin, PATHS, ROLES } from '../../services/accessControl';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';

function limitedLinks(user) {
  if (isStoreAdmin(user)) {
    return [
      { to: PATHS.APP_DASHBOARD, label: 'Consultar a loja' },
      { to: `${PATHS.APP_CONFIGURACOES}/empresa`, label: 'Regularizar a mensalidade' },
      { to: PATHS.APP_ATENDIMENTO, label: 'Concluir pedidos em andamento' },
    ];
  }
  if (user?.role === ROLES.KITCHEN) {
    return [{ to: PATHS.APP_COZINHA, label: 'Consultar e concluir pedidos em andamento' }];
  }
  if (user?.role === ROLES.CASHIER) {
    return [{ to: PATHS.APP_ATENDIMENTO, label: 'Consultar e concluir pedidos em andamento' }];
  }
  if (user?.role === ROLES.WAITER) {
    return [{ to: PATHS.APP_GARCOM, label: 'Consultar e concluir pedidos em andamento' }];
  }
  return [];
}

export default function SubscriptionBlocked() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const limited = isLimitedSubscription(user);
  const links = limited ? limitedLinks(user) : [];

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
          maxWidth: 520,
          width: '100%',
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          textAlign: 'center',
          bgcolor: 'var(--color-surface)',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'var(--color-text-primary)' }}>
          {limited ? 'Assinatura suspensa' : 'Assinatura indisponível'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {limited
            ? 'A partir do 8º dia a operação nova fica suspensa. A loja continua para consulta, regularização e para concluir o que já estava em andamento.'
            : 'Entre em contato com o administrador para regularizar sua assinatura.'}
        </Typography>
        {limited && !isStoreAdmin(user) ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            A regularização da mensalidade fica com o administrador da loja.
          </Typography>
        ) : null}
        <Box sx={{ display: 'grid', gap: 1.5, mb: links.length ? 2 : 0 }}>
          {links.map((link) => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              variant="contained"
              sx={{
                backgroundColor: 'var(--color-primary)',
                '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
                textTransform: 'none',
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
        <Button
          variant="text"
          onClick={handleLogout}
          sx={{ textTransform: 'none', mt: 1 }}
        >
          Sair
        </Button>
      </Paper>
    </Box>
  );
}
