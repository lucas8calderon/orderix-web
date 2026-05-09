import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import FeatureCards from './FeatureCards';
import '../styles/FeaturesSection.css';

const FeaturesSection = () => {
  return (
    <Box
      component="section"
      id="products"
      sx={{
        padding: { xs: '60px 1rem', md: '80px 2rem' },
        background: 'linear-gradient(135deg, #F5F5F7 0%, #FFFFFF 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: 'center',
            marginBottom: { xs: 3, md: 5 }
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#2D2D2D',
              marginBottom: 2,
              letterSpacing: '-0.02em'
            }}
          >
            Funcionalidades
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666666',
              fontSize: { xs: '1rem', md: '1.1rem' },
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Tudo que você precisa para gerenciar seu restaurante de forma profissional
          </Typography>
        </Box>
        
        <FeatureCards />
      </Container>
    </Box>
  );
};

export default FeaturesSection;
