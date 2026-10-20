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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import {
  DEFAULT_QR_DOWNLOAD_SIZE_ID,
  QR_DOWNLOAD_SIZES,
  downloadQrPng,
  downloadQrPrintPdf,
  getQrDownloadSize,
  printQrOnA4,
} from './qrDownloadSizes';

/**
 * Seletor de tamanho + download/impressão para QR codes.
 * PNG mantém pixels + pHYs; PDF/Imprimir preservam o tamanho físico em cm no A4.
 */
export function QrDownloadControls({
  value,
  fileName,
  level = 'M',
  buttonLabel = 'Baixar PNG',
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
  const [busy, setBusy] = useState(null);
  const selected = getQrDownloadSize(sizeId);
  const isBusy = Boolean(busy);

  const runAction = async (actionKey, action, successPayload) => {
    if (!value || isBusy) return;
    setBusy(actionKey);
    try {
      await action();
      onSuccess?.(successPayload ?? selected);
    } catch (error) {
      onError?.(error);
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadPng = () =>
    runAction('png', () =>
      downloadQrPng({
        value,
        fileName,
        width: selected.width,
        sizeCm: selected.sizeCm,
        level,
      })
    );

  const handleDownloadPdf = () =>
    runAction(
      'pdf',
      () =>
        downloadQrPrintPdf({
          value,
          fileName,
          width: selected.width,
          sizeCm: selected.sizeCm,
          level,
        }),
      { ...selected, format: 'pdf' }
    );

  const handlePrint = () =>
    runAction(
      'print',
      () =>
        printQrOnA4({
          value,
          width: selected.width,
          sizeCm: selected.sizeCm,
          level,
          title: fileName || 'QR Code',
        }),
      { ...selected, format: 'print' }
    );

  const buttonWidthSx = { minHeight: 44, width: fullWidth ? '100%' : undefined, ...buttonSx };

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
          disabled={disabled || isBusy}
        >
          {QR_DOWNLOAD_SIZES.map((size) => (
            <MenuItem key={size.id} value={size.id}>
              {size.label} ({size.hint})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary">
        PNG: {selected.width}×{selected.width} px ({selected.hint} a ~300 dpi). Para o tamanho
        físico na folha A4 (sem esticar no Windows), use PDF ou Imprimir.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: fullWidth ? '100%' : 'auto',
        }}
      >
        <Button
          variant={buttonVariant}
          startIcon={startIcon ?? <DownloadIcon />}
          onClick={handleDownloadPng}
          disabled={disabled || isBusy || !value}
          sx={buttonWidthSx}
        >
          {busy === 'png' ? downloadingLabel : buttonLabel}
        </Button>
        <Button
          variant={buttonVariant}
          startIcon={<PictureAsPdfIcon />}
          onClick={handleDownloadPdf}
          disabled={disabled || isBusy || !value}
          sx={buttonWidthSx}
        >
          {busy === 'pdf' ? 'Gerando PDF...' : 'Baixar PDF para impressão'}
        </Button>
        <Button
          variant={buttonVariant}
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={disabled || isBusy || !value}
          sx={buttonWidthSx}
        >
          {busy === 'print' ? 'Abrindo impressão...' : 'Imprimir em A4'}
        </Button>
      </Box>
    </Box>
  );
}
