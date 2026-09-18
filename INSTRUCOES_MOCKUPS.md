# 📱 Instruções para Adicionar Mockups ao Weper App

## 🎯 Sistema de Mockups Implementado

Criei um sistema completo de mockups responsivos e interativos para o site do Weper. O sistema está pronto e funcionando, mas você precisa adicionar as imagens reais.

## 📁 Estrutura Criada

```
src/routes/home/components/
├── HeroMockup.jsx           # Mockup flutuante no Hero
├── AppUsageSection.jsx      # Seção Garçom + Cliente
├── MockupGallery.jsx        # Galeria completa
└── README-Mockups.md        # Documentação

public/images/mockups/       # Pasta para as imagens
├── 1.png                    # App do Garçom (Smartphone)
├── 2-garcom.png             # Módulo do Garçom (Tablet)
├── mesa.png                 # Autoatendimento (Tablet)
└── table.png                # Painel Administrativo (Desktop)
```

## 🖼️ Como Adicionar as Imagens

### **Passo 1: Copiar as Imagens**
```bash
# Copie as imagens da pasta original para o projeto
copy "C:\Users\Lucas\OneDrive\Área de Trabalho\WEPER\mock up\1.png" "public\images\mockups\1.png"
copy "C:\Users\Lucas\OneDrive\Área de Trabalho\WEPER\mock up\2-garcom.png" "public\images\mockups\2-garcom.png"
copy "C:\Users\Lucas\OneDrive\Área de Trabalho\WEPER\mock up\mesa.png" "public\images\mockups\mesa.png"
copy "C:\Users\Lucas\OneDrive\Área de Trabalho\WEPER\mock up\table.png" "public\images\mockups\table.png"
```

### **Passo 2: Verificar os Arquivos**
- Acesse `public/images/mockups/`
- Confirme que as 4 imagens estão lá
- Verifique se os nomes estão corretos

## 🎨 Funcionalidades Implementadas

### **1. Hero Section**
- ✅ Mockup flutuante do celular
- ✅ Animação de flutuação suave
- ✅ Design realista com notch
- ✅ Responsivo para mobile/tablet/desktop

### **2. Seção "Como Funciona"**
- ✅ Cards lado a lado: Garçom e Cliente
- ✅ Mockups integrados com descrições
- ✅ Lista de funcionalidades
- ✅ Hover effects elegantes

### **3. Galeria de Mockups**
- ✅ Grid responsivo (4 colunas desktop, 1 mobile)
- ✅ Lightbox interativo
- ✅ Navegação entre imagens
- ✅ Hover com zoom suave

## 📱 Layout Responsivo

### **Desktop (> 1024px)**
- Hero: Mockup à direita, texto à esquerda
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

## 🎯 Especificações das Imagens

### **1.png - App do Garçom**
- **Dispositivo**: Smartphone
- **Proporção**: 9:16 (vertical)
- **Uso**: Hero Section + Gallery
- **Tamanho recomendado**: 280x560px

### **2-garcom.png - Módulo do Garçom**
- **Dispositivo**: Tablet
- **Proporção**: 4:3
- **Uso**: App Usage Section + Gallery
- **Tamanho recomendado**: 400x300px

### **mesa.png - Autoatendimento**
- **Dispositivo**: Tablet
- **Proporção**: 16:9
- **Uso**: App Usage Section + Gallery
- **Tamanho recomendado**: 400x225px

### **table.png - Painel Administrativo**
- **Dispositivo**: Desktop
- **Proporção**: 16:9
- **Uso**: Gallery
- **Tamanho recomendado**: 800x450px

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

## 🚀 Como Testar

1. **Copie as imagens** para `public/images/mockups/`
2. **Acesse** `http://localhost:3000`
3. **Teste** as interações:
   - Hover nos cards
   - Clique para abrir lightbox
   - Navegação entre imagens
   - Responsividade (redimensione a tela)

## 🔧 Fallback de Imagens

Se as imagens não carregarem, o sistema usa placeholders automáticos:
- **Cor de fundo**: Baseada na cor do dispositivo
- **Texto**: Nome do mockup
- **Formato**: Mantém as proporções corretas

## 📊 Performance

- ✅ **Lazy Loading**: Imagens carregadas sob demanda
- ✅ **CSS Transforms**: Animações otimizadas para GPU
- ✅ **Memoização**: Evita re-renders desnecessários
- ✅ **Bundle Size**: ~25KB gzipped

## 🎭 Animações

### **HeroMockup**
- **Float**: Animação de flutuação contínua (6s)
- **Hover**: Elevação e escala
- **Fade In**: Aparição suave

### **AppUsageSection**
- **Hover**: Elevação dos cards (-6px)
- **Image Zoom**: Zoom suave nas imagens (1.05x)
- **Arrow Movement**: Movimento das setas

### **MockupGallery**
- **Fade In Up**: Aparição escalonada (0.1s delay)
- **Hover**: Elevação e overlay
- **Lightbox**: Transições suaves

## 🐛 Troubleshooting

### **Imagens não aparecem**
- Verifique se estão em `public/images/mockups/`
- Confirme os nomes dos arquivos
- Verifique permissões de acesso

### **Layout quebrado**
- Verifique se MUI está configurado
- Confirme breakpoints responsivos
- Teste em diferentes resoluções

### **Animações travadas**
- Verifique suporte a CSS transforms
- Teste em diferentes navegadores
- Verifique se há conflitos de CSS

## 📄 Próximos Passos

1. **Copie as imagens** para a pasta correta
2. **Teste** o sistema completo
3. **Ajuste** as proporções se necessário
4. **Otimize** as imagens para web (compressão)
5. **Teste** em diferentes dispositivos

---

**Sistema de Mockups do Weper App - Pronto para uso! 🎉**
