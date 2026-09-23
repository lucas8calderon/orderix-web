import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import {
  BusinessOutlined as BusinessIcon,
  Upload as UploadIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { CLEARED_BRANDING_IMAGE, isBrandingImage } from '../../../../services/deliveryService';
import { fileToCompressedDataUrl } from '../../menu/utils/compressImage';
import { SettingsSectionCard } from './SettingsSectionCard';

const LOGO_UPLOAD = { maxWidth: 512, maxHeight: 512, quality: 0.82, maxFileBytes: 8 * 1024 * 1024 };
const MAX_LOGO_DATA_URL_CHARS = 1_200_000;

export function CompanySection({ settings, onSettingChange, onSave, saving }) {
  const [error, setError] = useState('');
  const logo = isBrandingImage(settings?.deliveryLogoUrl) ? settings.deliveryLogoUrl : '';

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    try {
      const dataUrl = await fileToCompressedDataUrl(file, LOGO_UPLOAD);
      if (typeof dataUrl === 'string' && dataUrl.length > MAX_LOGO_DATA_URL_CHARS) {
        setError('A imagem ficou grande demais após o processamento. Use um arquivo menor.');
        return;
      }
      onSettingChange('deliveryLogoUrl', null, dataUrl);
    } catch (err) {
      setError(err?.message || 'Não foi possível processar a imagem.');
    }
  };

  return (
    <SettingsSectionCard
      icon={BusinessIcon}
      title="Dados Fiscais e Empresa"
      description="O logotipo é gravado ao escolher o arquivo e aparece na loja e no Delivery. Nome, CNPJ e telefone ainda ficam só nesta tela."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={() => onSave('companyInfo')}
      actionDisabled={saving}
    >
      <Box className="company-fields">
        <TextField
          label="Nome da empresa"
          value={settings.companyInfo.companyName}
          onChange={(e) => onSettingChange('companyInfo', 'companyName', e.target.value)}
          className="setting-input"
          fullWidth
        />
        <TextField
          label="CNPJ"
          value={settings.companyInfo.cnpj}
          onChange={(e) => onSettingChange('companyInfo', 'cnpj', e.target.value)}
          className="setting-input"
          fullWidth
        />
        <TextField
          label="Endereço"
          value={settings.companyInfo.address}
          onChange={(e) => onSettingChange('companyInfo', 'address', e.target.value)}
          className="setting-input"
          fullWidth
          multiline
          rows={2}
        />
        <TextField
          label="Telefone"
          value={settings.companyInfo.phone}
          onChange={(e) => onSettingChange('companyInfo', 'phone', e.target.value)}
          className="setting-input"
          fullWidth
        />
        <Box className="upload-section">
          <Typography className="setting-label">Logotipo da empresa</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Tamanho ideal 512×512, PNG ou JPG, até 8 MB. A imagem é gravada ao escolher o arquivo.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              className="upload-button"
              disabled={saving}
            >
              Upload Logotipo
              <input
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp,image/gif"
                aria-label="Arquivo do logotipo"
                onChange={handleFileChange}
              />
            </Button>
            {logo ? (
              <Button
                variant="text"
                color="inherit"
                size="small"
                startIcon={<DeleteIcon />}
                disabled={saving}
                onClick={() => {
                  setError('');
                  onSettingChange('deliveryLogoUrl', null, CLEARED_BRANDING_IMAGE);
                }}
              >
                Remover
              </Button>
            ) : null}
          </Box>
          {error ? (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          ) : null}
          {logo ? (
            <Box
              component="img"
              src={logo}
              alt="Logotipo da empresa"
              sx={{
                mt: 1.5,
                width: 96,
                height: 96,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                display: 'block',
              }}
            />
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Nenhuma imagem cadastrada.
            </Typography>
          )}
        </Box>
      </Box>
    </SettingsSectionCard>
  );
}
