import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import {
  BusinessOutlined as BusinessIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { SettingsSectionCard } from './SettingsSectionCard';

export function CompanySection({ settings, onSettingChange, onSave, onToast }) {
  return (
    <SettingsSectionCard
      icon={BusinessIcon}
      title="Dados Fiscais e Empresa"
      description="Informações exibidas no resumo da loja. Persistência no servidor em breve."
      actionLabel="Salvar"
      onAction={() => onSave('companyInfo')}
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
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            className="upload-button"
          >
            Upload Logotipo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={() => {
                onToast?.(
                  'Upload de logotipo ainda não está disponível no servidor.',
                  'info'
                );
              }}
            />
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            O logo do canal Delivery (capa e avatar) fica em Delivery → Visual.
          </Typography>
        </Box>
      </Box>
    </SettingsSectionCard>
  );
}
