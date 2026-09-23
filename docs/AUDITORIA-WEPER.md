# Weper — auditoria e plano de redesign

Data: 23/09/2026. Fonte: código atual de `D:/workspace new/orderix-web`, incluindo alterações locais preexistentes. Esta é uma auditoria estática; verificação visual e testes são registrados separadamente. Não implica que todos os fluxos foram executados com backend real.

## 1. Mapa real do produto

| Área / rota | Objetivo e ação principal | Observações e prioridade |
| --- | --- | --- |
| `/app/dashboard` | Acompanhar faturamento, pedidos, ticket e agir sobre atrasos | Dados de `/dashboard/overview`; filtro de período distante dos KPIs; operação duplicada; estoque sem fonte. Alta |
| `/app/atendimento` | Abrir mesa/comanda, conferir pedidos e fechar conta | Mesas e comandas empilhadas; checkout real em `CheckoutDialog`; preservar cobranças, permissões e atualização após pagamento. Alta |
| `/app/cozinha` | Acompanhar e avançar preparo | Kanban, filtros, detalhes e drag-and-drop existentes; preservar atualização e transições de status. Alta |
| `/app/produtos` | Cadastrar, encontrar e editar produtos | Categorias inteiras antes dos produtos; filtros sem semântica de botão; ações repetidas por linha; sem paginação. Alta |
| Categorias / subcategorias | Organizar produtos e disponibilidade | Parte do catálogo, sem rota independente; seleção, edição e cadastro de produto vinculado precisam permanecer. Alta |
| `/app/colaboradores` | Cadastrar equipe e perfis | Layout próprio, cards altos, estilos globais de filtros colidem com catálogo; erro pode parecer lista vazia. Alta |
| `/app/garcom` | Orientar acesso ao aplicativo Android | Tela informativa real; não é um PDV web. Média |
| `/app/configuracoes/geral` | Encontrar configurações e completar cadastro | Hub já em desenvolvimento; preservar alterações locais. Alta |
| `operacao`, `horarios`, `taxas` | Horários, taxas e regras | Rotas de grupos e atalhos, não funcionalidades duplicadas. Alta |
| `vendas`, `pagamentos`, `integracoes` | Pagamentos e integrações | Mesmo formulário; preservar aliases e contratos de InfinitePay/Mercado Pago. Alta |
| `canais`, `delivery` | Entrega, retirada, publicação e taxas | Mesmo módulo, com testes existentes. Alta |
| `cardapio`, `cardapio-digital` | Publicação e QR Code | Atalho de estoque leva a rota sem tela no shell. Não publicar inventário fictício. Alta |
| `equipe`, `permissoes` | Configurar permissões | Preservar perfis e regras; sem criar novo cadastro paralelo. Alta |
| `empresa`, `aparencia` | Dados, marca e links para banner | Aparência encaminha a empresa/delivery. Média |
| `/admin/dashboard` | Monitorar lojas e assinaturas da plataforma | Separado da loja; histórico de receita produzido por `mockRevenueHistory`. Não apresentar estimativa como receita realizada. Alta |
| `/admin/restaurantes` | Cadastrar e editar lojas | Tabela desktop e cards mobile; formulário com credenciais e assinatura. Média |
| `/admin/planos` | Consultar distribuição por plano | Deriva valores das lojas; não confundir com relatórios da loja. Média |
| `/admin/assinaturas` | Identificar pendências e vencimentos | Tabelas e indicadores; uniformizar hierarquia. Média |
| `/admin/crm` | Gerir leads, funil e follow-ups | CRM da Weper, não clientes do restaurante; prospecção, contato, detalhes, lista e kanban. Alta |
| `/cardapio/:slug` | Consultar cardápio público | Contexto consumidor; manter dados e disponibilidade. Média |
| `/delivery/:slug` | Escolher produtos e concluir pedido | Carrinho, entrega/retirada, autenticação e pagamento; mudanças locais extensas, preservar. Alta |
| `/delivery/pedido/:publicToken` | Acompanhar pedido | Polling, timeline, status e contatos; testes existentes. Alta |
| `/delivery/:slug/conta` | Gerir perfil e endereços | Novo arquivo local; preservar validação e sessão. Média |
| `/delivery/:slug/conta/pedidos` | Consultar histórico | Estado sem sessão, carregamento, erro e histórico. Média |
| `/login`, `/forgot-password` | Acessar conta / orientação de recuperação | Recuperação é informativa, não existe formulário funcional. Média |
| `/subscription-blocked` | Entender bloqueio e próximo passo | Respeitar controle de acesso. Média |
| `/`, `/privacy`, `/terms` | Marketing e documentos públicos | Identidade comum; navegação e densidade diferentes do ERP. Baixa |
| `/demo`, `/demo/:slug` | Demonstrar compra com dados simulados | Simulação deliberada e isolada; não conectá-la a pedidos reais. Baixa |
| `/dashboard`, `/master/dashboard` | Redirecionamentos legados | Preservar. |

