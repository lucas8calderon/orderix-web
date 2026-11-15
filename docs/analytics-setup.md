# Analytics comercial da Weper

Este guia cobre a medição do site institucional: visita, planos, contratação e assinatura paga. O código já está no `orderix-web`. Nenhuma conta de Google ou Clarity foi criada por esta implementação, e nada disso publica o site.

Os scripts externos só entram no domínio de produção (`weper.com.br` e `www.weper.com.br`), depois do consentimento de estatística, e somente se o identificador correspondente estiver preenchido. Identificador vazio não quebra a página.

## O que medir

| Evento | Quando dispara | Parâmetros principais | Para onde vai |
|---|---|---|---|
| `page_view` | Troca de rota nas páginas institucionais | `page_path`, `page_location` sem dados pessoais, origem da campanha | `dataLayer` → GTM → GA4 |
| `plans_view` | Pelo menos metade da seção `#plans` visível, ou o card de preço quando a seção não cabe na tela. Uma vez por sessão e página | `source_section=homepage_plans` | `dataLayer` → GTM → GA4 |
| `plans_cta_click` | Clique num link para `#plans`. Não significa que a pessoa viu os planos | `source_section` | `dataLayer` → GTM → GA4 |
| `plan_selected` | Clique em "Assinar esta faixa" ou troca da faixa em `/contratar` | `plan_id`, `plan_name`, `plan_price`, `currency`, `source_section` | `dataLayer` → GTM → GA4 |
| `begin_checkout` | A API criou a tentativa (`signupId`) | plano, valor, `signup_id`, campanha | `dataLayer` → GTM → GA4 |
| `whatsapp_click` | Abertura do WhatsApp da Weper | `source_path` | `dataLayer` → GTM → GA4 |
| `generate_lead` | Preparado para um formulário comercial. O site público não tem esse formulário hoje | `form_id` | `dataLayer` → GTM → GA4 |
| `purchase` | Status público da contratação com `paid: true`, só na primeira assinatura | `transaction_id` (id da tentativa), plano, valor, `acquisition=first_subscription` | `dataLayer` → GTM → GA4 |

O Meta Pixel continua separado, só com consentimento de marketing, nos caminhos que já usava (`/`, `/demo`, `/contratar`). Ele não é um segundo envio ao GA4.

Não vão para essas ferramentas: e-mail, telefone, CPF, CNPJ, nome, cartão, CVV, código Pix, token ou o código de indicação do parceiro. O programa de parceiros segue em `?ref=` e no campo da contratação, sem alteração.

## Variáveis

Preencher no serviço **weper-production-web** da Render, e gerar um build novo. Não colocar segredo de API em variável `REACT_APP_`.

| Variável | Onde é usada | Exemplo |
|---|---|---|
| `REACT_APP_GTM_CONTAINER_ID` | Frontend. Único script do GA4 | `GTM-XXXXXXX` |
| `REACT_APP_GA4_MEASUREMENT_ID` | Não vira script. Conferência e configuração da tag no GTM | `G-XXXXXXXX` |
| `REACT_APP_CLARITY_PROJECT_ID` | Frontend, só em produção | id do projeto Clarity |
| `REACT_APP_CLARITY_ENABLED` | `true` libera o Clarity também em localhost. Sem isso, desenvolvimento não grava sessão | vazio |
| `REACT_APP_ANALYTICS_DEBUG` | `true` libera o GTM fora de produção. Não usar no build de produção com o contêiner real de outro ambiente | vazio |
| `REACT_APP_ANALYTICS_DISABLED` | `true` desliga a coleta | vazio |

Homologação (`staging`, `*.onrender.com`) não carrega GTM nem Clarity. Pagamento de teste (`PLAN_TEST`) não gera `begin_checkout` nem `purchase`.

O Measurement Protocol do GA4 **não** foi ligado. Ele exigiria um segredo no backend e um campo novo na tentativa de contratação para guardar consentimento e identificador. Isso mudaria contrato de API ou banco, e fica para uma decisão separada.

## 1. Criar o Google Analytics 4

