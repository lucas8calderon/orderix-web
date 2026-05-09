import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Fab, Typography } from '@mui/material';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = styled(Fab)(({ theme }) => ({
  background: 'linear-gradient(135deg, #25D366 0%, #20BA5A 100%)',
  color: '#FFFFFF',
  width: '64px',
  height: '64px',
  boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-4px) scale(1.05)',
    boxShadow: '0 12px 30px rgba(37, 211, 102, 0.5)',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
  },
  
  '&:active': {
    transform: 'translateY(-2px) scale(0.98)',
  },
  
  '@media (max-width: 768px)': {
    width: '56px',
    height: '56px',
  }
}));

const Pulse = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: '#25D366',
  animation: 'pulse 2s infinite',
  
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.3)',
      opacity: 0.5,
    },
    '100%': {
      transform: 'scale(1.6)',
      opacity: 0,
    },
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  
  '@media (max-width: 768px)': {
    bottom: 20,
    right: 20,
  }
}));

const HelpText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#2D2D2D',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '8px 12px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  whiteSpace: 'nowrap',
  
  '@media (max-width: 768px)': {
    fontSize: '0.75rem',
    padding: '6px 10px',
  }
}));

const FloatWhatsAppButton = () => {
  const handleClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de tirar algumas dúvidas sobre o sistema Orderix.');
    const whatsappUrl = `https://wa.me/5511977844172?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <ButtonContainer>
      <Box sx={{ position: 'relative' }}>
        <Pulse />
        <WhatsAppButton 
          onClick={handleClick}
          aria-label="Enviar mensagem no WhatsApp"
        >
          <MessageCircle size={28} />
        </WhatsAppButton>
      </Box>
      <HelpText>
        Fale conosco
      </HelpText>
    </ButtonContainer>
  );
};

export default FloatWhatsAppButton;

