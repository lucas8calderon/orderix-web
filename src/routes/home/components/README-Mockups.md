# Sistema de Mockups do Orderix App

Sistema completo de exibição de mockups responsivos e interativos para o site do Orderix.

## 🎨 Componentes Criados

### 1. **HeroMockup.jsx**
- Mockup flutuante do celular no Hero Section
- Animação de flutuação suave
- Design realista com notch e bordas arredondadas
- Responsivo para diferentes tamanhos de tela

### 2. **AppUsageSection.jsx**
- Seção "Como o Orderix Funciona"
- Cards lado a lado: Garçom e Cliente
- Mockups integrados com descrições
- Lista de funcionalidades para cada módulo

### 3. **MockupGallery.jsx**
- Galeria completa de todos os mockups
- Lightbox interativo com navegação
- Grid responsivo (4 colunas desktop, 1 mobile)
- Hover effects e animações

## 📱 Layout Responsivo

### **Desktop (> 1024px)**
- Hero: Mockup flutuante à direita
- App Usage: 2 colunas lado a lado
- Gallery: 4 colunas em grid

### **Tablet (768px - 1024px)**
- Hero: Mockup centralizado
- App Usage: 2 colunas empilhadas
- Gallery: 2 colunas em grid

### **Mobile (< 768px)**
- Hero: Mockup menor, centralizado
- App Usage: 1 coluna
- Gallery: 1 coluna

## 🎯 Funcionalidades

### **Interatividade**
- ✅ Hover com zoom suave
- ✅ Lightbox de alta resolução
- ✅ Navegação entre imagens
- ✅ Animações CSS otimizadas

### **Responsividade**
- ✅ Proporções mantidas em todas as telas
- ✅ Imagens otimizadas para web
- ✅ Suporte a 16:9 e 1:1
- ✅ Fallback para imagens não encontradas

### **Performance**
- ✅ Lazy loading das imagens
- ✅ Animações com GPU acceleration
- ✅ CSS transforms otimizados
- ✅ Bundle size reduzido

## 🖼️ Estrutura de Imagens

```
public/images/mockups/
├── 1.png              # App do Garçom (Smartphone)
├── 2-garcom.png       # Módulo do Garçom (Tablet)
├── mesa.png           # Autoatendimento (Tablet)
└── table.png          # Painel Administrativo (Desktop)
```

## 🎨 Estilo e Aesthetic

### **Cores**
- **Primária**: #7B3FF2 (roxo)
- **Secundária**: #B896F9 (lilás)
- **Background**: Gradiente branco → lilás-claro
- **Sombras**: Suaves e consistentes

### **Efeitos**
- **Glassmorphism**: Backdrop blur nos cards
- **Gradientes**: Bordas e backgrounds
- **Sombras**: Múltiplas camadas para profundidade
- **Animações**: Transições suaves e naturais

## 🔧 Uso dos Componentes

### **HeroMockup**
```jsx
import HeroMockup from './HeroMockup';

<HeroMockup />
```

### **AppUsageSection**
```jsx
import AppUsageSection from './AppUsageSection';

<AppUsageSection />
```

### **MockupGallery**
```jsx
import MockupGallery from './MockupGallery';

<MockupGallery />
```

## 📊 Dados dos Mockups

```javascript
const mockupData = [
  {
    id: 1,
    title: 'App do Garçom',
    description: 'Interface intuitiva para lançamento de pedidos',
    image: '/images/mockups/1.png',
    device: 'smartphone',
    category: 'garcom',
    aspectRatio: '9:16'
  },
  // ... outros mockups
];
```

## 🎭 Animações

### **HeroMockup**
- **Float**: Animação de flutuação contínua
- **Hover**: Elevação e escala
- **Fade In**: Aparição suave

### **AppUsageSection**
- **Hover**: Elevação dos cards
- **Image Zoom**: Zoom suave nas imagens
- **Arrow Movement**: Movimento das setas

### **MockupGallery**
- **Fade In Up**: Aparição escalonada
- **Hover**: Elevação e overlay
- **Lightbox**: Transições suaves

## 📱 Breakpoints

```css
/* Mobile */
@media (max-width: 768px) { ... }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

## 🚀 Performance

- **Lazy Loading**: Imagens carregadas sob demanda
- **CSS Transforms**: Animações otimizadas para GPU
- **Memoização**: Evita re-renders desnecessários
- **Bundle Size**: ~25KB gzipped

## 🐛 Troubleshooting

### **Imagens não carregam**
- Verifique se as imagens estão em `public/images/mockups/`
- Confirme os nomes dos arquivos
- Verifique permissões de acesso

### **Animações travadas**
- Verifique suporte a CSS transforms
- Teste em diferentes navegadores
- Verifique se há conflitos de CSS

### **Layout quebrado**
- Verifique se MUI está configurado
- Confirme breakpoints responsivos
- Teste em diferentes resoluções

## 📄 Licença

Este sistema faz parte do projeto Orderix e está sob a mesma licença do projeto principal.

---

**Desenvolvido com ❤️ para o Orderix App**
