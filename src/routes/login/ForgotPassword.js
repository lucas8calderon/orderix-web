import { useMemo, useState } from 'react';
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { PATHS } from '../../services/accessControl';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [requested, setRequested] = useState(false);
  const [done, setDone] = useState(false);

  async function requestLink(event) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      await axios.post('/api/auth/password/forgot', { email: email.trim() }, { timeout: 60000 });
      setRequested(true);
    } catch (requestError) {
      const timedOut = requestError?.code === 'ECONNABORTED' || !requestError?.response;
      setError(timedOut
        ? 'O servidor demorou para responder. Aguarde um instante e tente de novo.'
        : 'Não foi possível enviar o link agora.');
    } finally {
      setPending(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setError('');
    if (password.trim().length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('A confirmação da senha não confere.');
      return;
    }
    setPending(true);
    try {
      await axios.post('/api/auth/password/reset', {
        token,
        password: password.trim(),
      }, { timeout: 60000 });
      setDone(true);
    } catch (requestError) {
      const timedOut = requestError?.code === 'ECONNABORTED' || !requestError?.response;
      setError(timedOut
        ? 'O servidor demorou para responder. Aguarde um instante e tente de novo.'
        : (requestError?.response?.data?.message || 'Não foi possível redefinir a senha.'));
    } finally {
      setPending(false);
    }
  }

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
        {token ? (
          done ? (
            <>
              <Typography variant="body1" sx={{ mb: 3 }}>Senha redefinida. Entre com a nova senha.</Typography>
              <Button component={RouterLink} to={PATHS.LOGIN} variant="contained" sx={buttonSx}>Ir para o login</Button>
            </>
          ) : (
            <Box component="form" onSubmit={resetPassword}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                O link vale uma vez e expira em 24 horas.
              </Typography>
              <TextField fullWidth type="password" label="Nova senha" value={password} onChange={(event) => setPassword(event.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth type="password" label="Confirmar senha" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} sx={{ mb: 2 }} />
              {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
              <Button type="submit" variant="contained" disabled={pending} sx={buttonSx}>
                {pending ? 'Salvando' : 'Redefinir senha'}
              </Button>
            </Box>
          )
        ) : requested ? (
          <>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Se houver uma conta com este e-mail, enviaremos um link válido por 24 horas.
            </Typography>
            <Button component={RouterLink} to={PATHS.LOGIN} variant="contained" sx={buttonSx}>Voltar ao login</Button>
          </>
        ) : (
          <Box component="form" onSubmit={requestLink}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Informe o e-mail do acesso. O link não mostra se a conta existe e não envia a senha.
            </Typography>
            <TextField fullWidth type="email" label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} required sx={{ mb: 2 }} />
            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
            <Button type="submit" variant="contained" disabled={pending} sx={buttonSx}>
              {pending ? 'Enviando' : 'Enviar link'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

const buttonSx = {
  backgroundColor: 'var(--color-primary)',
  '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
  textTransform: 'none',
};
