import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  Radio,
  RadioGroup,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  DeliveryDiningOutlined as DeliveryIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { buildDeliveryUrl } from '../../../../services/deliveryService';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../utils/currencyInput';
import { SettingsSectionCard } from './SettingsSectionCard';

function DeliveryGroup({ title, children }) {
  return (
    <Box className="delivery-group">
      <Typography className="delivery-group__title" component="h3">
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export const DeliverySettingsCard = React.memo(function DeliverySettingsCard({
  settings,
  onSettingChange,
  onSave,
  onToast,
  switchStyles,
  saving,
}) {
  const [copyHint, setCopyHint] = useState('');
  const publicUrl = useMemo(
    () => buildDeliveryUrl(settings?.slug),
    [settings?.slug]
  );

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyHint('Link copiado');
      onToast?.('Link do Delivery copiado.', 'success');
    } catch {
      setCopyHint('Não foi possível copiar');
      onToast?.('Não foi possível copiar o link do Delivery.', 'error');
    }
    setTimeout(() => setCopyHint(''), 2000);
  };

  const handleMoneyChange = (key) => (event) => {
    const parsed = parseCurrencyInput(event.target.value);
    onSettingChange(key, null, parsed === '' ? 0 : parsed);
  };

  return (
    <SettingsSectionCard
      icon={DeliveryIcon}
      title="Delivery"
      description="Clientes pedem pelo link público. Você escolhe se aceita pagamento na hora ou só online antes de produzir."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={() => onSave('delivery')}
      actionDisabled={saving}
    >
      <DeliveryGroup title="Status">
        <Box className="setting-item">
          <FormControlLabel
            control={(
              <Switch
                checked={Boolean(settings?.deliveryEnabled)}
                onChange={(e) => onSettingChange('deliveryEnabled', null, e.target.checked)}
                sx={switchStyles}
              />
            )}
            label="Delivery habilitado"
          />
          <Typography variant="caption" color="text.secondary" display="block">
            Desative para pausar o canal sem alterar o horário da loja.
          </Typography>
        </Box>
        <Box className="setting-item">
          <FormControl>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Como o cliente recebe o pedido
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Só entrega, só retirada ou os dois. O cardápio público mostra apenas as opções ativas.
            </Typography>
            <RadioGroup
              value={
                settings?.offersDelivery !== false && settings?.offersPickup === false
                  ? 'DELIVERY'
                  : settings?.offersDelivery === false && settings?.offersPickup !== false
                    ? 'PICKUP'
                    : 'BOTH'
              }
              onChange={(e) => {
                const value = e.target.value;
                onSettingChange('offersDelivery', null, value !== 'PICKUP');
                onSettingChange('offersPickup', null, value !== 'DELIVERY');
              }}
            >
              <FormControlLabel value="BOTH" control={<Radio />} label="Entrega e retirada" />
              <FormControlLabel value="DELIVERY" control={<Radio />} label="Somente entrega" />
              <FormControlLabel value="PICKUP" control={<Radio />} label="Somente retirada" />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box className="setting-item">
          <FormControlLabel
            control={(
              <Switch
                checked={settings?.acceptPaymentOnDelivery !== false}
                onChange={(e) => onSettingChange('acceptPaymentOnDelivery', null, e.target.checked)}
                sx={switchStyles}
              />
            )}
            label="Aceitar pagamento na entrega ou na retirada"
          />
          <Typography variant="caption" color="text.secondary" display="block">
            Ligado: o cliente pode pagar na hora (dinheiro, Pix, crédito ou débito) e o pedido entra na cozinha.
            Desligado: só Pix ou cartão online; o pedido só entra na operação depois do pagamento aprovado.
          </Typography>
        </Box>
      </DeliveryGroup>

      <DeliveryGroup title="Link">
        <Box className="setting-item">
          <TextField
            label="Link público"
            value={publicUrl || 'Publique um slug da loja para gerar o link'}
            fullWidth
            InputProps={{ readOnly: true }}
            helperText={copyHint || 'Usa o mesmo slug da loja. Pedidos entram como origem DELIVERY.'}
          />
          <Button
            variant="outlined"
            startIcon={<CopyIcon />}
            onClick={handleCopy}
            disabled={!publicUrl}
            sx={{ mt: 1 }}
          >
            Copiar link do Delivery
          </Button>
        </Box>
      </DeliveryGroup>

      <DeliveryGroup title="Operação">
        <Box className="setting-item">
          <TextField
            label="Endereço da loja (retirada)"
            value={settings?.storeAddress ?? ''}
            onChange={(e) => onSettingChange('storeAddress', null, e.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="Rua, número, bairro, cidade"
            helperText="Exibido no acompanhamento quando o cliente escolhe retirada."
          />
        </Box>

        <Box className="delivery-ops-grid">
          <TextField
            label="Taxa de entrega"
            placeholder="0,00"
            value={formatCurrencyInput(settings?.deliveryFee ?? 0)}
            onChange={handleMoneyChange('deliveryFee')}
            fullWidth
            autoComplete="off"
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            inputProps={{
              inputMode: 'numeric',
              'aria-label': 'Taxa de entrega em reais',
            }}
          />
          <TextField
            label="Pedido mínimo"
            placeholder="0,00"
            value={formatCurrencyInput(settings?.deliveryMinOrder ?? 0)}
            onChange={handleMoneyChange('deliveryMinOrder')}
            fullWidth
            autoComplete="off"
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            inputProps={{
              inputMode: 'numeric',
              'aria-label': 'Pedido mínimo em reais',
            }}
          />
          <TextField
            label="Tempo estimado (min)"
            type="number"
            value={settings?.deliveryEstimatedMinutes ?? ''}
            onChange={(e) => onSettingChange('deliveryEstimatedMinutes', null, e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            fullWidth
          />
        </Box>
      </DeliveryGroup>
    </SettingsSectionCard>
  );
});
