import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  MessageCircle, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  QrCode,
  Box as BoxIcon,
  Utensils,
  BarChart3,
  Monitor
} from 'lucide-react';

// Styled components para os cards
const FeatureCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  height: '100%',
  
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 30px rgba(139, 92, 246, 0.25)',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    background: 'rgba(255, 255, 255, 1)',
    
    '& .icon-container': {
      transform: 'scale(1.1)',
      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
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
  width: '60px',
  height: '60px',
  borderRadius: '16px',
  background: 'var(--gradient)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)',
  color: '#FFFFFF',
  
  '& svg': {
    width: '28px',
    height: '28px',
  }
}));

const FeaturesListSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Chatbot',
      description: 'Atendimento automatizado para seus clientes via chat inteligente'
    },
    {
      icon: TrendingUp,
      title: 'DRE',
      description: 'Demonstração do Resultado do Exercício para análise financeira'
    },
    {
      icon: FileText,
      title: 'Emissão de NFe e NFCe',
      description: 'Geração automática de notas fiscais eletrônicas'
    },
    {
      icon: CreditCard,
      title: 'Contas a Pagar',
      description: 'Gestão completa de pagamentos e controle financeiro'
    },
    {
      icon: Monitor,
      title: 'Autoatendimento',
      description: 'Sistema de comanda com QR Code para pedidos pelo celular'
    },
    {
      icon: BoxIcon,
      title: 'Contagem de Estoque',
      description: 'Controle total do estoque com alertas e relatórios'
    },
    {
      icon: QrCode,
      title: 'Cardápio Digital e QR',
      description: 'Menu interativo para os clientes escanearem'
    },
    {
      icon: BarChart3,
      title: 'Relatórios e Indicadores',
      description: 'Dashboards completos com métricas do seu negócio'
    },
    {
      icon: Utensils,
      title: 'Sistema KDS',
      description: 'Kitchen Display System para organizar pedidos na cozinha'
    }
  ];

  return (
    <Box
      component="section"
      id="features"
      sx={{
        padding: { xs: '60px 1rem', md: '80px 2rem' },
        background: 'var(--gradient)',
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
              color: '#FFFFFF',
              marginBottom: 2,
              letterSpacing: '-0.02em'
            }}
          >
            Descubra tudo o que você pode fazer com nosso software
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '1rem', md: '1.1rem' },
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Funcionalidades completas para modernizar seu estabelecimento
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard sx={{ animationDelay: `${index * 0.1}s` }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <IconContainer className="icon-container">
                    <feature.icon />
                  </IconContainer>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2D2D2D', 
                        mb: 1,
                        fontSize: { xs: '1.15rem', md: '1.3rem' } 
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#555555', 
                        lineHeight: 1.6, 
                        fontSize: { xs: '1rem', md: '1.05rem' },
                        fontWeight: 400
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesListSection;

