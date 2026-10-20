import { Alert, Box, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, InputAdornment } from '@mui/material';
import { formatCurrency } from '../../../services/accessControl';
import { formatCurrencyInput, parseCurrencyInput } from '../../../utils/currencyInput';
import { INFINITEPAY_ADDRESS_NOTICE } from '../infinitePayAddressNotice';
import './DeliveryPaymentGroups.css';

const ON_DELIVERY_OPTIONS = [
  { id: 'CASH', label: 'Dinheiro' },
  { id: 'PIX', label: 'Pix' },
  { id: 'CREDIT', label: 'Crédito' },
  { id: 'DEBIT', label: 'Débito' },
];

const PREPAY_NO_ONLINE_MSG =
  'Esta loja exige pagamento antecipado e nenhum meio online (Pix ou cartão) está disponível no momento.';

export function cardOnlineLabel() {
  return 'Cartão de crédito';
}

const paymentLabelSx = {
  '& .MuiFormControlLabel-label': { color: 'var(--color-text-primary)' },
};

const paymentRadioSx = {
  color: 'var(--color-text-secondary)',
  '&.Mui-checked': { color: 'var(--color-primary)' },
};

export default function DeliveryPaymentGroups({
  checkout,
  onChange,
  onlinePixEnabled,
  onlineCardEnabled,
  onlinePaymentProvider = 'MERCADOPAGO',
  acceptPayOnFulfillment = true,
  acceptPrepaid = true,
  fulfillment = 'DELIVERY',
  total,
}) {
  const onlinePix = Boolean(onlinePixEnabled && checkout.onlinePayment && checkout.paymentMethod === 'PIX');
  const onlineCard = Boolean(onlineCardEnabled && checkout.onlinePayment && checkout.paymentMethod === 'CREDIT');
  const onlineSelected = onlinePix || onlineCard;
  const onlineValue = onlineCard ? 'CARD_ONLINE' : onlinePix ? 'PIX_ONLINE' : '';
  const setField = (patch) => onChange((prev) => ({ ...prev, ...patch }));
  const showOnline = Boolean(acceptPrepaid && (onlinePixEnabled || onlineCardEnabled));
  const showOnFulfillment = acceptPayOnFulfillment !== false;
  const onSpotTitle = fulfillment === 'PICKUP' ? 'Pague na retirada' : 'Pague na entrega';
  const blocked = !showOnFulfillment && !showOnline;
  const blockedMessage = acceptPrepaid
    ? PREPAY_NO_ONLINE_MSG
    : 'Este canal não tem uma forma de pagamento disponível.';
  const infinitePayCheckout = String(onlinePaymentProvider || '').toUpperCase() === 'INFINITEPAY' && showOnline;

  return (
    <Box className="delivery-payment-groups">
      {infinitePayCheckout ? (
        <Alert severity="info" className="delivery-payment-infinitepay-notice">
          {INFINITEPAY_ADDRESS_NOTICE}
        </Alert>
      ) : null}
      {blocked ? (
        <Typography variant="body2" color="error" role="alert" sx={{ mb: 1 }}>
          {blockedMessage}
        </Typography>
      ) : null}

      {showOnline ? (
        <section className="delivery-payment-group" aria-labelledby="pay-online-title">
          <Typography id="pay-online-title" className="delivery-payment-group-title" variant="subtitle2" component="h3">
            Pague online
          </Typography>
          <Typography className="delivery-payment-group-hint" variant="body2">
            Aprovação na hora.
          </Typography>
          <FormControl>
            <RadioGroup
              className="delivery-pay-list"
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
                  className="delivery-pay-option"
                  value="PIX_ONLINE"
                  control={<Radio sx={paymentRadioSx} />}
                  label="Pix — aprovação rápida"
                  sx={paymentLabelSx}
                />
              ) : null}
              {onlineCardEnabled ? (
                <FormControlLabel
                  className="delivery-pay-option"
                  value="CARD_ONLINE"
                  control={<Radio sx={paymentRadioSx} />}
                  label={cardOnlineLabel(onlinePaymentProvider)}
                  sx={paymentLabelSx}
                />
              ) : null}
            </RadioGroup>
          </FormControl>
        </section>
      ) : null}

      {showOnFulfillment ? (
        <section className="delivery-payment-group" aria-labelledby="pay-on-delivery-title">
          <Typography id="pay-on-delivery-title" className="delivery-payment-group-title" variant="subtitle2" component="h3">
            {onSpotTitle}
          </Typography>
          <Typography className="delivery-payment-group-hint" variant="body2">
            {fulfillment === 'PICKUP' ? 'Você paga ao retirar.' : 'Você paga ao receber.'}
          </Typography>
          <RadioGroup
            className="delivery-pay-list"
            value={onlineSelected ? '' : checkout.paymentMethod}
            onChange={(e) => setField({
              onlinePayment: false,
              paymentMethod: e.target.value,
              needsChange: e.target.value === 'CASH' ? checkout.needsChange : false,
            })}
          >
            {ON_DELIVERY_OPTIONS.map((option) => (
              <FormControlLabel
                className="delivery-pay-option"
                key={option.id}
                value={option.id}
                control={<Radio sx={paymentRadioSx} />}
                label={option.label}
                sx={paymentLabelSx}
              />
            ))}
          </RadioGroup>
          {!onlineSelected && checkout.paymentMethod === 'CASH' ? (
            <>
              <FormControlLabel
                className="delivery-pay-option"
                control={<Radio sx={paymentRadioSx} checked={checkout.needsChange} onClick={() => setField({ needsChange: !checkout.needsChange })} />}
                label="Precisa de troco?"
                sx={paymentLabelSx}
              />
              {checkout.needsChange ? (
                <TextField
                  className="delivery-pay-change"
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
