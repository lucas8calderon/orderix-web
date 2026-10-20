import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useDialogResponsiveProps } from '../../commons/hooks/useResponsive';
import { PATHS } from '../../services/accessControl';
import {
  PARTNER_PASSWORD_HINT,
  getApiErrorMessage,
  isValidPartnerPassword,
  registerPartner,
} from '../../services/partnerService';
import { formatPhoneInput, isValidBrazilianPhone } from '../../utils/phoneInput';
import { PartnerPasswordField } from './PartnerPasswordField';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  whatsapp: '',
  password: '',
  confirmPassword: '',
  accept: false,
};

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'Informe seu nome.';
  if (!form.lastName.trim()) errors.lastName = 'Informe seu sobrenome.';
  if (!isValidBrazilianPhone(form.whatsapp)) errors.whatsapp = 'Informe um WhatsApp com DDD.';
  if (!isValidPartnerPassword(form.password)) errors.password = PARTNER_PASSWORD_HINT;
  if (!form.confirmPassword || form.password !== form.confirmPassword) {
    errors.confirmPassword = 'A confirmação de senha não confere.';
  }
  if (!form.accept) errors.accept = 'Para continuar, aceite os termos e a política de privacidade.';
  return errors;
}

/**
 * Cadastro de parceiro em modal.
 * `onRegistered(result, form)` é chamado quando a pessoa segue para o login.
 */
export default function PartnerRegisterDialog({ open, onClose, onRegistered }) {
  const dialogProps = useDialogResponsiveProps();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitError('');
      setResult(null);
      setLoading(false);
    }
  }, [open]);

  const setField = (field) => (event) => {
    const value = field === 'accept' ? event.target.checked : event.target.value;
    setForm((current) => ({
      ...current,
      [field]: field === 'whatsapp' ? formatPhoneInput(value) : value,
    }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setSubmitError('');
    try {
      const response = await registerPartner({
        ...form,
        acceptTerms: form.accept,
        acceptPrivacy: form.accept,
      });
      setResult(response || {});
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Não foi possível concluir o cadastro. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => onRegistered?.(result, form);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      aria-labelledby="partner-register-title"
      {...dialogProps}
    >
      <DialogTitle id="partner-register-title">
        {result ? 'Cadastro realizado' : 'Seja parceiro Weper'}
      </DialogTitle>

      {result ? (
        <>
          <DialogContent>
            <Alert severity="success" sx={{ mb: 2 }}>
              {result.message || 'Cadastro realizado com sucesso.'}
            </Alert>
            {result.nextStep && (
              <Typography variant="body2" color="text.secondary">{result.nextStep}</Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="contained" onClick={goToLogin}>Ir para o login</Button>
          </DialogActions>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Crie seu acesso para indicar estabelecimentos e acompanhar suas indicações.
            </Typography>
            {submitError && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{submitError}</Alert>}

            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Nome"
                  value={form.firstName}
                  onChange={setField('firstName')}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                  autoComplete="given-name"
                  required
                  fullWidth
                />
                <TextField
                  label="Sobrenome"
                  value={form.lastName}
                  onChange={setField('lastName')}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                  autoComplete="family-name"
                  required
                  fullWidth
                />
              </Stack>
              <TextField
                label="WhatsApp"
                value={form.whatsapp}
                onChange={setField('whatsapp')}
                error={Boolean(errors.whatsapp)}
                helperText={errors.whatsapp || 'Será o seu usuário de acesso.'}
                placeholder="(11) 99999-9999"
                autoComplete="tel-national"
                inputProps={{ inputMode: 'tel' }}
                required
                fullWidth
              />
              <PartnerPasswordField
                label="Senha"
                value={form.password}
                onChange={setField('password')}
                error={Boolean(errors.password)}
                helperText={errors.password || PARTNER_PASSWORD_HINT}
                autoComplete="new-password"
                required
              />
              <PartnerPasswordField
                label="Confirmar senha"
                value={form.confirmPassword}
                onChange={setField('confirmPassword')}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                autoComplete="new-password"
                required
              />

              <Box>
                <FormControlLabel
                  control={<Checkbox checked={form.accept} onChange={setField('accept')} />}
                  label={(
                    <Typography variant="body2">
                      Li e aceito os{' '}
                      <Link to={PATHS.TERMS} target="_blank" rel="noopener noreferrer">Termos de uso</Link>
                      {' '}e a{' '}
                      <Link to={PATHS.PRIVACY} target="_blank" rel="noopener noreferrer">Política de privacidade</Link>
                      {' '}da Weper.
                    </Typography>
                  )}
                  sx={{ alignItems: 'flex-start', m: 0, '& .MuiCheckbox-root': { pt: 0.5 } }}
                />
                {errors.accept && <FormHelperText error>{errors.accept}</FormHelperText>}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, ml: 4.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Termos específicos do Programa de Parceiros
                  </Typography>
                  <Chip size="small" label="Em breve" variant="outlined" />
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Button onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {loading ? 'Cadastrando…' : 'Criar meu acesso'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
}
