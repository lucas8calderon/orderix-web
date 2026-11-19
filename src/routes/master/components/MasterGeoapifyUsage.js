import { useEffect, useState } from 'react';
import { Alert, Box, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../../../services/apiConfig';

function loadUsage() {
  return axios.get(`${API_BASE_URL}/api/admin/delivery/api-usage`);
}

export default function MasterGeoapifyUsage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    loadUsage()
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Não foi possível carregar o consumo da Geoapify.');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Paper elevation={0} sx={{ p: 2, mt: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6">Consumo da Geoapify</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Estimativa interna do dia UTC. Não é o contador oficial do provedor e não mostra a chave da API.
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {data ? (
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography>Créditos estimados hoje: {data.creditsReserved} de {data.dailyLimit}</Typography>
          <Typography>Disponíveis estimados: {data.creditsRemaining}</Typography>
          <Typography>Geocodificações: {data.geocodes} · Rotas: {data.routes} · Erros e bloqueios: {data.errors}</Typography>
          <Typography>
            Consultas externas: {data.enabled && data.configured ? 'ligadas' : 'desligadas'}
          </Typography>
          {(data.stores || []).map((store) => (
            <Typography key={store.storeId || 'none'} variant="body2">
              {store.storeName}: {store.creditsEstimated} créditos em {store.calls} consultas
            </Typography>
          ))}
        </Box>
      ) : null}
    </Paper>
  );
}
