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
import { CLEARED_STORE_PHONE, formatStoreWhatsAppInput } from '../../../../utils/phoneInput';
import { SettingsSectionCard } from './SettingsSectionCard';
import { DeliveryNeighborhoodsSection } from './DeliveryNeighborhoodsSection';

function ChannelPaymentOptions({
  title,
  visible,
  payOnLabel,
  prepaidLabel,
  payOnCaption,
  prepaidCaption,
  payOn,
  prepaid,
  payOnKey,
  prepaidKey,
  channelName,
  onlineReady,
  onSettingChange,
  onToast,
  switchStyles,
}) {
  if (!visible) return null;
  const payOnEnabled = payOn !== false;
  const prepaidEnabled = prepaid !== false;
  const blockLast = (nextPayOn, nextPrepaid) => {
    if (nextPayOn || nextPrepaid) return false;
    onToast?.(
      `Deixe pelo menos uma forma de concluir o pedido na ${channelName}.`,
      'warning'
    );
    return true;
  };
  const prepaidOnlyWithoutOnline = !payOnEnabled && prepaidEnabled && !onlineReady;

  return (
    <Box className="setting-item">
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <FormControlLabel
        control={(
          <Switch
            checked={payOnEnabled}
            onChange={(e) => {
              if (blockLast(e.target.checked, prepaidEnabled)) return;
              onSettingChange(payOnKey, null, e.target.checked);
            }}
            sx={switchStyles}
          />
        )}
        label={payOnLabel}
      />
      <Typography variant="caption" color="text.secondary" display="block">
        {payOnCaption}
      </Typography>
      <FormControlLabel
        control={(
          <Switch
            checked={prepaidEnabled}
            onChange={(e) => {
              if (blockLast(payOnEnabled, e.target.checked)) return;
              onSettingChange(prepaidKey, null, e.target.checked);
            }}
            sx={switchStyles}
          />
        )}
        label={prepaidLabel}
      />
      <Typography variant="caption" color="text.secondary" display="block">
        {prepaidCaption}
      </Typography>
      {prepaidOnlyWithoutOnline ? (
        <Typography variant="caption" color="error" display="block" role="alert">
          Este canal ficou só com pagamento antes de produzir, e não há Pix nem cartão online.
          O cliente não consegue concluir o pedido até você ativar um meio online.
        </Typography>
      ) : null}
    </Box>
  );
}

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
      description="Clientes pedem pelo link público. Entrega e retirada escolhem à parte: pagar na hora, pagar antes de produzir, ou as duas."
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
        <ChannelPaymentOptions
          title="Entrega"
          visible={settings?.offersDelivery !== false}
          payOnLabel="Aceitar pagar na hora na entrega"
          prepaidLabel="Aceitar pagamento antes de produzir na entrega"
          payOnCaption="Dinheiro, Pix, crédito ou débito na entrega. O pedido entra na cozinha sem pagamento antecipado."
          prepaidCaption="O pedido só entra na operação depois que o pagamento online for aprovado."
          payOn={settings?.acceptPayOnDelivery}
          prepaid={settings?.acceptPrepaidDelivery}
          payOnKey="acceptPayOnDelivery"
          prepaidKey="acceptPrepaidDelivery"
          channelName="entrega"
          onlineReady={Boolean(settings?.onlinePixEnabled || settings?.onlineCardEnabled)}
          onSettingChange={onSettingChange}
          onToast={onToast}
          switchStyles={switchStyles}
        />
        <ChannelPaymentOptions
          title="Retirada"
          visible={settings?.offersPickup !== false}
          payOnLabel="Aceitar pagar na hora na retirada"
          prepaidLabel="Aceitar pagamento antes de produzir na retirada"
          payOnCaption="Dinheiro, Pix, crédito ou débito na retirada. O pedido entra na cozinha sem pagamento antecipado."
          prepaidCaption="O pedido só entra na operação depois que o pagamento online for aprovado."
          payOn={settings?.acceptPayOnPickup}
          prepaid={settings?.acceptPrepaidPickup}
          payOnKey="acceptPayOnPickup"
          prepaidKey="acceptPrepaidPickup"
          channelName="retirada"
          onlineReady={Boolean(settings?.onlinePixEnabled || settings?.onlineCardEnabled)}
          onSettingChange={onSettingChange}
          onToast={onToast}
          switchStyles={switchStyles}
        />
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
            label="WhatsApp da loja"
            value={formatStoreWhatsAppInput(settings?.storePhone ?? '')}
            onChange={(e) => {
              const formatted = formatStoreWhatsAppInput(e.target.value);
              onSettingChange('storePhone', null, formatted || CLEARED_STORE_PHONE);
            }}
            fullWidth
            placeholder="(11) 98888-8888"
            helperText="Este número é o que o cliente usa para falar com o estabelecimento."
            inputProps={{
              inputMode: 'tel',
              autoComplete: 'tel',
              'aria-label': 'WhatsApp da loja',
            }}
          />
        </Box>

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
            helperText="Usada só enquanto não houver bairro cadastrado. Com bairros, a taxa de cada um passa a valer."
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

      <DeliveryNeighborhoodsSection settings={settings} onSettingChange={onSettingChange} />
    </SettingsSectionCard>
  );
});
