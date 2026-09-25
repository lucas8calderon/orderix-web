import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import signIn, { resolveHomePath } from '../../services/authService.js';
import { canAccessRoute, PATHS } from '../../services/accessControl';
import * as LoginConstants from './loginConstants';

function GoogleGlyph() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: 18, height: 18, mr: 1 }}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </Box>
  );
}

function readRememberedEmail() {
  try {
    return window.localStorage.getItem(LoginConstants.REMEMBER_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

function persistRememberedEmail(email, remember) {
  try {
    if (remember && email) {
      window.localStorage.setItem(LoginConstants.REMEMBER_EMAIL_KEY, email);
    } else {
      window.localStorage.removeItem(LoginConstants.REMEMBER_EMAIL_KEY);
    }
  } catch {
    // ignore quota / privacy mode
  }
}

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const remembered = readRememberedEmail();
  const [userEmail, setUserEmail] = useState(remembered);
  const [userPassword, setUserPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(Boolean(remembered));
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordHelperText, setPasswordHelperText] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginErrorText, setLoginErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = readRememberedEmail();
    if (stored) {
      setUserEmail(stored);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    let hasError = false;

    if (!userEmail) {
      setEmailError(true);
      setEmailHelperText('Digite seu e-mail');
      hasError = true;
    } else {
      setEmailError(false);
      setEmailHelperText('');
    }

    if (!userPassword) {
      setPasswordError(true);
      setPasswordHelperText('Digite sua senha');
      hasError = true;
    } else {
      setPasswordError(false);
      setPasswordHelperText('');
    }

    if (hasError || loading) {
      return;
    }

    setLoading(true);
    setLoginError(false);
    setLoginErrorText('');

    signIn(userEmail, userPassword)
      .then((user) => {
        persistRememberedEmail(userEmail, rememberMe);
        setLoginError(false);
        const from = location.state?.from?.pathname;
        if (from && canAccessRoute(user, from)) {
          navigate(from, { replace: true });
        } else {
          navigate(resolveHomePath(user), { replace: true });
        }
      })
      .catch((error) => {
        const apiMessage = error?.response?.data?.message;
        setLoginErrorText(
          typeof apiMessage === 'string' && apiMessage.trim()
            ? apiMessage.trim()
            : LoginConstants.LOGIN_ERROR_TEXT,
        );
        setLoginError(true);
        console.error('Error signing in:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: 'var(--color-input-bg)',
      '& fieldset': {
        borderColor: 'var(--color-border)',
      },
      '&:hover fieldset': {
        borderColor: 'var(--color-primary)',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'var(--color-text-secondary)',
    },
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ width: '100%', maxWidth: 420 }}
    >
      {loginError && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            mb: 2.5,
            borderRadius: 2,
            bgcolor: 'rgba(185, 28, 28, 0.06)',
            borderColor: 'var(--color-error)',
            color: 'var(--color-text-primary)',
            '& .MuiAlert-icon': { color: 'var(--color-error)' },
            'html[data-theme="dark"] &': {
              bgcolor: 'rgba(248, 113, 113, 0.1)',
            },
          }}
        >
          {loginErrorText || LoginConstants.LOGIN_ERROR_TEXT}{' '}
          <Link
            to={PATHS.FORGOT_PASSWORD}
            style={{ color: 'var(--color-primary)', fontWeight: 600 }}
          >
            {LoginConstants.FORGOT_PASSWORD_TEXT}
          </Link>
        </Alert>
      )}

      <TextField
        id="login-email"
        name="email"
        label={LoginConstants.EMAIL_LABEL}
        placeholder={LoginConstants.EMAIL_PLACEHOLDER}
        type="email"
        autoComplete="email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        error={emailError}
        helperText={emailHelperText}
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlinedIcon sx={{ color: 'var(--color-text-muted)', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{ ...fieldSx, mt: 0 }}
      />

      <TextField
        id="login-password"
        name="password"
        label={LoginConstants.PASSWORD_LABEL}
        placeholder={LoginConstants.PASSWORD_PLACEHOLDER}
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={userPassword}
        onChange={(e) => setUserPassword(e.target.value)}
        error={passwordError}
        helperText={passwordHelperText}
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon sx={{ color: 'var(--color-text-muted)', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
                size="small"
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 0.5, mb: 2.5, flexWrap: 'wrap', gap: 1 }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => {
                const checked = e.target.checked;
                setRememberMe(checked);
                if (!checked) {
                  persistRememberedEmail('', false);
                }
              }}
              size="small"
              sx={{ color: 'var(--color-text-muted)' }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              {LoginConstants.REMEMBER_ME_TEXT}
            </Typography>
          }
          sx={{ mr: 0 }}
        />
        <Typography
          component={Link}
          to={PATHS.FORGOT_PASSWORD}
          variant="body2"
          sx={{
            color: 'var(--color-primary)',
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {LoginConstants.FORGOT_PASSWORD_TEXT}
        </Typography>
      </Stack>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <LoginRoundedIcon />
          )
        }
        sx={{
          minHeight: 48,
          borderRadius: 2,
          fontWeight: 700,
          fontSize: '0.95rem',
          textTransform: 'none',
          bgcolor: 'var(--color-primary)',
          boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
          '&:hover': {
            bgcolor: 'var(--color-primary-dark)',
            boxShadow: '0 10px 24px rgba(37, 99, 235, 0.34)',
          },
        }}
      >
        {LoginConstants.LOGIN_BUTTON_TEXT}
      </Button>

      <Divider
        sx={{
          my: 3,
          color: 'var(--color-text-muted)',
          '&::before, &::after': { borderColor: 'var(--color-border)' },
          fontSize: '0.8rem',
        }}
      >
        {LoginConstants.DIVIDER_TEXT}
      </Divider>

      {/* Google OAuth ainda não integrado — botão somente visual (GOOGLE_OAUTH_ENABLED). */}
      <Button
        type="button"
        variant="outlined"
        fullWidth
        disabled={!LoginConstants.GOOGLE_OAUTH_ENABLED}
        aria-disabled={!LoginConstants.GOOGLE_OAUTH_ENABLED}
        title={
          LoginConstants.GOOGLE_OAUTH_ENABLED
            ? LoginConstants.GOOGLE_BUTTON_TEXT
            : 'Login com Google em breve'
        }
        startIcon={<GoogleGlyph />}
        sx={{
          minHeight: 48,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
          bgcolor: 'var(--color-surface)',
          '&.Mui-disabled': {
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            opacity: 1,
            cursor: 'not-allowed',
          },
          '& .MuiButton-startIcon': { mr: 0 },
        }}
      >
        {LoginConstants.GOOGLE_BUTTON_TEXT}
      </Button>

      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        justifyContent="center"
        sx={{ mt: 3, color: 'var(--color-text-muted)' }}
      >
        <ShieldOutlinedIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ color: 'inherit' }}>
          {LoginConstants.SECURITY_TEXT}
        </Typography>
      </Stack>
    </Box>
  );
}