Arquivos não equivalem a funcionalidades entregues: `inventory/Inventory.js` e `financial/Financial.js` usam mocks e não são importados pelo shell; `checkout/Checkout.js` e `establishment/Establishment.js` são placeholders. Não há módulo autônomo de clientes, relatórios, PDV ou autoatendimento no mapa ativo. A constante `/app/estoque` existe nas permissões, mas não tem item/tela em `Dashboard.js`.

## 2. Problemas e inconsistências

- Shell: sino com número fixo 4 e sem ação; saída em texto clicável; sidebar recolhida sem identificação adequada; menu de configurações repete dez links além da navegação interna. AppBar sobrepõe largura do menu recolhido e tem camada acima do drawer móvel.
- Layout: múltiplos Containers aninhados; paddings de página variam; títulos de 24–34px; raio 4, 8, 12, 16px sem papéis claros; cards dentro de seções-cartão.
- Tokens MUI e CSS divergem em texto, borda, sucesso e warning. Cores literais e classes genéricas (`filter-chip`, `search-bar`) vazam entre módulos. Ícones MUI e Lucide coexistem em superfícies distintas; usar MUI no ERP sem adicionar biblioteca.
- Loading compartilhado usa altura 80vh e margens fixas de 80/160px; erro compartilhado diz “categorias” também em produtos. Estados vazios não distinguem cadastro inicial, filtro e falha.
- Dashboard: KPIs de moeda formatada são convertidos com Number para decidir se há movimento; isso pode ocultar comparação legítima. Período controla toda a resposta, mas fica dentro do gráfico. Estoque “sem movimentação” não é evidência real. Há cinco mini-KPIs e quatro cards repetindo operação.
- Catálogo: produtos ficam após toda a árvore de categorias; botões de filtro são divs; cards de categoria selecionáveis não têm alternativa por teclado; observações longas aumentam todas as linhas.
- Formulários: padrões diferentes de título, ações e imagens; produto não tem estoque real — não adicionar campos fictícios. Preservar categoria obrigatória, disponibilidade, upload/compressão e preço.
- Configurações: hub, submenu lateral e abas disputam orientação; atalho estoque não funciona; microcopy inclui implementação (“uploads já existentes”, “segundo formulário”).
- Acessibilidade: ausência de foco global consistente, cabeçalhos sem h1, ícones sem nomes em algumas ações, tabs manuais sem navegação por setas.
- Performance: CRA/React 18, MUI/Emotion, Recharts e duas bibliotecas de ícones já instaladas. Shell importa módulos da loja de forma síncrona. Nenhuma dependência nova necessária para o redesign.

## 3. Arquitetura proposta

Loja, preservando URLs e filtros de permissões:

