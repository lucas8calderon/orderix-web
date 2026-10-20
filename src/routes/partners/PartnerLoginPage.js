import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ROLES, PATHS, canAccessRoute } from '../../services/accessControl';
import { getCurrentUser, isAuthenticated } from '../../services/session';
import { getApiErrorMessage, loginPartner } from '../../services/partnerService';
import { formatPhoneInput, isValidBrazilianPhone } from '../../utils/phoneInput';
import PartnerAuthLayout from './PartnerAuthLayout';
import PartnerPasswordField from './PartnerPasswordField';
import PartnerRegisterDialog from './PartnerRegisterDialog';

export default function PartnerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(Boolean(location.state?.openRegister));

  useEffect(() => {
    const previous = document.title;
    document.title = 'Área de Parceiros | Weper';
    return () => { document.title = previous; };
  }, []);

  const current = getCurrentUser();
  if (isAuthenticated() && current?.role === ROLES.PARTNER) {
    return <Navigate to={PATHS.PARTNERS_DASHBOARD} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = {};
    if (!isValidBrazilianPhone(whatsapp)) nextErrors.whatsapp = 'Informe seu WhatsApp com DDD.';
    if (!password) nextErrors.password = 'Digite sua senha.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setLoginError('');
    setNotice('');
    try {
      const user = await loginPartner(whatsapp, password);
      const from = location.state?.from?.pathname;
      navigate(from && canAccessRoute(user, from) ? from : PATHS.PARTNERS_DASHBOARD, { replace: true });
    } catch (error) {
      setLoginError(getApiErrorMessage(error, 'WhatsApp ou senha inválidos. Confira os dados e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegistered = (_result, form) => {
    setRegisterOpen(false);
    if (form?.whatsapp) setWhatsapp(formatPhoneInput(form.whatsapp));
    setPassword('');
    setNotice('Cadastro realizado! Entre com seu WhatsApp e a senha criada.');
  };

  return (
    <PartnerAuthLayout
      title="Área de Parceiros"
      subtitle="Acesse com seu WhatsApp para acompanhar indicações, comissões e pagamentos."
      footer="Weper Solutions"
    >
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      {loginError && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{loginError}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            id="partner-login-whatsapp"
            label="WhatsApp"
            value={whatsapp}
            onChange={(event) => {
              setWhatsapp(formatPhoneInput(event.target.value));
              if (errors.whatsapp) setErrors((c) => ({ ...c, whatsapp: undefined }));
            }}
            error={Boolean(errors.whatsapp)}
            helperText={errors.whatsapp}
            placeholder="(11) 99999-9999"
            autoComplete="username"
            inputProps={{ inputMode: 'tel' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WhatsAppIcon sx={{ color: 'var(--color-text-muted)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
          <PartnerPasswordField
            id="partner-login-password"
            label="Senha"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (errors.password) setErrors((c) => ({ ...c, password: undefined }));
            }}
            error={Boolean(errors.password)}
            helperText={errors.password}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginRoundedIcon />}
            sx={{
              minHeight: 48,
              bgcolor: 'var(--color-primary)',
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </Stack>
      </Box>

      <div className="partner-auth-links">
        <Link to={PATHS.PARTNERS_RECOVERY}>Esqueci minha senha</Link>
        <button type="button" className="partner-link-button" onClick={() => setRegisterOpen(true)}>
          Quero ser parceiro
        </button>
      </div>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
        É lojista? <Link to={PATHS.LOGIN} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Acesse o painel da loja</Link>
      </Typography>

      <PartnerRegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegistered={handleRegistered}
      />
    </PartnerAuthLayout>
  );
}
