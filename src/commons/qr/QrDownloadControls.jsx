import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import {
  DEFAULT_QR_DOWNLOAD_SIZE_ID,
  QR_DOWNLOAD_SIZES,
  downloadQrPng,
  getQrDownloadSize,
} from './qrDownloadSizes';

/**
 * Seletor de tamanho + botão de download para QR codes destinados à impressão.
 * A pré-visualização na tela permanece inalterada; só o PNG exportado muda.
 */
export function QrDownloadControls({
  value,
  fileName,
  level = 'M',
  buttonLabel = 'Baixar QR Code',
  downloadingLabel = 'Baixando...',
  buttonVariant = 'outlined',
  buttonSx,
  startIcon,
  disabled = false,
  onSuccess,
  onError,
  fullWidth = false,
}) {
  const [sizeId, setSizeId] = useState(DEFAULT_QR_DOWNLOAD_SIZE_ID);
  const [downloading, setDownloading] = useState(false);
  const selected = getQrDownloadSize(sizeId);

  const handleDownload = async () => {
    if (!value || downloading) return;
    setDownloading(true);
    try {
      await downloadQrPng({
        value,
        fileName,
        width: selected.width,
        level,
      });
      onSuccess?.(selected);
    } catch (error) {
      onError?.(error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        alignItems: fullWidth ? 'stretch' : 'flex-start',
        width: fullWidth ? '100%' : 'auto',
        mt: 1.5,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 220, width: fullWidth ? '100%' : 'auto' }}>
        <InputLabel id="qr-download-size-label">Tamanho para imprimir</InputLabel>
        <Select
          labelId="qr-download-size-label"
          id="qr-download-size"
          value={sizeId}
          label="Tamanho para imprimir"
          onChange={(event) => setSizeId(event.target.value)}
          disabled={disabled || downloading}
        >
          {QR_DOWNLOAD_SIZES.map((size) => (
            <MenuItem key={size.id} value={size.id}>
              {size.label} ({size.hint})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary">
        O arquivo PNG sai em {selected.width}×{selected.width} px ({selected.hint} a ~300 dpi).
      </Typography>
      <Button
        variant={buttonVariant}
        startIcon={startIcon ?? <DownloadIcon />}
        onClick={handleDownload}
        disabled={disabled || downloading || !value}
        sx={{ minHeight: 44, width: fullWidth ? '100%' : undefined, ...buttonSx }}
      >
        {downloading ? downloadingLabel : buttonLabel}
      </Button>
    </Box>
  );
}
