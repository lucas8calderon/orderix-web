import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '../../services/accessControl';
import {
  PARTNER_PASSWORD_HINT,
  getApiErrorMessage,
  isValidPartnerPassword,
  resetPartnerPassword,
} from '../../services/partnerService';
import PartnerAuthLayout from './PartnerAuthLayout';
import PartnerPasswordField from './PartnerPasswordField';

export default function PartnerResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const clear = (field) => setErrors((current) => ({ ...current, [field]: undefined }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const nextErrors = {};
    if (!token.trim()) nextErrors.token = 'Informe o código recebido da equipe Weper.';
    if (!isValidPartnerPassword(newPassword)) nextErrors.newPassword = PARTNER_PASSWORD_HINT;
    if (!confirmPassword || confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'A confirmação de senha não confere.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setError('');
    try {
      await resetPartnerPassword({ token, newPassword, confirmPassword });
      setDone(true);
    } catch (failure) {
      setError(getApiErrorMessage(failure, 'Não foi possível redefinir a senha. O código pode ter expirado.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PartnerAuthLayout
      title="Redefinir senha"
      subtitle="Use o código autorizado pela equipe Weper para criar uma nova senha."
    >
      {done ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>Senha redefinida com sucesso. Agora você já pode entrar.</Alert>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate(PATHS.PARTNERS_LOGIN, { replace: true })}
            sx={{ minHeight: 48 }}
          >
            Ir para o login
          </Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField
              label="Código de redefinição"
              value={token}
              onChange={(event) => {
                setToken(event.target.value);
                clear('token');
              }}
              error={Boolean(errors.token)}
              helperText={errors.token}
              autoComplete="off"
              inputProps={{ autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false }}
              fullWidth
            />
            <PartnerPasswordField
              label="Nova senha"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                clear('newPassword');
              }}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword || PARTNER_PASSWORD_HINT}
              autoComplete="new-password"
            />
            <PartnerPasswordField
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clear('confirmPassword');
              }}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              autoComplete="new-password"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ minHeight: 48 }}
            >
              {loading ? 'Salvando…' : 'Redefinir senha'}
            </Button>
          </Stack>
        </Box>
      )}

      <div className="partner-auth-links">
        <Link to={PATHS.PARTNERS_LOGIN}>Voltar ao login</Link>
        <Link to={PATHS.PARTNERS_RECOVERY}>Solicitar recuperação</Link>
      </div>
    </PartnerAuthLayout>
  );
}
