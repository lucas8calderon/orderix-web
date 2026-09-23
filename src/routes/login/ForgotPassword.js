import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PATHS } from '../../services/accessControl';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';

export default function ForgotPassword() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--color-bg)',
        px: 2,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <ThemeToggleButton className="header-theme-toggle" />
      </Box>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Recuperar senha
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          A recuperação de senha ainda não está disponível neste painel.
          Fale com o administrador da loja ou com o suporte Weper para redefinir o acesso.
        </Typography>
        <Button
          component={RouterLink}
          to={PATHS.LOGIN}
          variant="contained"
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            textTransform: 'none',
          }}
        >
          Voltar ao login
        </Button>
      </Container>
    </Box>
  );
}
