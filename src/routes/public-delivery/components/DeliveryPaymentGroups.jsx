import { Box, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, InputAdornment } from '@mui/material';
import { formatCurrency } from '../../../services/accessControl';
import { formatCurrencyInput, parseCurrencyInput } from '../../../utils/currencyInput';
import './DeliveryPaymentGroups.css';

const ON_DELIVERY_OPTIONS = [
  { id: 'CASH', label: 'Dinheiro' },
  { id: 'PIX', label: 'Pix' },
  { id: 'CREDIT', label: 'Crédito' },
  { id: 'DEBIT', label: 'Débito' },
];

const PREPAY_NO_ONLINE_MSG =
  'Esta loja exige pagamento antecipado e nenhum meio online (Pix ou cartão) está disponível no momento.';

export default function DeliveryPaymentGroups({
  checkout,
  onChange,
  onlinePixEnabled,
  onlineCardEnabled,
  acceptPaymentOnDelivery = true,
  total,
}) {
  const onlinePix = Boolean(onlinePixEnabled && checkout.onlinePayment && checkout.paymentMethod === 'PIX');
  const onlineCard = Boolean(onlineCardEnabled && checkout.onlinePayment && checkout.paymentMethod === 'CREDIT');
  const onlineSelected = onlinePix || onlineCard;
  const onlineValue = onlineCard ? 'CARD_ONLINE' : onlinePix ? 'PIX_ONLINE' : '';
  const setField = (patch) => onChange((prev) => ({ ...prev, ...patch }));
  const showOnline = Boolean(onlinePixEnabled || onlineCardEnabled);
  const showOnDelivery = acceptPaymentOnDelivery !== false;
  const blocked = !showOnDelivery && !showOnline;

  return (
    <Box className="delivery-payment-groups">
      {blocked ? (
        <Typography variant="body2" color="error" role="alert" sx={{ mb: 1 }}>
          {PREPAY_NO_ONLINE_MSG}
        </Typography>
      ) : null}

      {showOnline ? (
        <section className="delivery-payment-group" aria-labelledby="pay-online-title">
          <Typography id="pay-online-title" className="delivery-payment-group-title" variant="subtitle2">
            Pague online
          </Typography>
          <FormControl>
            <RadioGroup
              value={onlineValue}
              onChange={(e) => {
                if (e.target.value === 'CARD_ONLINE') {
                  setField({ onlinePayment: true, paymentMethod: 'CREDIT', needsChange: false });
                  return;
                }
                setField({ onlinePayment: true, paymentMethod: 'PIX', needsChange: false });
              }}
            >
              {onlinePixEnabled ? (
                <FormControlLabel
                  value="PIX_ONLINE"
                  control={<Radio />}
                  label="Pix — aprovação rápida"
                />
              ) : null}
              {onlineCardEnabled ? (
                <FormControlLabel
                  value="CARD_ONLINE"
                  control={<Radio />}
                  label="Cartão de crédito — pague com segurança pelo Mercado Pago"
                />
              ) : null}
            </RadioGroup>
          </FormControl>
        </section>
      ) : null}

      {showOnDelivery ? (
        <section className="delivery-payment-group" aria-labelledby="pay-on-delivery-title">
          <Typography id="pay-on-delivery-title" className="delivery-payment-group-title" variant="subtitle2">
            Pague na entrega
          </Typography>
          <RadioGroup
            value={onlineSelected ? '' : checkout.paymentMethod}
            onChange={(e) => setField({
              onlinePayment: false,
              paymentMethod: e.target.value,
              needsChange: e.target.value === 'CASH' ? checkout.needsChange : false,
            })}
          >
            {ON_DELIVERY_OPTIONS.map((option) => (
              <FormControlLabel key={option.id} value={option.id} control={<Radio />} label={option.label} />
            ))}
          </RadioGroup>
          {!onlineSelected && checkout.paymentMethod === 'CASH' ? (
            <>
              <FormControlLabel
                control={<Radio checked={checkout.needsChange} onClick={() => setField({ needsChange: !checkout.needsChange })} />}
                label="Precisa de troco?"
              />
              {checkout.needsChange ? (
                <TextField
                  fullWidth
                  label="Troco para quanto?"
                  placeholder="0,00"
                  value={formatCurrencyInput(checkout.changeFor)}
                  onChange={(e) => {
                    const parsed = parseCurrencyInput(e.target.value);
                    setField({ changeFor: parsed === '' ? '' : parsed });
                  }}
                  autoComplete="off"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{
                    inputMode: 'numeric',
                    'aria-label': 'Troco para quanto em reais',
                  }}
                  helperText={`Total ${formatCurrency(total)}`}
                />
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}
    </Box>
  );
}

export { PREPAY_NO_ONLINE_MSG };
