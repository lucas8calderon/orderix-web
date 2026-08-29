import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Navigate } from 'react-router-dom';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';
import { getPostLoginPath } from '../../services/accessControl';
import { getCurrentUser, isAuthenticated } from '../../services/session';
import weperLogo from '../../assets/images/weper-logo.png';
import * as LoginConstants from './loginConstants';
import LoginForm from './LoginForm';
import LoginAside from './LoginAside';
import './Login.css';

function LoginBrand() {
  return (
    <Box sx={{ mb: { xs: 3, sm: 3.5 } }}>
      <Box
        component="img"
        src={weperLogo}
        alt="Weper"
        sx={{
          display: 'block',
          width: { xs: 148, sm: 168 },
          height: 'auto',
          mb: 1.5,
        }}
      />
      <Typography
        variant="body1"
        sx={{
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          lineHeight: 1.45,
          maxWidth: 340,
          fontSize: { xs: '0.95rem', sm: '1rem' },
        }}
      >
        {LoginConstants.TAGLINE_TEXT}
      </Typography>
      <Box
        sx={{
          width: 40,
          height: 3,
          borderRadius: 999,
          bgcolor: 'var(--color-primary)',
          mt: 2,
          mb: 0.5,
        }}
      />
    </Box>
  );
}

function LoginHeader() {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
          mb: 0.75,
        }}
      >
        {LoginConstants.WELCOME_TEXT}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
      >
        {LoginConstants.CREDENTIALS_TEXT}
      </Typography>
    </Box>
  );
}

function LoginPanel() {
  return (
    <Box
      className="login-panel"
      sx={{
        flex: { xs: '1 1 auto', md: '1 1 48%' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        px: { xs: 3, sm: 5, md: 5.5, lg: 7 },
        py: { xs: 4, sm: 5, md: 5 },
        borderRadius: { xs: '20px', md: '20px 0 0 20px' },
        position: 'relative',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
        }}
      >
        <ThemeToggleButton className="header-theme-toggle" />
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 'auto',
          my: 'auto',
        }}
      >
        <LoginBrand />
        <LoginHeader />
        <LoginForm />
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          mt: { xs: 3, md: 4 },
          pt: 1,
        }}
      >
        {LoginConstants.FOOTER_TEXT}
      </Typography>
    </Box>
  );
}

function Login() {
  const user = getCurrentUser();

  if (isAuthenticated() && user) {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }

  return (
    <Box
      className="login-page"
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--color-bg)',
        px: { xs: 1.5, sm: 2.5, md: 3 },
        py: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <Box
        className="login-shell"
        sx={{
          width: '100%',
          maxWidth: 1480,
          minHeight: { xs: 'auto', md: 'min(860px, calc(100vh - 48px))' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: 'var(--color-surface)',
          boxShadow: {
            xs: '0 8px 32px rgba(15, 23, 42, 0.08)',
            md: '0 16px 48px rgba(15, 23, 42, 0.12)',
          },
          border: '1px solid var(--color-border)',
          'html[data-theme="dark"] &': {
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
          },
        }}
      >
        <LoginPanel />
        <LoginAside />
      </Box>
    </Box>
  );
}

export default Login;
