import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { formatCurrency } from '../../../services/accessControl';
import { DEMO_PAYMENT_OPTIONS } from '../demoRepository';

export default function DemoCheckout({
  open,
  onClose,
  checkout,
  setCheckout,
  totals,
  error,
  submitting,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="demo-checkout">
      <DialogTitle>Checkout de demonstração</DialogTitle>
      <DialogContent>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        <TextField
          fullWidth
          label="Nome"
          sx={{ mb: 2, mt: 0.5 }}
          value={checkout.customerName}
          onChange={(event) => setCheckout((prev) => ({ ...prev, customerName: event.target.value }))}
        />
        <FormControl sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Como prefere receber?</Typography>
          <RadioGroup
            row
            value={checkout.fulfillment}
            onChange={(event) => setCheckout((prev) => ({ ...prev, fulfillment: event.target.value }))}
          >
            <FormControlLabel value="PICKUP" control={<Radio />} label="Retirada" />
            <FormControlLabel value="DELIVERY" control={<Radio />} label="Entrega" />
          </RadioGroup>
        </FormControl>
        {checkout.fulfillment === 'DELIVERY' ? (
          <p className="demo-checkout__note">
            Entrega simulada no endereço da loja. Nenhum pedido real é enviado.
          </p>
        ) : (
          <p className="demo-checkout__note">
            Retirada simulada no balcão. Nenhum pedido real é enviado.
          </p>
        )}
        <Typography variant="subtitle2">Pagamento (sem gateway)</Typography>
        <RadioGroup
          value={checkout.paymentMethod}
          onChange={(event) => setCheckout((prev) => ({ ...prev, paymentMethod: event.target.value }))}
        >
          {DEMO_PAYMENT_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
        <div className="demo-totals demo-totals--total">
          <strong>Total</strong>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Voltar</Button>
        <Button variant="contained" disabled={submitting} onClick={onConfirm}>
          {submitting ? 'Simulando...' : 'Simular pedido'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
