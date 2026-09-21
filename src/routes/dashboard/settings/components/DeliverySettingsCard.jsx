import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  DeliveryDining as DeliveryIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { buildDeliveryUrl } from '../../../../services/deliveryService';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../utils/currencyInput';
import { fileToCompressedDataUrl } from '../../menu/utils/compressImage';

const LOGO_UPLOAD = { maxWidth: 512, maxHeight: 512, quality: 0.82, maxFileBytes: 8 * 1024 * 1024 };
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
    <Card className="settings-card">
      <CardContent>
        <Box className="card-header">
          <Box className="card-title-section">
            <DeliveryIcon className="card-icon" />
            <Typography className="card-title">Delivery</Typography>
          </Box>
          <Button
            className="save-button"
            startIcon={<SaveIcon />}
            onClick={() => onSave('delivery')}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Clientes pedem pelo link público, pagam na entrega e o pedido entra na cozinha.
        </Typography>

        <Box className="setting-item">
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(settings?.deliveryEnabled)}
                onChange={(e) => onSettingChange('deliveryEnabled', null, e.target.checked)}
                sx={switchStyles}
              />
            }
            label="Delivery habilitado"
          />
        </Box>

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

        <Box className="setting-item" sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
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

        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Visual do cardápio
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Logo e banner aparecem no link público do Delivery. Use imagens de até 8 MB (mesmo limite do catálogo).
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

        <BrandingImageField
          label="Logo"
          hint="Tamanho ideal 512×512, quadrado, preferencialmente PNG."
          value={settings?.deliveryLogoUrl}
          settingKey="deliveryLogoUrl"
          onSettingChange={onSettingChange}
          uploadOptions={LOGO_UPLOAD}
          previewHeight={96}
          previewWidth={96}
          inputId="delivery-logo-upload"
        />
      </CardContent>
    </Card>
  );
});
