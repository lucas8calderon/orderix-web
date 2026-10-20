import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { PATHS } from '../../services/accessControl';
import { getApiErrorMessage, requestPartnerRecovery } from '../../services/partnerService';
import { formatPhoneInput, isValidBrazilianPhone } from '../../utils/phoneInput';
import PartnerAuthLayout from './PartnerAuthLayout';

const FALLBACK_CONFIRMATION =
  'Solicitação recebida. Se o WhatsApp estiver cadastrado, a equipe Weper vai validar o pedido e orientar os próximos passos.';

export default function PartnerRecoveryPage() {
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!isValidBrazilianPhone(whatsapp)) {
      setFieldError('Informe seu WhatsApp com DDD.');
      return;
    }
    setFieldError('');
    setError('');
    setLoading(true);
    try {
      const data = await requestPartnerRecovery(whatsapp);
      setConfirmation(typeof data?.message === 'string' && data.message.trim() ? data.message : FALLBACK_CONFIRMATION);
    } catch (failure) {
      setError(getApiErrorMessage(failure, 'Não foi possível enviar a solicitação. Tente novamente em instantes.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PartnerAuthLayout
      title="Recuperar acesso"
      subtitle="Informe o WhatsApp cadastrado. Por segurança, a solicitação é validada pela equipe Weper."
    >
      {confirmation ? (
        <Alert severity="success" sx={{ mb: 2 }}>{confirmation}</Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField
              label="WhatsApp"
              value={whatsapp}
              onChange={(event) => {
                setWhatsapp(formatPhoneInput(event.target.value));
                setFieldError('');
              }}
              error={Boolean(fieldError)}
              helperText={fieldError}
              placeholder="(11) 99999-9999"
              autoComplete="username"
              inputProps={{ inputMode: 'tel' }}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ minHeight: 48 }}
            >
              {loading ? 'Enviando…' : 'Solicitar recuperação'}
            </Button>
          </Stack>
        </Box>
      )}

      <div className="partner-auth-links">
        <Link to={PATHS.PARTNERS_LOGIN}>Voltar ao login</Link>
        <Link to={PATHS.PARTNERS_RESET}>Já tenho um código</Link>
      </div>
    </PartnerAuthLayout>
  );
}
