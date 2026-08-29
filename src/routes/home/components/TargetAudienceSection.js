import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Coffee, 
  Cone, 
  Cookie, 
  CircleDot, 
  UtensilsCrossed,
  Store, 
  Wine 
} from 'lucide-react';

// Styled components para os cards
const TargetCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(37, 99, 235, 0.1)',
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  height: '100%',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.12)',
    border: '1px solid rgba(37, 99, 235, 0.2)',
    
    '& .icon-container': {
      transform: 'scale(1.05) rotate(2deg)',
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
    },
    
    '& .icon-glow': {
      opacity: 1,
      transform: 'scale(1.2)',
    },
    
    '&::before': {
      transform: 'scaleX(1)',
    }
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'var(--gradient)',
    transformOrigin: 'left',
    transform: 'scaleX(0)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  }
}));

const IconContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'var(--gradient)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)',
  color: '#FFFFFF',
  
  '& .icon-glow': {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.6) 0%, transparent 70%)',
    opacity: 0,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'scale(0.8)',
  },
  
  '& svg': {
    zIndex: 1,
    width: '40px',
    height: '40px',
  }
}));

const TargetAudienceSection = () => {
  const targets = [
    {
      icon: Cookie,
      title: 'Hamburgueria',
      description: 'Gestão completa para hamburguerias de todos os tamanhos'
    },
    {
      icon: Coffee,
      title: 'Cafeterias',
      description: 'Controle de vendas e estoque para cafeterias e bistrôs'
    },
    {
      icon: Cone,
      title: 'Sorveterias',
      description: 'Solução especializada para sorveterias e docerias'
    },
    {
      icon: CircleDot,
      title: 'Pastelaria',
      description: 'Sistema ideal para pastéis e lanchonetes'
    },
    {
      icon: UtensilsCrossed,
      title: 'Restaurantes',
      description: 'Gestão completa para restaurantes de todos os estilos'
    },
    {
      icon: Store,
      title: 'Lanchonetes',
      description: 'Controle total para lanchonetes e fast food'
    },
    {
      icon: Wine,
      title: 'Adegas',
      description: 'Gestão especializada para adegas e barras'
    },
    {
      icon: UtensilsCrossed,
      title: 'Bares',
      description: 'Sistema completo para bares e pubs'
    }
  ];

  return (
    <Box
      component="section"
      id="target"
      sx={{
        padding: { xs: '60px 1rem', md: '80px 2rem' },
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F7 100%)',
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
            Para quem o sistema Weper é indicado?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666666',
              fontSize: { xs: '1rem', md: '1.1rem' },
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Solução completa para diferentes tipos de estabelecimentos
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center">
          {targets.map((target, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <TargetCard sx={{ animationDelay: `${index * 0.1}s` }}>
                <IconContainer className="icon-container">
                  <Box className="icon-glow" />
                  <target.icon />
                </IconContainer>
                <CardContent sx={{ padding: 0 }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#2D2D2D', 
                      mb: 1.5, 
                      fontSize: { xs: '1.15rem', md: '1.25rem' } 
                    }}
                  >
                    {target.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666666', 
                      lineHeight: 1.6, 
                      fontSize: { xs: '0.9rem', md: '1rem' } 
                    }}
                  >
                    {target.description}
                  </Typography>
                </CardContent>
              </TargetCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TargetAudienceSection;

