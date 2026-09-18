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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QrCode2 as QrCodeIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { buildPublicMenuUrl } from '../../../../services/publicMenuService';

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
    <Card className="settings-card">
      <CardContent>
        <Box className="card-header">
          <Box className="card-title-section">
            <QrCodeIcon className="card-icon" />
            <Typography className="card-title">Cardápio digital (QR)</Typography>
          </Box>
          <Button
            className="save-button"
            startIcon={<SaveIcon />}
            onClick={() => onSave('publicMenu')}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Clientes acessam o catálogo pelo link ou QR. Não inclui pedidos neste MVP.
        </Typography>

        <Box className="setting-item">
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(settings?.publicMenuEnabled)}
                onChange={(e) => onSettingChange('publicMenuEnabled', null, e.target.checked)}
                sx={switchStyles}
              />
            }
            label="Publicar cardápio digital"
          />
        </Box>

        <Box className="setting-item">
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(settings?.publicMenuShowUnavailable)}
                onChange={(e) => onSettingChange('publicMenuShowUnavailable', null, e.target.checked)}
                sx={switchStyles}
              />
            }
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
        </Box>

        {publicUrl && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mt: 2,
              p: 2,
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 2,
              bgcolor: '#fff',
            }}
          >
            <QRCodeSVG value={publicUrl} size={180} level="M" includeMargin />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{ minHeight: 44 }}
            >
              {downloading ? 'Baixando...' : 'Baixar QR Code'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});
