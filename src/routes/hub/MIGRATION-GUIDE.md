# Guia de Migração: Hub Antigo → Hub Redesignado

## 📊 Comparação Estrutural

### ANTES (Hub Original)

```
┌─────────────────────────────────┐
│ Logo + Slogan                   │
│ Título + Descrição              │
├─────────────────────────────────┤
│                                 │
│    HERO CARD (grande)           │
│    "Conheça a Weper"            │
│    [Acessar o site]             │
│                                 │
├─────────────────────────────────┤
│ Card: Funcionalidades           │
├─────────────────────────────────┤
│ Card: Demonstrações             │
├─────────────────────────────────┤
│ Card: Planos e preços           │
├─────────────────────────────────┤
│ Card: Parceiros                 │
├─────────────────────────────────┤
│ Card: WhatsApp (destaque)       │
├─────────────────────────────────┤
│ Explore por Segmento            │
│ [5 cards horizontais]           │
├─────────────────────────────────┤
│ © 2026 Weper                    │
│ www.weper.com.br                │
└─────────────────────────────────┘
```

---

### DEPOIS (Hub Redesignado)

```
┌─────────────────────────────────┐
│ 🟢 Online    [WhatsApp] [Share] │
│                                 │
│           [Logo 48px]           │
│            Weper                │
│    "Do pedido ao resultado"     │
│                                 │
│  Tudo que seu negócio precisa   │
│      para vender mais.          │
│                                 │
│  🍔  🍕  🍨  🍱  🍽️              │
├─────────────────────────────────┤
│                                 │
│    [BANNER CLICÁVEL]            │
│  Simplifique a gestão do seu    │
│      estabelecimento            │
│                                 │
├──────────────┬──────────────────┤
│ Demonst.     │ Funcional.       │
│ [Play]       │ [Grid]           │
├──────────────┴──────────────────┤
│        Acesso rápido            │
├─────────────────────────────────┤
│ [💰] Planos e preços            │
│      A partir de R$ 39,90       │
├─────────────────────────────────┤
│ [👥] Seja um parceiro           │
├─────────────────────────────────┤
│ [📅] Agendar demonstração       │
├─────────────────────────────────┤
│ [🎧] Suporte ao cliente         │
├─────────────────────────────────┤
│                                 │
│  💬 Fale com nossa equipe       │
│     Tire suas dúvidas pelo      │
│          WhatsApp        [→]    │
│                                 │
├─────────────────────────────────┤
│ [Copiar link] [Share]           │
│                                 │
│ © 2026 Weper. Do pedido ao      │
│          resultado.             │
└─────────────────────────────────┘
```

---

## 🔄 Mapeamento de Componentes

### Cabeçalho

| ANTES | DEPOIS | Mudança |
|-------|--------|---------|
| Logo + slogan simples | Logo + nome + slogan + ícones | ✅ Expandido |
| - | Indicador "Atendimento Online" | ✨ Novo |
| - | Botões WhatsApp e Compartilhar | ✨ Novo |
| - | Linha de ícones de segmento | ✨ Novo |

### Banner/Hero

| ANTES | DEPOIS | Mudança |
|-------|--------|---------|
| Hero card com CTA interno | Banner de imagem clicável | ✅ Redesenhado |
| Mockup como decoração | Banner completo como asset | ✅ Otimizado |
| Botão "Acessar o site" | Banner inteiro clicável | ✅ Melhor UX |

### Cards Principais

| ANTES | DEPOIS | Mudança |
|-------|--------|---------|
| Lista vertical (5 cards) | 2 colunas (cards destaque) | ✅ Reorganizado |
| Todos mesmo peso visual | Destaques + acesso rápido | ✅ Hierarquia |
| - | Seção "Acesso rápido" | ✨ Nova |

### Card WhatsApp

| ANTES | DEPOIS | Mudança |
|-------|--------|---------|
| Verde básico | Verde gradiente premium | ✅ Melhorado |
| Seta simples | Botão circular verde | ✅ Destaque |
| Mesma altura dos outros | Mais alto e destacado | ✅ Priorizado |

### Segmentos

| ANTES | DEPOIS | Mudança |
|-------|--------|---------|
| Seção separada no final | Ícones no header | ✅ Movido |
| 5 cards horizontais | 5 ícones emoji | ✅ Simplificado |

### Rodapé

| ANTES | DEPOIS | Mudança |
|-------|--------|---------|
| Apenas copyright + link | Copyright + ações | ✅ Expandido |
| - | Botão copiar link | ✨ Novo |
| - | Botão compartilhar | ✨ Novo |

---

## 📦 Mudanças de Configuração

### hubConfig.js

**ANTES:**
```javascript
export const PRIMARY_LINK = {
  id: 'conhecer-weper',
  title: 'Conheça a Weper',
  // ... usado no hero card
};

export const SECONDARY_LINKS = [
  funcionalidades,
  demonstracoes,
  planos,
  parceiros,
  whatsapp
];
```

**DEPOIS:**
```javascript
// Novas estruturas organizadas
export const FEATURED_CARDS = [
  demonstracoes,      // order: 10
  funcionalidades,    // order: 20
];

export const QUICK_ACCESS_LINKS = [
  planos,            // order: 30
  parceiros,         // order: 40
  agendar,           // order: 50 (novo)
  conteudos,         // order: 60 (novo, desabilitado)
  suporte,           // order: 70 (novo)
];

export const WHATSAPP_CARD = {
  // Separado para destaque
  order: 80
};

// PRIMARY_LINK mantido para compatibilidade
export const PRIMARY_LINK = {
  // Agora representa o banner
};

// SECONDARY_LINKS mantido para compatibilidade
export const SECONDARY_LINKS = [
  ...FEATURED_CARDS,
  ...QUICK_ACCESS_LINKS,
  WHATSAPP_CARD
];
```

