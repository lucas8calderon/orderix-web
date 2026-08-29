import React, { useState } from 'react';
import { Box, Typography, Container, Button, Switch, FormControlLabel } from '@mui/material';

const PhoneMockupTest = () => {
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F5F5F7 0%, #FFFFFF 100%)',
        padding: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#2D2D2D',
              mb: 2,
              background: 'var(--gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Teste do Mockup do Celular
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto',
              mb: 3
            }}
          >
            Teste o mockup do celular com imagem real e placeholder
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={showPlaceholder}
                onChange={(e) => setShowPlaceholder(e.target.checked)}
                color="primary"
              />
            }
            label="Mostrar Placeholder (simular imagem não encontrada)"
            sx={{ mb: 3 }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <div className="hero-mockup">
            <div className="mockup-phone">
              <div className="phone-frame">
                <div className="phone-screen">
                  {showPlaceholder ? (
                    <div className="phone-placeholder">
                      <div className="placeholder-content">
                        <div className="placeholder-header">
                          <div className="placeholder-dot"></div>
                          <div className="placeholder-dot"></div>
                          <div className="placeholder-dot"></div>
                        </div>
                        <div className="placeholder-body">
                          <div className="placeholder-title">Weper App</div>
                          <div className="placeholder-subtitle">Sistema de Gestão</div>
                          <div className="placeholder-features">
                            <div className="placeholder-feature">📱 Módulo do Garçom</div>
                            <div className="placeholder-feature">🍽️ Gestão de Mesas</div>
                            <div className="placeholder-feature">💳 Pagamentos</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="iphone-mockup">
                      <div className="status-bar">
                        <div className="time">9:41</div>
                        <div className="status-icons">
                          <div className="signal"></div>
                          <div className="wifi"></div>
                          <div className="battery"></div>
                        </div>
                      </div>
                      <div className="app-content">
                        <img 
                          src="/images/mockups/1.png" 
                          alt="Weper App Interface"
                          className="app-screenshot"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="app-fallback" style={{ display: 'none' }}>
                          <div className="fallback-content">
                            <div className="fallback-icon">🍽️</div>
                            <div className="fallback-title">Weper App</div>
                            <div className="fallback-subtitle">Sistema de Gestão</div>
                          </div>
                        </div>
                      </div>
                      <div className="home-indicator"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1" sx={{ color: '#666666', mb: 2 }}>
            {showPlaceholder 
              ? "Modo Placeholder: Simulando imagem não encontrada" 
              : "Modo Normal: Tentando carregar imagem 1.png"
            }
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowPlaceholder(!showPlaceholder)}
            sx={{
              background: 'var(--gradient)',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600
            }}
          >
            Alternar Modo
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PhoneMockupTest;