```
Visão geral → Dashboard
Operação → Atendimento (Mesas | Comandas), Cozinha, Garçom (apenas perfil existente)
Gestão → Catálogo (Produtos | Categorias), Colaboradores
Sistema → Configurações
  navegação local: Geral, Operação, Pagamentos, Canais, Cardápio, Equipe, Empresa
```

Master mantém sua fronteira de autorização: Visão geral, Restaurantes, Planos, Assinaturas e CRM. Não mover CRM para a loja. Canais públicos mantêm navegação de consumidor. Agrupamentos são apresentação, não alterações de autorização.

## 4. Design System

- Inter existente; corpo 14–16px, apoio 12–13px, título de página 24px/32px, seção 18px/26px; números tabulares.
- Neutros predominantes; azul #2563EB, hover #1D4ED8, apoio #60A5FA/#93C5FD. Ações selecionadas em azul suave, status com texto e tons semânticos.
- Espaçamento 4/8/12/16/24/32; página 16px móvel, 24–32px desktop; largura útil 1600px; evitar container extra.
- Raio 6px compacto, 8px controles, 12px painéis/modais. Borda 1px; sombra apenas para elevação. Sem deslocamento vertical de cards ao passar mouse.
- Temas via tokens semânticos existentes + tokens de status e foco; não inverter cores nem sobrepor toda superfície com azul.
- Cabeçalho: título, descrição breve e ação principal; filtros abaixo. Tabs para tarefas irmãs. Tabelas com cabeçalhos neutros, valores alinhados e menu contextual.
- Diálogos com conteúdo rolável, ações acessíveis, identificação e largura adaptável. Estados de salvar/erro mantidos.
- Foco visível, área de toque adequada, reduced-motion, nomes acessíveis e semântica de navegação.

Componentes compartilhados a implementar onde houver repetição: PageHeader, EmptyState, RowActions, StatusBadge, PageTabs; reutilizar MUI Table, Dialog, Alert, Snackbar, Skeleton e controles. Não criar uma segunda biblioteca de componentes nem converter contratos de dados para caber no design.

## 5. Ordem incremental e validação

1. Auditoria + baseline de testes/build, preservando diff preexistente.
2. Tokens e componentes compartilhados; loading/erro e acessibilidade.
3. Shell com navegação agrupada, labels acessíveis, drawer móvel e cabeçalho consistente.
4. Dashboard: período no topo, operação enxuta, comparação correta, sem estoque fictício.
5. Catálogo: produtos/categorias em abas, filtros por teclado, ações contextuais, paginação, estados úteis e formulário agrupado.
6. Atendimento, mesas/comandas, cozinha e equipe: organização, estados e foco nas ações reais.
7. Configurações: uma navegação local, aliases preservados, atalho honesto de disponibilidade.
8. Master/CRM e superfícies públicas: revisão de consistência, dados demonstrativos identificados, estados e títulos.
9. Testes, lint existente via CRA/ESLint, build e verificação visual em 390/768/1024/1440 e claro/escuro quando acesso de teste permitir. Registrar o que foi realmente verificado.

Mudanças funcionais identificadas antes da implementação: corrigir comparação visual de métricas formatadas, remover contador fictício de notificações, encaminhar disponibilidade ao catálogo em vez de inventário mockado. Não mudar endpoints, DTOs, tenants, autenticação, pagamentos, transições de pedido ou inventário.

## 6. Limites para aceite

Não afirmar prontidão de produção com base só em build. Fluxos com backend exigem loja de teste e perfis reais, especialmente pagamentos e mudanças de status. Nada será enviado a clientes, nenhum pedido/pagamento será criado para fins de validação. Esta auditoria diferencia recursos reais, protótipos e alterações preexistentes.

Achado adicional na validação: CardTable e CardComanda exibiam botões Editar sem onClick e sem fluxo de edição associado. Serão retirados os controles inertes; cadastro, QR Code, consulta/fechamento e exclusão com confirmação permanecem. Os cards tinham botões aninhados no acionador de conta, a corrigir com ações independentes.
