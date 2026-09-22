import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const VARIANTS = {
  kanban: {
    title: 'Comece sua prospecção',
    description: 'Cadastre potenciais clientes e acompanhe todo o processo comercial da Weper.',
    action: '+ Novo Lead',
  },
  search: {
    title: 'Nenhum lead encontrado',
    description: 'Tente alterar os filtros utilizados.',
  },
  followUp: {
    title: 'Tudo em dia',
    description: 'Nenhum retorno pendente.',
  },
};

export function CrmEmptyState({ variant = 'kanban', onCreate }) {
  const copy = VARIANTS[variant] || VARIANTS.kanban;
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.25} alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {copy.title}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
          {copy.description}
        </Typography>
        {onCreate && copy.action && (
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreate}
              sx={{
                backgroundColor: 'var(--color-primary)',
                '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
                textTransform: 'none',
                minHeight: 44,
              }}
            >
              {copy.action}
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