1. Acesse [analytics.google.com](https://analytics.google.com/) com a conta da Weper.
2. Admin → Criar propriedade. Nome sugerido: `Weper`. Fuso `America/Sao_Paulo`, moeda `BRL`.
3. Crie um fluxo de dados **Web** para `https://www.weper.com.br`.
4. Copie o ID de medição (`G-...`). Guarde também o ID numérico da propriedade, se for usar a API depois.
5. Em Administrador → Coleta de dados, deixe a medição respeitando o consentimento. Não ative sinais do Google que cruzem identidade do visitante.
6. Não cole o snippet `gtag.js` no site. O próximo passo usa o Tag Manager.

## 2. Criar o contêiner do Tag Manager

1. Acesse [tagmanager.google.com](https://tagmanager.google.com/).
2. Crie uma conta e um contêiner **Web** para `www.weper.com.br`.
3. Copie o ID `GTM-...`.
4. Não publique o snippet padrão duas vezes. O site injeta `gtm.js` sozinho quando a variável existe e a pessoa aceitou cookies de estatística.

## 3. Associar o GA4 ao GTM

Há um único caminho até o GA4: a tag do GTM. Não crie outra tag que carregue `gtag.js`, senão `page_view` e `purchase` entram em dobro.

1. No GTM, Nova tag → **Google Analytics: configuração do GA4**.
2. ID de medição: o `G-...` (o mesmo de `REACT_APP_GA4_MEASUREMENT_ID`).
3. Marque **Enviar um evento de visualização de página quando esta configuração for carregada** como **desligado**. O site já envia `page_view`.
4. Acionador: Inicialização ou Todas as páginas. Com o envio automático desligado, essa tag só deixa o GA4 pronto.
5. Nova tag → **Google Analytics: evento do GA4**.
6. Tag de configuração: a tag do passo 1.
7. Nome do evento: `{{Event}}`. Crie uma variável de camada de dados chamada `Event`, nome da variável de camada `event`, se o GTM não oferecer `{{Event}}` pronto. Na prática o nome do evento que o site envia já é o campo `event` do `dataLayer` (`page_view`, `plans_view`, `plan_selected`, `begin_checkout`, `whatsapp_click`, `generate_lead`, `purchase`, `plans_cta_click`).
8. Parâmetros do evento: marque para enviar os campos da camada de dados listados na tabela acima (`plan_id`, `plan_name`, `value`, `currency`, `transaction_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `channel`, `first_channel`, `source_section`, `acquisition`). Não mapeie e-mail, telefone ou documento: o site não envia esses campos.
9. Acionador: Evento personalizado, nome `.*`, "usar correspondência de regex", e exclua `gtm.js`, `gtm.dom`, `gtm.load` e `gtm.click` para não reenviar eventos internos do GTM ao GA4.
10. Não crie um segundo acionador de clique que também dispare `plan_selected` ou `purchase`. O site já faz isso.

Para `purchase`, o GA4 espera `transaction_id`, `value` e `currency`. Eles já saem no evento. `transaction_id` é o id interno da tentativa de contratação, não um documento.

## 4. Onde colocar os identificadores

1. Render → serviço `weper-production-web` → Environment.
2. Defina `REACT_APP_GTM_CONTAINER_ID` e `REACT_APP_GA4_MEASUREMENT_ID`.
3. O Clarity entra no passo 6, na variável `REACT_APP_CLARITY_PROJECT_ID`.
4. Salve e dispare um **deploy manual** só quando quiser publicar. O CRA grava essas variáveis no build. Trocar o valor sem rebuild não altera o site que já está no ar.
5. Não defina essas variáveis no serviço de staging se o contêiner for o de produção. O código também se recusa a carregar os scripts em host de staging, mas o build de staging não deve nascer com o ID de produção.

Desenvolvimento local: deixe as variáveis vazias em `.env.development`. O `npm start` não fala com o Google.

## 5. Publicar as tags

1. No GTM, use **Visualizar** e abra `https://www.weper.com.br`.
2. Aceite os cookies de estatística. Sem isso o contêiner nem é pedido.
3. Confira na aba do Tag Assistant que a configuração do GA4 disparou uma vez e que cada ação dispara uma tag de evento, não duas.
4. Envie a versão do contêiner e publique. Publicar o GTM não substitui o deploy da Render: os dois precisam estar prontos para a medição aparecer em produção.

## 6. Microsoft Clarity

1. Acesse [clarity.microsoft.com](https://clarity.microsoft.com/) e crie um projeto para `www.weper.com.br`.
2. Copie o ID do projeto.
3. Coloque em `REACT_APP_CLARITY_PROJECT_ID` no mesmo serviço de produção e faça o build.
4. No projeto Clarity, ative a máscara de texto sensível. O formulário de contratação já marca `data-clarity-mask="true"`.
5. Não cole um segundo snippet do Clarity no HTML.
6. O script é `async`. Em localhost ele não carrega, a menos que `REACT_APP_CLARITY_ENABLED=true`.

## 7. Consentimento

O aviso aparece nas páginas comerciais de produção: início, demonstrações, funcionalidades, contratação, parceiros públicos, privacidade e termos. Não aparece no painel, no cardápio nem no delivery das lojas.

- **Aceitar** liga estatística e marketing.
- **Recusar** desliga os dois. A escolha fica gravada; fechar a personalização sem salvar não grava nada.
- **Personalizar** separa estatística (GA4 e Clarity) e marketing (Meta).
- O botão **Cookies**, no canto inferior esquerdo, reabre a escolha. O WhatsApp continua no canto direito.

Quem já tinha `accepted` ou `rejected` no navegador continua com os dois grupos ligados ou desligados.

A seção de cookies da política de privacidade foi atualizada para descrever essas ferramentas. Vale uma leitura jurídica antes de tratar o texto como redação final.

## 8. Validar os eventos

Use uma janela anônima em `https://www.weper.com.br` depois do deploy com os IDs e da publicação do GTM.

1. Abra o DebugView do GA4: Admin → DebugView. No GTM, a visualização já marca o hit como debug. Sem a visualização, instale a extensão Google Analytics Debugger ou acrescente o modo de depuração do GTM.
2. Aceite os cookies. Deve aparecer um `page_view`. Recuse numa segunda janela: nenhum evento novo, e nenhum request para `googletagmanager.com` ou `clarity.ms`.
3. Role até os preços, ou abra `/#plans`. `plans_view` só entra quando o bloco está visível. Mudar o hash sem mostrar a seção não basta. O clique em "Contratar" ou "Preços" gera `plans_cta_click`, que é outro evento.
4. Escolha uma faixa e clique em **Assinar esta faixa**. Confira `plan_selected` com `plan_id` (`PLAN_01` … `PLAN_05`) e o preço do catálogo (`39.9`, `69.9`, `89.9`, `99.9`, `149.9`).
5. Na contratação, envie o formulário de um teste que você possa abandonar. `begin_checkout` entra quando a cobrança é criada. Voltar de `/contratar/retorno` não gera `purchase`.
6. Conclua um pagamento real só quando quiser uma conversão de verdade. `purchase` entra se a tela de contratação ainda estiver aberta e o status da API vier `paid: true`. Recarregar a mesma tentativa não manda de novo.
7. Campanha: abra `/?utm_source=instagram&utm_medium=paid_social&utm_campaign=black_friday`. Os eventos seguintes levam `channel=instagram_ads` e a campanha. Uma visita vinda do Instagram sem UTM fica `instagram_organic`, não "direto". Sem referrer, fica `direct`.
8. No Clarity, depois de aceitar, a gravação não deve mostrar CPF, e-mail nem cartão no formulário de contratação.
9. No modo anônimo, rejeite os cookies e repita um clique. O `dataLayer` não recebe evento de estatística.

Testes automatizados locais (`src/analytics/analytics.test.js`) cobrem esse funil sem falar com o Google. Eles não criam conversão de produção.

### O que não entra como compra

- Clique em contratar, abertura de `/contratar` ou redirecionamento ao Asaas.
- Cobrança pendente ou retorno em `/contratar/retorno`.
- `PLAN_TEST` e ambiente de staging.
- Segunda notificação do mesmo pagamento. O backend já ignora o webhook repetido pelo `asaasEventId`. O navegador também ignora a segunda confirmação da mesma tentativa.
- Mensalidade seguinte. A renovação não passa por esta tela. O evento `purchase` vai com `acquisition=first_subscription` e a chamada com renovação é descartada. O webhook de renovação continua só reativando a loja existente, como já faz hoje.

Quem fecha a aba antes de o navegador ver `paid: true` não gera `purchase`, mesmo com o webhook confirmando o pagamento. A assinatura continua válida no sistema. Contar esse caso no GA4 exigiria o Measurement Protocol, que não foi implementado.

## 9. Conversões no GA4

Depois que os eventos aparecerem no DebugView:

1. Admin → Eventos → marque `purchase` como evento principal (conversão).
2. Opcionalmente marque `generate_lead` e `begin_checkout` como eventos de funil, não como compra.
3. Não marque `plans_cta_click`, `plan_selected` nem `begin_checkout` como compra.
4. Em Exploração, monte um funil: `page_view` → `plans_view` → `plan_selected` → `begin_checkout` → `purchase`, quebrando por `channel`, `utm_campaign` e `plan_id`.

## 10. Página interna "Analytics Comercial"

Não foi criada. Não há série histórica para mostrar, e copiar cada evento para o PostgreSQL repetiria o que o GA4 e o Clarity já guardam.

Quando for a hora, a página pode ficar em `/admin`, visível só para `MASTER` e `SUPER_ADMIN`, no mesmo critério das outras seções da plataforma:

- visitas, sessões, `plans_view` e campanhas: relatórios oficiais do GA4 e do Clarity;
- assinaturas pagas, plano e renovação: as tabelas que o painel de assinaturas já usa;
- custo de aquisição: só quando existir o valor investido na campanha, informado à parte. Sem esse número, a tela não deve inventar CAC.

Isso precisa de credencial de servidor para a API do GA4. Essa credencial não pode usar prefixo `REACT_APP_`.

## Arquivos

- `src/analytics/` — serviço, eventos, campanha, consentimento, provedores, checkout e observação dos planos
- `src/commons/components/CookieConsent.jsx` — aceite, recusa, personalização e revisão
- `src/App.js` — página vista e origem, nas rotas comerciais
- `src/routes/home/Home.js` — observação de `#plans`
- `src/routes/home/landingAssets.js` — clique no WhatsApp
- `src/routes/billing/SignupPage.js` — faixa, início do checkout, compra confirmada e máscara do Clarity
- `src/services/metaPixel.js` — o pixel passa a entender a preferência separada de marketing
