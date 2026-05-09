import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { 
  Smartphone, 
  ClipboardList, 
  Monitor, 
  CreditCard, 
  BarChart3, 
  Users 
} from 'lucide-react';
import { styled } from '@mui/material/styles';

// Styled Card component with custom animations and effects
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(123, 63, 242, 0.1)',
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(123, 63, 242, 0.12)',
    border: '1px solid rgba(123, 63, 242, 0.2)',
    
    '& .icon-container': {
      transform: 'scale(1.05) rotate(2deg)',
      boxShadow: '0 6px 20px rgba(123, 63, 242, 0.25)',
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
    background: 'linear-gradient(90deg, #7B3FF2 0%, #B896F9 100%)',
    transformOrigin: 'left',
    transform: 'scaleX(0)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  }
}));

// Icon container with gradient background and glow effect
const IconContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '80px',
  height: '80px',
  margin: '0 auto 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #7B3FF2 0%, #B896F9 100%)',
  borderRadius: '50%',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 20px rgba(123, 63, 242, 0.2)',
  
}));

// Feature data with corresponding Lucide icons
const features = [
  {
    icon: Smartphone,
    title: 'Módulo do Garçom',
    description: 'Lançamento rápido de pedidos com interface intuitiva e responsiva para smartphones e tablets.',
    color: '#7B3FF2'
  },
  {
    icon: ClipboardList,
    title: 'Mesas e Comandas',
    description: 'Controle em tempo real de todas as mesas, comandas abertas e fechadas, com histórico completo.',
    color: '#B896F9'
  },
  {
    icon: Monitor,
    title: 'Balcão',
    description: 'Vendas rápidas e práticas para atendimento no balcão, com impressão automática de cupom fiscal.',
    color: '#7B3FF2'
  },
  {
    icon: CreditCard,
    title: 'Pagamentos Integrados',
    description: 'Integração com principais adquirentes e maquininhas do mercado, facilitando o processo de pagamento.',
    color: '#B896F9'
  },
  {
    icon: BarChart3,
    title: 'Painel Administrativo',
    description: 'Relatórios detalhados, gestão de estoque, controle de funcionários e muito mais em um só lugar.',
    color: '#7B3FF2'
  },
  {
    icon: Users,
    title: 'Autoatendimento',
    description: 'Tablet na mesa para que os clientes façam pedidos diretamente, sem precisar chamar o garçom.',
    color: '#B896F9'
  }
];

const FeatureCards = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        },
        gap: 3,
        padding: { xs: 2, md: 3 },
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        
        return (
          <StyledCard
            key={index}
            elevation={0}
            sx={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <CardContent
              sx={{
                padding: { xs: 3, md: 4 },
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <IconContainer className="icon-container">
                <IconComponent 
                  size={32} 
                  color="white"
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              </IconContainer>
              
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  color: '#2D2D2D',
                  marginBottom: 2,
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em'
                }}
              >
                {feature.title}
              </Typography>
              
              <Typography
                variant="body2"
                sx={{
                  color: '#666666',
                  fontSize: { xs: '0.9rem', md: '0.95rem' },
                  lineHeight: 1.6,
                  opacity: 0.9,
                  maxWidth: '280px',
                  margin: '0 auto'
                }}
              >
                {feature.description}
              </Typography>
            </CardContent>
          </StyledCard>
        );
      })}
    </Box>
  );
};

export default FeatureCards;
