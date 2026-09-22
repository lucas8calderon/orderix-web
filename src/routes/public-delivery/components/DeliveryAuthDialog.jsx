import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { formatPhoneInput, isValidBrazilianPhone, phoneDigits } from '../../../utils/phoneInput';
import {
  loginDeliveryCustomer,
  registerDeliveryCustomer,
} from '../../../services/deliveryCustomerService';
import { saveDeliveryCustomerSession } from '../../../services/deliveryCustomerSession';

export default function DeliveryAuthDialog({ open, onClose, onAuthenticated }) {
  const [tab, setTab] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setError('');
      setPassword('');
    }
  }, [open]);

  const submit = async () => {
    setError('');
    if (tab === 1) {
      if (!name.trim()) {
        setError('Informe o nome.');
        return;
      }
      if (!isValidBrazilianPhone(phone)) {
        setError('Informe um telefone válido.');
        return;
      }
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!password || password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    try {
      const response = tab === 0
        ? await loginDeliveryCustomer({ email: email.trim(), password })
        : await registerDeliveryCustomer({
          name: name.trim(),
          email: email.trim(),
          phone: phoneDigits(phone),
          password,
        });
      saveDeliveryCustomerSession(response.data);
      onAuthenticated?.(response.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível entrar. Confira os dados.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Sua conta no delivery</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => { setTab(value); setError(''); }} sx={{ mb: 2 }}>
          <Tab label="Entrar" />
          <Tab label="Criar conta" />
        </Tabs>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {tab === 1 ? (
          <>
            <TextField
              fullWidth
              label="Nome"
              sx={{ mb: 1.5 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Telefone"
              sx={{ mb: 1.5 }}
              value={phone}
              placeholder="(11) 98888-8888"
              inputProps={{ inputMode: 'tel', maxLength: 15 }}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            />
          </>
        ) : null}
        <TextField
          fullWidth
          label="E-mail"
          type="email"
          sx={{ mb: 1.5 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={submitting} onClick={submit}>
          {submitting ? 'Aguarde...' : tab === 0 ? 'Entrar' : 'Criar conta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
