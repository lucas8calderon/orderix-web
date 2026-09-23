import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { buildDeliveryUrl } from '../../../../services/deliveryService';
import { settingsSectionPath } from '../settingsSections';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../utils/currencyInput';
import { fileToCompressedDataUrl } from '../../menu/utils/compressImage';
import { SettingsSectionCard } from './SettingsSectionCard';

const COVER_UPLOAD = { maxWidth: 1400, maxHeight: 525, quality: 0.72, maxFileBytes: 8 * 1024 * 1024 };
/** Evita payload PUT > limite prático do servidor (dois data URLs). */
const MAX_BRANDING_DATA_URL_CHARS = 1_200_000;

function BrandingImageField({
  label,
  hint,
  value,
  settingKey,
  onSettingChange,
  uploadOptions,
  previewHeight,
  previewWidth,
  inputId,
}) {
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    try {
      const dataUrl = await fileToCompressedDataUrl(file, uploadOptions);
      if (typeof dataUrl === 'string' && dataUrl.length > MAX_BRANDING_DATA_URL_CHARS) {
        setError('A imagem ficou grande demais após o processamento. Use um arquivo menor ou com menos detalhes.');
        return;
      }
      onSettingChange(settingKey, null, dataUrl);
    } catch (err) {
      setError(err?.message || 'Não foi possível processar a imagem.');
    }
  };

  return (
    <Box className="setting-item">
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {hint}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1.5 }}>
        <Button variant="outlined" component="label" size="small">
          Escolher imagem
          <input
            id={inputId}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
          />
        </Button>
        {value ? (
          <Button
            variant="text"
            color="inherit"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setError('');
              onSettingChange(settingKey, null, '');
            }}
          >
            Remover
          </Button>
        ) : null}
      </Box>
      {error ? (
        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      ) : null}
      {value ? (
        <Box
          sx={{
            width: previewWidth,
            maxWidth: '100%',
            height: previewHeight,
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'action.hover',
          }}
        >
          <Box
            component="img"
            src={value}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Nenhuma imagem cadastrada.
        </Typography>
      )}
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
  const navigate = useNavigate();
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
      description="Clientes pedem pelo link público, pagam na entrega e o pedido entra na cozinha."
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

      <DeliveryGroup title="Visual">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A capa do Delivery aparece no link público. O logo da loja é alterado em Empresa. Imagens de até 8 MB.
        </Typography>

        <BrandingImageField
          label="Banner (capa)"
          hint="Tamanho ideal 1600×600 (mínimo 1200×450). JPG ou PNG."
          value={settings?.deliveryCoverUrl}
          settingKey="deliveryCoverUrl"
          onSettingChange={onSettingChange}
          uploadOptions={COVER_UPLOAD}
          previewHeight={120}
          previewWidth={320}
          inputId="delivery-cover-upload"
        />

        <Box className="setting-item">
          <Typography variant="subtitle2">Logo da loja</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            O logo é editado em Empresa e vale para a loja inteira. Aqui fica só a capa do Delivery.
          </Typography>
          {settings?.deliveryLogoUrl ? (
            <Box component="img" src={settings.deliveryLogoUrl} alt="" sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1 }} />
          ) : (
            <Typography variant="caption" color="text.secondary">Nenhum logo cadastrado.</Typography>
          )}
          <Box>
            <Button size="small" onClick={() => navigate(settingsSectionPath('empresa'))}>Alterar logo</Button>
          </Box>
        </Box>
      </DeliveryGroup>
    </SettingsSectionCard>
  );
});
