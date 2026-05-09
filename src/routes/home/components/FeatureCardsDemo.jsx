import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import FeatureCards from './FeatureCards';

/**
 * Componente de demonstração do FeatureCards
 * Mostra como usar o componente de forma independente
 */
const FeatureCardsDemo = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F5F5F7 0%, #FFFFFF 100%)',
        padding: 4
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(123, 63, 242, 0.1)'
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              color: '#2D2D2D',
              marginBottom: 2,
              background: 'linear-gradient(135deg, #7B3FF2 0%, #B896F9 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            FeatureCards Component
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              color: '#666666',
              marginBottom: 4,
              maxWidth: '600px',
              margin: '0 auto 3rem'
            }}
          >
            Cards modernos e responsivos para funcionalidades do sistema Orderix
          </Typography>
          
          <FeatureCards />
          
          <Box
            sx={{
              marginTop: 4,
              padding: 3,
              background: 'rgba(123, 63, 242, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(123, 63, 242, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ color: '#7B3FF2', marginBottom: 2 }}>
              Características do Componente:
            </Typography>
            <Box component="ul" sx={{ color: '#666666', paddingLeft: 2 }}>
              <li>Ícones Lucide React com animações suaves</li>
              <li>Design glassmorphism com backdrop blur</li>
              <li>Animações de hover com elevação e brilho</li>
              <li>Layout responsivo (3 colunas desktop, 1 mobile)</li>
              <li>Gradientes e sombras modernas</li>
              <li>Tipografia otimizada e hierarquia visual clara</li>
              <li>Componentes MUI estilizados com styled-components</li>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default FeatureCardsDemo;
