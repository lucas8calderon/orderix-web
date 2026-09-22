import React, { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { CRM_BUSINESS_TYPES } from '../crmConstants';
import { createGooglePlacesProspectingClient } from '../prospecting/GooglePlacesProspectingProvider';

const prospectingClient = createGooglePlacesProspectingClient();

export function CrmProspectingDialog({ open, onClose }) {
  const dialogProps = useDialogResponsiveProps();
  const [businessType, setBusinessType] = useState('HAMBURGER');
  const [region, setRegion] = useState('São José dos Campos - SP');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await prospectingClient.search({ businessType, region, limit });
      setResult(data);
    } catch (err) {
      setResult({
        available: false,
        message: err?.response?.data?.message || 'Integração de prospecção em preparação.',
        results: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" {...dialogProps}>
      <DialogTitle>Encontrar potenciais clientes</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <FormControl fullWidth>
            <InputLabel>Segmento</InputLabel>
            <Select label="Segmento" value={businessType} onChange={(event) => setBusinessType(event.target.value)}>
              {CRM_BUSINESS_TYPES.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Região"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Quantidade</InputLabel>
            <Select label="Quantidade" value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
              {[10, 20, 30, 50].map((value) => (
                <MenuItem key={value} value={value}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
              minHeight: 44,
            }}
          >
            {loading ? 'Buscando...' : 'Buscar estabelecimentos'}
          </Button>
          {result && (
            <Alert severity="info">
              {result.message || 'Integração de prospecção em preparação.'}
            </Alert>
          )}
          <Typography variant="caption" color="text.secondary">
            Os resultados poderão ser selecionados e convertidos em novos leads quando a integração estiver disponível.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
