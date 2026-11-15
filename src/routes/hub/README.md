# Weper Hub

Hub de links oficial da Weper, inspirado no Linktree mas com identidade visual própria e foco em conversão comercial.

**URL:** `https://www.weper.com.br/links`

## 📋 Visão Geral

O Weper Hub centraliza os principais destinos comerciais da Weper em uma página moderna, rápida e intuitiva, ideal para uso na bio do Instagram, campanhas publicitárias e materiais de divulgação.

## 🎯 Objetivos

- Centralizar links de forma profissional
- Direcionar visitantes para demonstrações
- Facilitar contato via WhatsApp
- Apresentar planos e preços
- Promover o programa de parceiros
- Otimizar conversão comercial

## 🏗️ Arquitetura

### Componentes

- **`WeperHub.js`**: Componente principal da página
- **`HubHeader.js`**: Cabeçalho com logo e introdução
- **`HubLinkCard.js`**: Card individual de link
- **`HubDemoModal.js`**: Modal de demonstrações
- **`HubFooter.js`**: Rodapé da página

### Configuração

- **`hubConfig.js`**: Configuração centralizada de links e demonstrações
- **`hubAnalytics.js`**: Sistema de rastreamento de eventos

### Estilos

- **`Hub.css`**: Estilos dedicados do Hub
- Utiliza tokens CSS do tema Weper (`theme.css`)
- Suporta tema claro e escuro
- Responsivo mobile-first

## 🔗 Links Disponíveis

### Link Principal (Featured)
- **Conheça a Weper**: Direciona para a home do site

### Links Secundários
1. **Funcionalidades**: Âncora para seção de funcionalidades
2. **Demonstrações interativas**: Abre modal com opções
3. **Planos e preços**: Âncora para seção de planos (com indicação "A partir de R$ 39,90/mês")
4. **Seja um parceiro**: Direciona para programa de parceiros
5. **Fale com nossa equipe**: Link direto para WhatsApp (com destaque verde)

## 🎨 Demonstrações

O modal apresenta demonstrações em grid (2 colunas no desktop):

1. **Hamburgueria**: `/demo/weper-burger`
2. **Pizzaria**: `/demo/weper-pizza`
3. **Açaí**: `/delivery/acai`
4. **Pastelaria**: `/demo/weper-pastel`

## 📊 Analytics

Todos os eventos são integrados ao sistema de analytics existente da Weper.

### Eventos Rastreados

| Evento | Descrição | Propriedades |
|--------|-----------|--------------|
| `hub_page_view` | Acesso ao Hub | `page_path`, `page_title` |
| `hub_link_click` | Clique em card genérico | `link_id`, `link_name`, `destination_url` |
| `hub_modal_open` | Abertura de modal | `modal_type` |
| `hub_demo_click` | Clique em demonstração | `link_id`, `link_name`, `destination_url` |
| `hub_whatsapp_click` | Clique no WhatsApp | `link_id`, `link_name` |
| `hub_plans_click` | Clique em planos | `link_id`, `link_name` |
| `hub_partner_click` | Clique em parceiros | `link_id`, `link_name` |

### Integração

- Utiliza `analyticsService.js` existente
- Respeita consentimento de cookies
- Preserva parâmetros UTM
- Rastreia antes da navegação externa

## 🎨 Identidade Visual

### Paleta

- **Primário**: `#2563EB` (azul Weper)
- **Fundo**: `#F8FAFC` (light) / `#0B1220` (dark)
- **Surface**: `#FFFFFF` (light) / `#121A2B` (dark)
- **Destaque WhatsApp**: `#25D366`

### Características

- Cards com bordas discretas e sombras suaves
- Card principal com gradiente azul
- Card WhatsApp com destaque verde sutil
- Animações de hover discretas
- Ícones da biblioteca Lucide
- Layout minimalista e clean

## 📱 Responsividade

### Mobile (< 768px)
- Layout de coluna única
- Cards com largura total
- Espaçamento otimizado para toque
- Modal adaptado

### Tablet (768px - 1024px)
- Conteúdo centralizado
- Cards mais espaçados
- Modal em grid 2 colunas

### Desktop (> 1024px)
- Largura máxima de 720px
- Espaçamento generoso
- Hover effects

## ♿ Acessibilidade

- Navegação por teclado
- Estados de foco visíveis
- ARIA labels e roles
- Semântica HTML correta
- Suporte a `prefers-reduced-motion`
- Fechamento de modal com Escape
- Bloqueio de scroll do body

## 🔧 Configuração

### Adicionar Novo Link

Edite `hubConfig.js`:

```javascript
{
  id: 'novo-link',
  title: 'Título',
  description: 'Descrição',
  icon: IconeDaLucide,
  url: '/destino',
  type: 'external', // ou 'modal'
  active: true,
  order: 7, // ordem de exibição
}
```

### Adicionar Nova Demonstração

Edite `DEMO_OPTIONS` em `hubConfig.js`:

```javascript
{
  id: 'weper-nova',
  name: 'Nome do Estabelecimento',
  description: 'Descrição curta',
  url: '/demo/slug',
  active: true,
}
```

## 🧪 Testes

```bash
npm test -- --testPathPattern=hub
```

Testes cobrem:
- Configuração de links
- Demonstrações ativas
- Eventos de analytics
- Propriedades obrigatórias

## 🚀 Deploy

O Hub é parte do build padrão do projeto:

```bash
npm run build
```

A rota `/links` é pública e não requer autenticação.

## 📝 SEO

- **Título**: "Weper | Links Oficiais"
- **Descrição**: Meta description otimizada
- **Canonical**: `https://www.weper.com.br/links`
- Open Graph e Twitter Cards configurados
- Path incluído em `isCommercialPath` para analytics

## 🔒 Segurança

- Não expõe dados sensíveis
- Links externos abrem em nova aba
- Sanitização de URLs no analytics
- Não requer autenticação

## 📚 Referências

- Configuração: `hubConfig.js`
- Analytics: `hubAnalytics.js`
- Rotas: `src/services/accessControl.js`
- Tema: `src/theme/theme.css`
- Demonstrações: `src/routes/demo/demoStores.js`

## 🎯 Próximas Melhorias

Possíveis evoluções futuras (não implementadas nesta versão):

- [ ] Painel administrativo para gerenciar links
- [ ] A/B testing de ordem de links
- [ ] Relatórios de cliques por origem
- [ ] QR code para download
- [ ] Compartilhamento social integrado
- [ ] Variações de página por campanha
