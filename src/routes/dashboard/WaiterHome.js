import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';

export function WaiterHome({ user }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5 },
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        maxWidth: 560,
        mx: 'auto',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: 'var(--color-primary-soft, rgba(37, 99, 235, 0.12))',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <PhoneAndroidOutlinedIcon fontSize="large" />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Área do garçom
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Olá{user?.name ? `, ${user.name}` : ''}. O atendimento de mesas e comandas
        é feito no aplicativo Android Weper.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {user?.storeName
          ? `Loja: ${user.storeName}.`
          : 'Use o app no dispositivo da loja para lançar pedidos.'}
      </Typography>
    </Paper>
  );
}

export default WaiterHome;