---

## 🎨 Mudanças de Estilo

### Cores

**Mantido:**
- Azul principal: `#2563EB` ✅
- Verde WhatsApp: `#25D366` ✅
- Cinza texto: `#64748B` ✅

**Melhorado:**
- Sombras: mais suaves e naturais
- Gradientes: WhatsApp card e banner
- Bordas: mais arredondadas (12px → 14-16px)

### Espaçamento

**ANTES:**
```css
.hub-container {
  gap: 20px;
}
.hub-links {
  gap: 10px;
}
```

**DEPOIS:**
```css
.hub-container {
  gap: 16px; /* mobile */
  gap: 20px; /* desktop */
}
.hub-featured-cards {
  gap: 10px; /* 2 colunas */
}
.hub-quick-access-list {
  gap: 8px; /* lista compacta */
}
```

### Animações

**ANTES:**
```css
transition: all 0.2s ease;
```

**DEPOIS:**
```css
transition: all 0.2s ease;
@media (prefers-reduced-motion: reduce) {
  transition: none; /* acessibilidade */
}
```

---

## 🔗 Mudanças de Analytics

### Eventos Mantidos

✅ Todos os eventos originais preservados:
- `hub_page_view`
- `hub_link_click`
- `hub_modal_open`
- `hub_demo_click`
- `hub_whatsapp_click`
- `hub_plans_click`
- `hub_partner_click`

### Eventos Novos

✨ Adicionados:
- Banner principal (trackado como `banner-principal`)
- Botões do header (WhatsApp e compartilhar)
- Botões do footer (copiar e compartilhar)

---

## 🚀 Como Reverter (Se Necessário)

### Opção 1: Git Revert

```bash
# Se commitado
git log --oneline -- src/routes/hub/
git revert <commit-hash>
```

### Opção 2: Backup Manual

Os arquivos originais estão no histórico do Git. Para restaurar:

```bash
# Ver versão anterior
git show HEAD~1:src/routes/hub/WeperHub.js

# Restaurar arquivo específico
git checkout HEAD~1 -- src/routes/hub/WeperHub.js
```

### Opção 3: Desabilitar Novo Layout

No `WeperHub.js`, importar e usar componentes antigos:

```javascript
// Temporariamente voltar ao layout antigo
import OldHubHeroCard from './components/HubHeroCard.old.js';
// etc...
```

---

## ✅ Checklist de Ativação

### Antes de fazer deploy:

- [ ] **Testar localmente**
  ```bash
  npm start
  # Abrir: http://localhost:3000/links
  ```

- [ ] **Validar no navegador do Instagram**
  - Compartilhar link interno no Instagram
  - Abrir no navegador interno
  - Verificar se banner não distorce

- [ ] **Testar em dispositivos reais**
  - iPhone (Safari)
  - Android (Chrome)
  - iPad (Safari)

- [ ] **Validar analytics**
  - Abrir console do navegador
  - Verificar eventos disparando
  - Conferir parâmetros corretos

- [ ] **Verificar links**
  - Todos os cards clicam
  - Modal de demos abre
  - WhatsApp abre com mensagem
  - Banner vai para home

- [ ] **Build de produção**
  ```bash
  REACT_APP_API_BASE_URL='https://api.weper.com.br' npm run build
  ```

- [ ] **Deploy**
  - (Aguardar autorização)
  - Seguir processo normal de deploy do projeto
  - Não executar automaticamente

---

## 📚 Documentação Adicional

### Arquivos de Referência

- `REDESIGN-SUMMARY.md` - Resumo completo das mudanças
- `VALIDATION-CHECKLIST.md` - Checklist de validação
- `MIGRATION-GUIDE.md` - Este documento

### Como Adicionar Novo Link

1. Abrir `src/routes/hub/hubConfig.js`
2. Adicionar à lista apropriada:
   - `FEATURED_CARDS` - destaque em 2 colunas
   - `QUICK_ACCESS_LINKS` - lista de acesso rápido
3. Definir `order` único (incremento de 10)
4. Testar localmente
5. Validar analytics

### Como Reativar "Conteúdos & Materiais"

```javascript
// Em hubConfig.js
{
  id: 'conteudos',
  title: 'Conteúdos & Materiais',
  description: 'Guias, tutoriais e novidades da Weper.',
  icon: BookOpen,
  url: 'https://www.weper.com.br/conteudos', // URL real
  type: 'external',
  active: true, // Mudar de false para true
  order: 60,
}
```

---

## 🎯 Resultado Esperado

Após o deploy, o Hub deve:
- ✅ Carregar em < 2 segundos
- ✅ Funcionar em todos os dispositivos
- ✅ Converter melhor (mais CTAs visíveis)
- ✅ Parecer mais profissional
- ✅ Manter todas as funcionalidades
- ✅ Trackear corretamente

---

**Data de criação:** 15 de novembro de 2026  
**Última atualização:** 15 de novembro de 2026  
**Status:** ✅ Pronto para produção
