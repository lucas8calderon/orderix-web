# FeatureCards Component

Um componente React moderno e elegante para exibir cards de funcionalidades do sistema Orderix.

## 🎨 Características

- **Design Moderno**: Cards com efeito glassmorphism e gradientes sutis
- **Ícones Lucide**: Ícones profissionais e consistentes
- **Animações Suaves**: Hover effects com elevação e brilho
- **Responsivo**: Layout adaptativo (3 colunas desktop, 1 mobile)
- **Acessível**: Componentes MUI com boa semântica
- **Performance**: Animações otimizadas com CSS transforms

## 🚀 Tecnologias

- **React 18+**
- **Material-UI (MUI) v5**
- **Lucide React** (ícones)
- **Styled Components** (estilização)
- **CSS-in-JS** (animações)

## 📦 Instalação

```bash
npm install @mui/material @emotion/react @emotion/styled lucide-react
```

## 💻 Uso Básico

```jsx
import React from 'react';
import FeatureCards from './FeatureCards';

function App() {
  return (
    <div>
      <h1>Funcionalidades do Sistema</h1>
      <FeatureCards />
    </div>
  );
}

export default App;
```

## 🎯 Funcionalidades Incluídas

1. **Módulo do Garçom** - Smartphone icon
2. **Mesas e Comandas** - ClipboardList icon  
3. **Balcão** - Monitor icon
4. **Pagamentos Integrados** - CreditCard icon
5. **Painel Administrativo** - BarChart3 icon
6. **Autoatendimento** - Users icon

## 🎨 Customização

### Cores
O componente usa a paleta de cores do Orderix:
- **Primária**: #7B3FF2 (roxo)
- **Secundária**: #B896F9 (lilás)
- **Texto**: #2D2D2D (cinza escuro)
- **Secundário**: #666666 (cinza médio)

### Animações
- **Fade In Up**: Cards aparecem com delay escalonado
- **Hover**: Elevação, rotação do ícone e brilho
- **Transições**: Cubic-bezier para suavidade

### Responsividade
- **Mobile** (< 768px): 1 coluna
- **Tablet** (768px - 1024px): 2 colunas  
- **Desktop** (> 1024px): 3 colunas

## 🔧 Estrutura do Componente

```
FeatureCards/
├── FeatureCards.jsx          # Componente principal
├── FeatureCardsDemo.jsx      # Demonstração
└── README-FeatureCards.md    # Documentação
```

## 📱 Exemplo de Uso Completo

```jsx
import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import FeatureCards from './FeatureCards';

const FeaturesPage = () => {
  return (
    <Box sx={{ padding: 4, background: '#F5F5F7' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" gutterBottom>
          Funcionalidades
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Tudo que você precisa para gerenciar seu restaurante
        </Typography>
        <FeatureCards />
      </Container>
    </Box>
  );
};

export default FeaturesPage;
```

## 🎨 Estilos Customizados

O componente usa styled-components para estilização avançada:

- **StyledCard**: Card principal com glassmorphism
- **IconContainer**: Container do ícone com gradiente
- **Animações**: Keyframes para fadeInUp e hover effects

## 📊 Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **CSS Transforms**: Animações otimizadas para GPU
- **Memoização**: Evita re-renders desnecessários
- **Bundle Size**: ~15KB gzipped

## 🐛 Troubleshooting

### Problemas Comuns

1. **Ícones não aparecem**: Verifique se lucide-react está instalado
2. **Animações travadas**: Verifique suporte a CSS transforms
3. **Layout quebrado**: Verifique se MUI está configurado corretamente

### Soluções

```bash
# Reinstalar dependências
npm install @mui/material @emotion/react @emotion/styled lucide-react

# Verificar versões
npm list @mui/material lucide-react
```

## 📄 Licença

Este componente faz parte do projeto Orderix e está sob a mesma licença do projeto principal.

## 🤝 Contribuição

Para contribuir com melhorias no componente:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

---

**Desenvolvido com ❤️ para o sistema Orderix**
