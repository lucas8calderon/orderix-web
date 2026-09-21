import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QrCode2Outlined as QrCodeIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { buildPublicMenuUrl } from '../../../../services/publicMenuService';
import { SettingsSectionCard } from './SettingsSectionCard';

export const DigitalMenuCard = React.memo(function DigitalMenuCard({
  settings,
  onSettingChange,
  onSave,
  onToast,
  switchStyles,
  saving,
}) {
  const [copyHint, setCopyHint] = useState('');
  const [downloading, setDownloading] = useState(false);

  const publicUrl = useMemo(
    () => buildPublicMenuUrl(settings?.slug),
    [settings?.slug]
  );

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyHint('Link copiado');
      onToast?.('Link do cardápio copiado.', 'success');
    } catch {
      setCopyHint('Não foi possível copiar');
      onToast?.('Não foi possível copiar o link do cardápio.', 'error');
    }
    setTimeout(() => setCopyHint(''), 2000);
  };

  const handleDownload = async () => {
    if (!publicUrl) return;
    setDownloading(true);
    try {
      const QRCode = await import('qrcode');
      const dataUrl = await QRCode.toDataURL(publicUrl, {
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      const link = document.createElement('a');
      link.download = `cardapio-${settings.slug || 'loja'}.png`;
      link.href = dataUrl;
      link.click();
      onToast?.('QR Code baixado com sucesso.', 'success');
    } catch (error) {
      onToast?.(
        error?.message || 'Não foi possível gerar o QR Code.',
        'error'
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SettingsSectionCard
      icon={QrCodeIcon}
      title="Cardápio digital (QR)"
      description="Clientes acessam o catálogo pelo link ou QR. Fora do horário, o cardápio continua visível com a tag Fechado."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={() => onSave('publicMenu')}
      actionDisabled={saving}
    >
      <Box className="setting-item">
        <FormControlLabel
          control={(
            <Switch
              checked={Boolean(settings?.publicMenuEnabled)}
              onChange={(e) => onSettingChange('publicMenuEnabled', null, e.target.checked)}
              sx={switchStyles}
            />
          )}
          label="Publicar cardápio digital"
        />
      </Box>

      <Box className="setting-item">
        <FormControlLabel
          control={(
            <Switch
              checked={Boolean(settings?.publicMenuShowUnavailable)}
              onChange={(e) => onSettingChange('publicMenuShowUnavailable', null, e.target.checked)}
              sx={switchStyles}
            />
          )}
          label="Mostrar produtos indisponíveis"
        />
      </Box>

      <Box className="setting-item">
        <TextField
          label="Link público"
          value={publicUrl}
          fullWidth
          InputProps={{
            readOnly: true,
            endAdornment: (
              <Tooltip title={copyHint || 'Copiar link'}>
                <IconButton onClick={handleCopy} edge="end" aria-label="Copiar link" disabled={!publicUrl}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ),
          }}
        />
        {!settings?.slug && (
          <Typography variant="caption" color="text.secondary">
            Carregue as configurações para obter o slug da loja.
          </Typography>
        )}
        <Button
          variant="outlined"
          startIcon={<CopyIcon />}
          onClick={handleCopy}
          disabled={!publicUrl}
          sx={{ mt: 1 }}
        >
          Copiar link do cardápio
        </Button>
      </Box>

      {publicUrl ? (
        <Box className="digital-menu-qr">
          <Box className="digital-menu-qr__code">
            <QRCodeSVG value={publicUrl} size={140} level="M" includeMargin />
          </Box>
          <Box className="digital-menu-qr__meta">
            <Typography variant="body2" color="text.secondary">
              Imprima ou compartilhe o QR Code nas mesas e no balcão. O link usa o slug da loja.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{ mt: 1.5, minHeight: 44 }}
            >
              {downloading ? 'Baixando...' : 'Baixar QR Code'}
            </Button>
          </Box>
        </Box>
      ) : null}
    </SettingsSectionCard>
  );
});
