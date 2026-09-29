# 08 — Backlog de produção

Demandas na ordem de execução. Nada foi implementado. Os cards vivem no quadro Trello **WEPER — PRODUÇÃO**. Este arquivo é a cópia de referência.

Prefixo da categoria e `ORDEM GLOBAL` andam juntos. A ordem global é a que manda.

```text
001 [DATABASE 01] Baseline Flyway para Postgres vazio
002 [SECURITY 01] Fail-fast de boot em staging e produção
003 [SECURITY 02] Origem do WebSocket e log HTTP do Android
004 [BACKEND 01] GET /health
005 [BACKEND 02] Profile staging e matriz de variáveis
006 [FRONTEND 01] Bundle sem localhost e lockfile versionado
007 [ANDROID 01] buildType staging sem mexer nos flavors
008 [DEVOPS 01] Branches staging e regra de deploy
009 [DEVOPS 02] CI de build e testes
010 [INFRA 01] PostgreSQL de staging
011 [INFRA 02] Web Service da API staging
012 [BACKEND 03] Homologar a primeira subida da API
013 [INFRA 03] Static Site staging com rewrite
014 [FRONTEND 02] Publicar o painel staging
015 [SECURITY 03] CORS de staging nos hosts reais
016 [INTEGRATION 01] Mercado Pago sandbox e webhook
017 [INTEGRATION 02] Places, InfinitePay e Getnet em staging
018 [ANDROID 02] APKs staging contra a API
019 [QA 01] Smoke de homologação
020 [QA 02] Isolamento entre lojas
021 [DATABASE 02] PostgreSQL de produção e restore
022 [SECURITY 04] Secrets exclusivos de produção
023 [INFRA 04] API de produção
024 [INFRA 05] Site www e apex
025 [DEVOPS 03] DNS e HTTPS
026 [INTEGRATION 03] Webhook Mercado Pago de produção
027 [PRODUCTION 01] Go-live manual
028 [ANDROID 03] Play internal
029 [ANDROID 04] Release Getnet
030 [OBSERVABILITY 01] Alerta, log e runbook
031 [BACKEND 04] Object storage de imagens
```

001 a 007 bloqueiam a criação dos ambientes. 008 a 020 levam à homologação. 021 a 030 são produção. 031 é posterior ao primeiro cliente.

---

## 001 [DATABASE 01] Baseline Flyway para Postgres vazio

ORDEM GLOBAL: 001

OBJETIVO: Um Postgres vazio, com `ddl-auto=validate`, sobe até o fim das migrations V1–V30 sem Hibernate criar tabela.

CONTEXTO: Staging e produção não podem nascer com `update` ou `create`.

PROBLEMA ATUAL: `V1__baseline.sql` só executa `NULL`. As tabelas centrais foram criadas no passado por `ddl-auto=update`. O README ainda manda usar `CREATE` e depois `UPDATE`, o que o boot recusa quando `RENDER=true`.

ESCOPO:

- Exportar o schema atual para uma baseline versionada que cria as tabelas, constraints e índices já existentes.
- Fazer a baseline conviver com bancos locais que já estão acima de V1 (`baseline-on-migrate` ou versão nova que não reaplica o que já existe).
- Provar num Postgres vazio descartável: sobe com `validate`, aplicação responde, tabelas centrais existem.
- Corrigir o README: remover a instrução de `DDL_OPTION=CREATE` / `UPDATE`.

FORA DO ESCOPO:

- Apagar o banco local do desenvolvedor.
- Ligar `ddl-auto=update` em staging.
- Dados de demonstração.

DEPENDÊNCIAS: nenhuma.

ARQUIVOS/MÓDULOS IMPACTADOS:

- `orderix-backend/src/main/resources/db/migration/`
- `orderix-backend/README.md`
- `orderix-backend/src/main/resources/application.properties`

AMBIENTE: TODOS

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Banco vazio + `DDL_OPTION=validate` + Flyway conclui o boot.
- [ ] Banco local já migrado não é recriado nem perde dado neste passo.
- [ ] README não recomenda `create` nem `update` para Render.

VALIDAÇÃO: Subir um Postgres Docker temporário, apontar `DB_URL`, profile de produção ou staging, e ver o processo ficar de pé. Derrubar o container ao terminar.

ROLLBACK: Reverter o commit da migration. Não há dado de cliente nesse banco de prova.

OBSERVAÇÕES: `out-of-order=true` existe por versões que chegaram fora de ordem. A baseline nova não deve reordenar V2–V30 já aplicadas em bancos locais.

---

## 002 [SECURITY 01] Fail-fast de boot em staging e produção

ORDEM GLOBAL: 002

OBJETIVO: Staging e produção recusam subir com demo ligado, senha bootstrap default, chave de pagamento vazia ou DDL fora de `validate`/`none`.

CONTEXTO: `ProductionSafetyChecks` já cobre JWT, CORS e DDL quando o profile é `prod` ou `RENDER=true`. Não cobre `PAYMENT_SECRETS_KEY` nem `DEMO_SEED`.

PROBLEMA ATUAL: `PaymentSecretEncryptor` deriva a chave do JWT se `PAYMENT_SECRETS_KEY` está vazio, também em produção. `DEMO_SEED=true` cria MASTER `123456` e lojas demo. O profile `prod` não é a mesma coisa que um futuro profile `staging`, e o Render marca `RENDER=true` nos dois.

ESCOPO:

- Tratar profile `staging` com as mesmas recusas de produção, permitindo Mercado Pago `test`.
- Recusar boot se `PAYMENT_SECRETS_KEY` estiver vazio nesse modo.
- Recusar boot se `DEMO_SEED=true` nesse modo.
- Manter a recusa da senha bootstrap default.
- Teste automatizado desses quatro casos.

FORA DO ESCOPO:

- Rotacionar segredo já gravado em banco de lab.
- Implementar refresh token.

DEPENDÊNCIAS:

- [DATABASE 01] para o teste de boot com `validate` não falhar por schema.

ARQUIVOS/MÓDULOS IMPACTADOS:

- `security/ProductionSafetyChecks.java`
- `payment/crypto/PaymentSecretEncryptor.java`
- `DataInitializer.java`
- testes em `src/test/java/weper/solutions/backend/security/`

AMBIENTE: STAGING, PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] `PAYMENT_SECRETS_KEY` vazio impede o boot em prod e staging.
- [ ] `DEMO_SEED=true` impede o boot em prod e staging.
- [ ] Desenvolvimento local sem essas variáveis continua subindo.
- [ ] Teste cobre os casos sem imprimir o segredo.

VALIDAÇÃO: Testes de `ProductionSafetyChecks` e um boot local com profile `staging` e chave ausente, esperando falha.

ROLLBACK: Reverter o commit. Não há efeito em banco.

OBSERVAÇÕES: Não colar valor de chave neste card.

---

## 003 [SECURITY 02] Origem do WebSocket e log HTTP do Android

ORDEM GLOBAL: 003

OBJETIVO: O STOMP deixa de aceitar qualquer origem fora do desenvolvimento, e o release/staging Android deixa de logar corpo HTTP.

CONTEXTO: Sync do salão usa `/ws/sync`. O cliente Android loga o corpo em `NetworkDI`.

PROBLEMA ATUAL: `setAllowedOriginPatterns("*")`. `HttpLoggingInterceptor.Level.BODY` em todo build. `Authorization` já é redatado; o corpo não.

ESCOPO:

- Origens do WebSocket iguais às de `CORS_ALLOWED_ORIGINS` quando o processo for staging ou produção.
- Em debug Android, BODY pode permanecer.
- Em `staging` e `release`, nível NONE ou BASIC, sem corpo.

FORA DO ESCOPO:

- Trocar o broker em memória.
- Mudar o armazenamento do token.

DEPENDÊNCIAS:

- [BACKEND 02] se a lista de origens nascer nesse profile. Pode ser feita junto, com fallback explícito.

ARQUIVOS/MÓDULOS IMPACTADOS:

- `sync/StoreSyncWebSocketConfig.java`
- `orderix-android/app/src/main/java/weper/solutions/commons/di/NetworkDI.kt`

AMBIENTE: STAGING, PRODUÇÃO

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] Profile local ainda permite origem de desenvolvimento.
- [ ] Profile staging/prod não registra `*`.
- [ ] Build release não chama `Level.BODY`.

VALIDAÇÃO: Teste do config de origem e inspeção do `BuildConfig`/variante no Android.

ROLLBACK: Reverter o commit.

OBSERVAÇÕES: O filtro HTTP de `/ws/sync` já exige autenticação. Esta demanda fecha a origem.

---

## 004 [BACKEND 01] GET /health

ORDEM GLOBAL: 004

OBJETIVO: Um GET público, barato e sem dados de negócio, para o health check do Render.

CONTEXTO: Não há Actuator nem outro 200 anônimo estável. Swagger fica fechado em produção.

PROBLEMA ATUAL: O Render não tem path para marcar o serviço saudável sem bater numa rota autenticada.

ESCOPO:

- `GET /health` com 200 e corpo mínimo (`status`).
- `permitAll` só nesse path.
- Não consultar segredo nem devolver versão de schema sensível.

FORA DO ESCOPO:

- Métricas, tracing e alerta (isso é o card 030).

DEPENDÊNCIAS: nenhuma de infra. Pode ir em paralelo à baseline, mas o deploy espera os dois.

ARQUIVOS/MÓDULOS IMPACTADOS:

- novo controller em `orderix-backend`
- `security/SecurityConfig.java`

AMBIENTE: STAGING, PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Sem token, `GET /health` responde 200.
- [ ] O corpo não contém DSN, usuário ou nome de loja.
- [ ] As demais rotas seguem autenticadas.

VALIDAÇÃO: Subir local e chamar `/health` sem header.

ROLLBACK: Remover o matcher e o controller.

OBSERVAÇÕES: Path fixo `/health` para o campo Health Check do Web Service.

---

## 005 [BACKEND 02] Profile staging e matriz de variáveis

ORDEM GLOBAL: 005

OBJETIVO: Existir `application-staging.properties` e uma lista fechada de variáveis, sem valores secretos no Git.

CONTEXTO: Só existe `application-prod.properties`. Homologação precisa de `validate`, demo desligado e Mercado Pago em `test`.

PROBLEMA ATUAL: Quem for criar o serviço não tem um profile entre o default local (`update`, CORS `*`) e produção.

ESCOPO:

- Profile `staging`: `ddl-auto=validate`, Swagger off, `DEMO_SEED=false`, ambiente Mercado Pago default `test`.
- Documentar nomes: `DB_URL`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `PAYMENT_SECRETS_KEY`, `CORS_ALLOWED_ORIGINS`, `BOOTSTRAP_SUPER_USER`, `BOOTSTRAP_SUPER_PASSWORD`, `GOOGLE_PLACES_API_KEY`, `MERCADO_PAGO_*`.
- Atualizar `.env.example` só com nomes.

FORA DO ESCOPO:

- Criar o banco no Render (card 010).
- Colar senha no repositório.

DEPENDÊNCIAS:

- [SECURITY 01]
- [DATABASE 01]

ARQUIVOS/MÓDULOS IMPACTADOS:

- `src/main/resources/application-staging.properties`
- `.env.example`
- README do backend

AMBIENTE: STAGING

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] `SPRING_PROFILES_ACTIVE=staging` usa `validate`.
- [ ] Nenhum segredo real no arquivo.
- [ ] A matriz distingue staging de produção (MP test vs prod, CORS, chaves).

VALIDAÇÃO: Boot local com profile staging contra um Postgres de prova.

ROLLBACK: Remover o arquivo de profile.

OBSERVAÇÕES: `RENDER=true` já aciona várias checagens. O profile deixa o contrato explícito.

---

## 006 [FRONTEND 01] Bundle sem localhost e lockfile versionado

ORDEM GLOBAL: 006

OBJETIVO: Build de staging/produção falha se a URL da API não for HTTPS do ambiente, e o npm fica reproduzível.

CONTEXTO: CRA grava `REACT_APP_*` no bundle na hora do build.

PROBLEMA ATUAL: `src/services/apiConfig.js` cai em `http://localhost:8080`. `.env.development` está commitado (aceitável). `package-lock.json` está no `.gitignore`. Não há `.env.example`.

ESCOPO:

- Falhar o `npm run build` quando `REACT_APP_API_BASE_URL` estiver ausente ou for localhost.
- Manter `npm start` em localhost.
- Parar de ignorar o lockfile e commitá-lo.
- `.env.example` só com o nome da variável.
- Não espalhar `https://api.weper.com.br` pelo código de runtime além do que já existe em `weperSite.js` para o site comercial.

FORA DO ESCOPO:

- Criar o Static Site (card 013).
- Trocar de CRA para Vite.

DEPENDÊNCIAS: nenhuma de API no ar. A URL real entra no card 014.

ARQUIVOS/MÓDULOS IMPACTADOS:

- `orderix-web/src/services/apiConfig.js`
- `orderix-web/package.json`
- `orderix-web/.gitignore`
- `orderix-web/.env.example`

AMBIENTE: STAGING, PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] `npm run build` sem a variável falha.
- [ ] `npm start` continua em localhost.
- [ ] Lockfile versionado e `npm ci` funciona.

VALIDAÇÃO: Dois builds locais, um sem env (falha) e um com `https://api-staging.weper.com.br` (gera `build/`).

ROLLBACK: Reverter o commit. Não publicar o bundle de prova.

OBSERVAÇÕES: O teste que usa `https://app.weper.com.br` é exemplo de origem, não a URL da API.

---

## 007 [ANDROID 01] buildType staging sem mexer nos flavors

ORDEM GLOBAL: 007

OBJETIVO: Variantes `playStaging` e `getnetStaging` apontam para a API de staging. `play` e `getnet` continuam sendo só adquirente.

CONTEXTO: `debug` usa `10.0.2.2`. `release` exige URL real e liga R8. Não há terceiro buildType.

PROBLEMA ATUAL: Não dá para instalar um app de homologação ao lado do de produção, nem apontar release para staging sem editar `local.properties` de produção.

ESCOPO:

- `buildType` `staging` com `BASE_URL` de `staging.api.url` ou `-PstagingApiUrl`.
- Placeholder proibido, no mesmo espírito do release.
- `applicationIdSuffix ".staging"`.
- Cleartext desligado. Log de corpo desligado (junto do card 003).
- Não adicionar dimensão de flavor `env`.
- Documentar no README e apagar a referência a `chefia-elwd.onrender.com`.

FORA DO ESCOPO:

- Keystore da Play (card 028).
- Publicar na Play.

DEPENDÊNCIAS:

- [SECURITY 02] para o log.

ARQUIVOS/MÓDULOS IMPACTADOS:

- `orderix-android/app/build.gradle.kts`
- `orderix-android/README.md`
- `local.properties` (não commitado)

AMBIENTE: STAGING

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] `assemblePlayStaging` e `assembleGetnetStaging` existem.
- [ ] `playDebug` segue em `10.0.2.2` se nada for configurado.
- [ ] `playRelease` continua exigindo URL de produção, não a de staging.
- [ ] Flavor `getnet` segue sem Firebase obrigatório.

VALIDAÇÃO: `./gradlew :app:tasks` lista as variantes. Não instalar em loja.

ROLLBACK: Remover o buildType.

OBSERVAÇÕES: `versionCode` permanece 1 até o card da Play. Staging não vai para a loja.

---

## 008 [DEVOPS 01] Branches staging e regra de deploy

ORDEM GLOBAL: 008

OBJETIVO: Os três repositórios têm branch `staging` e uma regra escrita: staging faz deploy de homologação; produção não acompanha push em `main`.

CONTEXTO: Hoje tudo está em `main`.

PROBLEMA ATUAL: Não há para onde apontar o auto-deploy sem publicar experimento no mesmo lugar dos clientes.

ESCOPO:

- Criar `staging` a partir do commit que já contém 001–007, quando esses merges existirem.
- Descrever no README de cada repo: feature → main → staging → produção manual.
- Não ativar auto-deploy ainda.

FORA DO ESCOPO:

- Force push.
- Apagar branches antigas de feature.
- Regras de proteção no GitHub, se a conta não tiver o plano; nesse caso registrar a limitação.

DEPENDÊNCIAS:

- [DATABASE 01] a [ANDROID 01] mergeados antes de a branch virar fonte do Render.

ARQUIVOS/MÓDULOS IMPACTADOS:

- remotes `orderix-backend`, `orderix-web`, `orderix-android`
- READMEs

AMBIENTE: TODOS

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] `staging` existe nos três remotes.
- [ ] `main` não foi reescrita.
- [ ] A regra está escrita e não liga deploy de produção.

VALIDAÇÃO: `git ls-remote --heads origin staging` nos três repos.

ROLLBACK: Apagar a branch remota `staging` se nenhum serviço apontar para ela.

OBSERVAÇÕES: Não fazer isso antes do código de fundação, senão o primeiro deploy sobe o schema antigo.

---

## 009 [DEVOPS 02] CI de build e testes

ORDEM GLOBAL: 009

OBJETIVO: Pull request em `main` e `staging` compila e testa os três repositórios.

CONTEXTO: Não há `.github/workflows`. O Dockerfile pula `WeperApplicationTests`.

PROBLEMA ATUAL: Um push pode quebrar o JAR ou o bundle sem ninguém ver.

ESCOPO:

- Workflow de build + testes do backend (sem pular a suíte).
- Workflow `npm ci` + `npm test` da web (CI não interativo).
- Workflow de unit tests do Android (`testPlayDebugUnitTest` ou equivalente que já exista).
- CI não faz deploy.

FORA DO ESCOPO:

- E2E de browser.
- Publicar artefato na Play.

DEPENDÊNCIAS:

- [FRONTEND 01] por causa do `npm ci`.
- [DEVOPS 01] se o workflow disparar também em `staging`.

ARQUIVOS/MÓDULOS IMPACTADOS:

- `.github/workflows/` em cada repo
- `orderix-backend/Dockerfile` (o skip de teste do image build pode permanecer se o CI testar antes; não usar o skip como única prova)

AMBIENTE: TODOS

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] PR com teste quebrado fica vermelho.
- [ ] Workflow verde não chama a API do Render.
- [ ] Segredos de CI, se precisarem de `google-services`, usam secret do GitHub e não o Git.

VALIDAÇÃO: Abrir um PR de prova ou rodar o workflow na branch `staging`.

ROLLBACK: Desligar o workflow. Não afeta runtime.

OBSERVAÇÕES: O flavor `play` exige `google-services.json` para alguns tasks. O CI de unit test deve escolher uma task que não baixe Crashlytics à toa, ou injetar um json de teste via secret.

---

## 010 [INFRA 01] PostgreSQL de staging

ORDEM GLOBAL: 010

OBJETIVO: Instância Postgres só de homologação, na mesma região do futuro Web Service.

CONTEXTO: O README descreve `weper-db` como lab que expira e ensina a apagar a instância.

PROBLEMA ATUAL: Não existe banco de staging. Reusar o lab mistura dado de desenvolvimento com o ensaio de go-live.

ESCOPO:

- Criar Postgres Render novo, nome identificável como staging.
- Anotar host interno, usuário e nome do database no painel, não no Git.
- Plano que não expire no meio da homologação.
- Não restaurar dump de produção (ainda não existe) nem apontar o backend local permanente para ele.

FORA DO ESCOPO:

- Banco de produção (card 021).
- Migração de dados de cliente.

DEPENDÊNCIAS:

- [DATABASE 01] pronta no código que será deployado.
- [DEVOPS 01]

AMBIENTE: STAGING

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Instância no ar e isolada.
- [ ] Credencial só no painel Render.
- [ ] Connection string interna reservada para o Web Service.

VALIDAÇÃO: Conexão a partir do painel ou de um cliente usando a URL externa, só para conferir que a instância responde. Não criar tabela na mão.

ROLLBACK: Suspender ou destruir a instância vazia. Se já tiver recebido Flyway, destruir implica perder só dado de ensaio.

OBSERVAÇÕES: Região alinhada ao README (Oregon) salvo decisão explícita de mudar os dois serviços juntos.

---

## 011 [INFRA 02] Web Service da API staging

ORDEM GLOBAL: 011

OBJETIVO: API de homologação em Docker, uma instância, health `/health`, branch `staging`.

CONTEXTO: O `Dockerfile` já gera `weper-1.0.0.jar` com Java 17 e escuta `0.0.0.0` e `PORT`.

PROBLEMA ATUAL: Não há serviço de staging. Autoscaling quebraria o STOMP.

ESCOPO:

- Web Service Docker a partir de `orderix-backend`, branch `staging`.
- Health check path `/health`.
- Variáveis do card 005, valores só no painel.
- `SPRING_PROFILES_ACTIVE=staging`.
- Instâncias = 1. Sem disco persistente.
- Domínio customizado fica no card 025; até lá a URL `*.onrender.com` serve para teste interno.

FORA DO ESCOPO:

- Domínio final, se o DNS ainda não estiver decidido no momento da criação. Pode-se vincular `api-staging.weper.com.br` aqui se o DNS do card 025 for antecipado só para staging.

DEPENDÊNCIAS:

- [INFRA 01]
- [BACKEND 01]
- [BACKEND 02]
- [SECURITY 01]

AMBIENTE: STAGING

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Deploy verde.
- [ ] `GET /health` 200 na URL do serviço.
- [ ] Log de boot mostra Flyway sem erro e sem seed demo.
- [ ] Uma instância.

VALIDAÇÃO: Curl de `/health` e checagem de que `/swagger-ui` não abre.

ROLLBACK: Suspender o serviço. O banco de staging permanece para a tentativa seguinte.

OBSERVAÇÕES: Não definir `DDL_OPTION=update`.

---

## 012 [BACKEND 03] Homologar a primeira subida da API

ORDEM GLOBAL: 012

OBJETIVO: Registrar que o banco vazio de staging ficou no estado esperado depois do primeiro boot.

CONTEXTO: A primeira subida é o teste real da baseline.

PROBLEMA ATUAL: Não há ambiente para essa prova.

ESCOPO:

- Confirmar tabelas centrais e `flyway_schema_history`.
- Confirmar ausência das lojas demo.
- Criar o SUPER_ADMIN só pela variável de bootstrap, com senha forte.
- Anotar a URL `onrender.com` da API para os cards seguintes.

FORA DO ESCOPO:

- Carga de cardápio de cliente real.

DEPENDÊNCIAS:

- [INFRA 02]

AMBIENTE: STAGING

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Histórico Flyway completo.
- [ ] `ddl-auto` efetivo é `validate`.
- [ ] Login do SUPER_ADMIN funciona.
- [ ] Não existe usuário demo `123456`.

VALIDAÇÃO: Login via curl ou cliente HTTP em `POST /api/auth/login`. Consulta somente leitura ao `flyway_schema_history`.

ROLLBACK: Restaurar a instância de staging vazia (destruir e recriar) se a baseline tiver ficado pela metade.

OBSERVAÇÕES: Não colar o JWT de resposta no card.

---

## 013 [INFRA 03] Static Site staging com rewrite

ORDEM GLOBAL: 013

OBJETIVO: Site de homologação que devolve `index.html` em rotas como `/cardapio/slug` e `/delivery/slug`.

CONTEXTO: CRA é SPA. Não há regra de rewrite no repo.

PROBLEMA ATUAL: Refresh numa rota interna vira 404 num static host sem fallback.

ESCOPO:

- Static Site Render, repo `orderix-web`, branch `staging`.
- Build `npm ci && npm run build`, publish `build`.
- Rewrite `/*` → `/index.html` 200.
- Env de build `REACT_APP_API_BASE_URL` = URL HTTPS da API staging.
- Sem auto-deploy a partir de `main`.

FORA DO ESCOPO:

- Domínio `www`.

DEPENDÊNCIAS:

- [FRONTEND 01]
- [INFRA 02] (a URL da API precisa existir)
- [DEVOPS 01]

AMBIENTE: STAGING

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Home abre.
- [ ] Refresh em `/login` e num path de cardápio não dá 404 do host.
- [ ] O JS do bundle não contém `localhost:8080`.

VALIDAÇÃO: Abrir o site, recarregar `/login`, e buscar `localhost:8080` nos arquivos do `build` publicado (view-source ou asset).

ROLLBACK: Suspender o static site.

OBSERVAÇÕES: Mudou a URL da API? Rebuild. Env de runtime não altera o bundle.

---

## 014 [FRONTEND 02] Publicar o painel staging

ORDEM GLOBAL: 014

OBJETIVO: O painel de staging faz login na API de staging e abre um cardápio de loja de ensaio.

CONTEXTO: Os dois serviços passam a se enxergar.

PROBLEMA ATUAL: CORS ainda não lista a origem do static site. O bundle pode estar apontando para a URL onrender da API, o que é aceitável até o domínio existir.

ESCOPO:

- Login de um usuário de loja de ensaio (criado pelo MASTER de staging, não pelo seed demo).
- Abrir dashboard, produtos e a rota pública de cardápio.
- Ajustar `CORS_ALLOWED_ORIGINS` para a origem exata do static site (URL onrender e, quando existir, `https://staging.weper.com.br`).

FORA DO ESCOPO:

- Pix real.

DEPENDÊNCIAS:

- [BACKEND 03]
- [INFRA 03]
- [SECURITY 03] pode ser o mesmo trabalho de CORS; não duplicar a configuração.

AMBIENTE: STAGING

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] Login no browser de staging.
- [ ] Chamada à API sem erro de CORS.
- [ ] Cardápio público abre sem token.

VALIDAÇÃO: Fluxo manual no browser: login, criar categoria, abrir `/cardapio/{slug}`.

ROLLBACK: Voltar a origem de CORS anterior no painel. Não há migração.

OBSERVAÇÕES: Incluir a origem com `https` e sem barra no final.

---

## 015 [SECURITY 03] CORS de staging nos hosts reais

ORDEM GLOBAL: 015

OBJETIVO: Quando `staging.weper.com.br` existir, a API só aceita essa origem (e a URL onrender enquanto for necessária).

CONTEXTO: O card 014 pode ter usado só a URL `onrender.com`.

PROBLEMA ATUAL: Lista de origens provisória.

ESCOPO:

- Atualizar `CORS_ALLOWED_ORIGINS` e a origem do WebSocket para os hosts finais de staging.
- Remover origem larga depois que o domínio responder.

FORA DO ESCOPO:

- CORS de produção.

DEPENDÊNCIAS:

- [DEVOPS 03] se o domínio de staging for publicado antes; senão este card espera o CNAME de staging.
- [FRONTEND 02]

AMBIENTE: STAGING

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] Browser em `https://staging.weper.com.br` chama a API.
- [ ] Uma origem qualquer não listada não passa no preflight.
- [ ] WebSocket usa a mesma lista.

VALIDAÇÃO: Login no domínio de staging e um preflight recusado a partir de outra origem (curl `Origin`).

ROLLBACK: Recolocar a origem onrender temporária se o domínio falhar.

OBSERVAÇÕES: Pode ser executado imediatamente após o DNS de staging, antes do DNS de produção.

---

## 016 [INTEGRATION 01] Mercado Pago sandbox e webhook

ORDEM GLOBAL: 016

OBJETIVO: Uma loja de ensaio em staging cobra Pix de teste e o webhook confirma o pagamento.

CONTEXTO: O endpoint e a idempotência já existem. Falta URL pública e credencial de teste da loja.

PROBLEMA ATUAL: Sem host público o Mercado Pago não alcança o backend. `PAYMENT_SECRETS_KEY` de staging precisa existir antes de gravar o token.

ESCOPO:

- Garantir `PAYMENT_SECRETS_KEY` de staging no serviço.
- Gravar credencial de teste na loja pelo painel (não pelo seed que copia env para todas as lojas).
- Configurar a URL de notificação do Mercado Pago de teste para `https://<api-staging>/api/webhooks/mercadopago`.
- Pagar um Pix de teste e ver o pedido mudado por webhook.
- Reenviar o mesmo evento e confirmar que não duplica.

FORA DO ESCOPO:

- Credencial de produção.
- Cartão de produção.

DEPENDÊNCIAS:

- [BACKEND 03]
- [SECURITY 01]
- [FRONTEND 02]

AMBIENTE: STAGING

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Pagamento de teste fica pago via webhook, sem marcar manualmente.
- [ ] Log não mostra o access token.
- [ ] Segundo envio do mesmo `eventId` não altera de novo.

VALIDAÇÃO: Pedido de delivery em staging, Pix de teste, consulta do status do pagamento.

ROLLBACK: Remover a URL de webhook no painel Mercado Pago e a credencial da loja de ensaio.

OBSERVAÇÕES: Ambiente da conta = `test`. Não usar access token de produção aqui.

---

## 017 [INTEGRATION 02] Places, InfinitePay e Getnet em staging

ORDEM GLOBAL: 017

OBJETIVO: Cada integração externa que o código realmente chama tem uma decisão explícita em staging: ligada com credencial de teste, ou desligada de propósito.

CONTEXTO: Places é servidor. InfinitePay e Getnet são aparelho. ViaCEP não tem chave.

PROBLEMA ATUAL: Nada disso está apontado para um ambiente online.

ESCOPO:

- Places: chave restrita por IP de staging, ou variável vazia e prospecção avisando que não está configurada.
- InfinitePay: handle de teste na loja de ensaio, smoke no `playStaging`.
- Getnet: smoke no terminal com `getnetStaging`, se houver terminal; se não houver, registrar o bloqueio sem inventar certificado.
- ViaCEP: um CEP no formulário de staging.

FORA DO ESCOPO:

- Conta InfinitePay/Getnet de produção.
- Asaas, Stone, PagSeguro (não existem no código).

DEPENDÊNCIAS:

- [ANDROID 02] para o smoke de aparelho.
- [BACKEND 03] para a chave Places.

AMBIENTE: STAGING

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] Places não vaza a chave para o browser.
- [ ] Há registro do resultado de InfinitePay e Getnet (passou ou bloqueado por falta de terminal).
- [ ] ViaCEP preenche endereço.

VALIDAÇÃO: Uma busca de CRM (ou mensagem de não configurado), um CEP, e o fluxo de pagamento no aparelho disponível.

ROLLBACK: Esvaziar a chave Places no painel.

OBSERVAÇÕES: Não commitar `google-services.json` neste card.

---

## 018 [ANDROID 02] APKs staging contra a API

ORDEM GLOBAL: 018

OBJETIVO: `playStaging` e `getnetStaging` fazem login na API de staging.

CONTEXTO: O buildType nasce no card 007. Este card gera o artefato e prova o login.

PROBLEMA ATUAL: Não há APK apontando para host de homologação.

ESCOPO:

- Preencher `staging.api.url` fora do Git.
- Gerar os dois APKs.
- Login de garçom/caixa de ensaio.
- Confirmar que o applicationId tem sufixo `.staging` e instala ao lado de um debug.

FORA DO ESCOPO:

- Play Store.
- Ofuscar como se fosse release de loja.

DEPENDÊNCIAS:

- [ANDROID 01]
- [BACKEND 03]

AMBIENTE: STAGING

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] Login no aparelho ou emulador contra a API staging.
- [ ] O app não tenta `10.0.2.2` nessa variante.
- [ ] Flavor getnet não exige Google Services.

VALIDAÇÃO: Login real e uma listagem de mesas.

ROLLBACK: Desinstalar o APK. Não há efeito no backend além de sessões de teste.

OBSERVAÇÕES: Cleartext permanece proibido.

---

## 019 [QA 01] Smoke de homologação

ORDEM GLOBAL: 019

OBJETIVO: Os fluxos críticos passam uma vez em staging, com evidência objetiva.

CONTEXTO: Há testes de unidade, não há E2E.

PROBLEMA ATUAL: Ninguém percorreu o sistema fora da máquina local.

ESCOPO: Executar e anotar resultado de:

- login web e Android
- criar loja
- produto e categoria
- mesa, comanda, balcão
- pedido e cozinha
- estoque
- delivery e cardápio
- pagamento manual e Pix de teste
- permissões de garçom, caixa e cozinha

FORA DO ESCOPO:

- Suíte automatizada nova cobrindo tudo.
- Teste de carga.

DEPENDÊNCIAS:

- [FRONTEND 02]
- [ANDROID 02]
- [INTEGRATION 01]

AMBIENTE: STAGING

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] Cada fluxo acima tem passou/falhou e, se falhou, o card de correção linkado.
- [ ] Nenhum fluxo crítico ficou sem execução.

VALIDAÇÃO: Roteiro anotado neste card ou num comentário. Falha bloqueia o card 027.

ROLLBACK: Não se aplica. Correções viram cards novos, sem reordenar o que já passou.

OBSERVAÇÕES: Self-service por QR entra se a loja de ensaio usar comanda com token.

---

## 020 [QA 02] Isolamento entre lojas

ORDEM GLOBAL: 020

OBJETIVO: Usuário da loja A não lê nem altera pedido, produto, pagamento ou cliente da loja B.

CONTEXTO: O filtro Hibernate não cobre delivery, cardápio público e pagamento online. Plataforma sem `storeId` deve tomar 403 nos services de loja.

PROBLEMA ATUAL: Não há prova em ambiente online.

ESCOPO:

- Duas lojas em staging.
- Com o token da loja A, chamar get/update de recurso da loja B (pedido, produto, config de pagamento) e esperar 404 ou 403.
- MASTER sem loja não lista produtos de todas as lojas.
- Cardápio público da loja B continua acessível sem token, só o que for público.

FORA DO ESCOPO:

- Pentest externo completo.

DEPENDÊNCIAS:

- [QA 01]

AMBIENTE: STAGING

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Os cruzamentos acima falham fechado.
- [ ] O cardápio público não exige o token da outra loja.

VALIDAÇÃO: Chamadas HTTP anotadas com status, sem colar tokens.

ROLLBACK: Apagar as duas lojas de ensaio se contiverem dado indevido.

OBSERVAÇÕES: Olhar em especial services do pacote `delivery` e `payment.online`.

---

## 021 [DATABASE 02] PostgreSQL de produção e restore

ORDEM GLOBAL: 021

OBJETIVO: Terceira instância Postgres, só de produção, com backup e um restore ensaiado.

CONTEXTO: Free expira e não serve para cliente. Staging não pode ser promovido por troca de URL.

PROBLEMA ATUAL: Não há backup nem ensaio de restauração.

ESCOPO:

- Criar a instância de produção, vazia, outra região somente se a API de produção for junto.
- Ligar backup do plano.
- Restaurar um backup para uma instância descartável e ver o schema.
- Destruir a instância de prova do restore.
- Não copiar dado de staging.

DEPENDÊNCIAS:

- [QA 02] verde. Não criar produção no meio do conserto de isolamento.

AMBIENTE: PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] URL diferente da de staging e da de lab.
- [ ] Backup configurado.
- [ ] Restore de prova leu `flyway_schema_history` depois do primeiro deploy, ou o ensaio fica agendado para imediatamente após o card 023 se o banco ainda estiver vazio.

VALIDAÇÃO: Print ou anotação do painel de backup e da instância de restore, sem senha.

ROLLBACK: Destruir a instância se ainda não houver dado de cliente. Se já houver, não destruir; corrigir para frente.

OBSERVAÇÕES: O primeiro restore completo só existe depois que a API rodou Flyway. Este card cria a instância e o ensaio fecha no card 027 se o backup ainda estiver vazio aqui.

---

## 022 [SECURITY 04] Secrets exclusivos de produção

ORDEM GLOBAL: 022

OBJETIVO: Produção usa JWT, chave de pagamento, bootstrap e Places diferentes dos de staging.

CONTEXTO: Reusar segredo de staging transforma um vazamento de homologação em acesso de produção.

PROBLEMA ATUAL: Não há cofre de produção.

ESCOPO:

- Gerar valores novos, gravar só no painel do serviço de produção (o serviço nasce no card 023; os valores podem ser gerados aqui e colados lá).
- Confirmar que nenhum deles está no Git.
- Se algum dia um token de teste foi commitado no histórico, rotacionar. A árvore atual não mostrou token vivo.

FORA DO ESCOPO:

- Rotação periódica contínua (entra no runbook do card 030).

DEPENDÊNCIAS:

- [SECURITY 01]
- [DATABASE 02]

AMBIENTE: PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Quatro segredos (JWT, payment key, bootstrap, Places se usado) diferem dos de staging.
- [ ] Busca no Git não acha esses valores.

VALIDAÇÃO: Conferência visual no painel (presença, não o valor) e busca local por um prefixo curto, sem colar o valor no card.

ROLLBACK: Trocar de novo os valores antes de existir dado cifrado. Depois de haver token de loja cifrado, trocar `PAYMENT_SECRETS_KEY` exige regravar as credenciais.

OBSERVAÇÕES: Mascarar qualquer menção (`APP_USR-***********`).

---

## 023 [INFRA 04] API de produção

ORDEM GLOBAL: 023

OBJETIVO: Web Service de produção, profile `prod`, uma instância, health ok, sem demo.

CONTEXTO: Mesmo Dockerfile da homologação, outras variáveis e outro banco.

PROBLEMA ATUAL: Não existe.

ESCOPO:

- Serviço Docker, branch de produção combinada no card 008 (promoção manual a partir de `staging`).
- Auto-deploy automático em todo push: desligado.
- Variáveis do card 022 e `DDL_OPTION=validate`.
- `MERCADO_PAGO_ENVIRONMENT=prod` como default do processo; a loja ainda configura a própria credencial.
- Health `/health`. Swagger fechado.

FORA DO ESCOPO:

- Apontar o domínio (card 025) pode ser no mesmo dia, em sequência.

DEPENDÊNCIAS:

- [DATABASE 02]
- [SECURITY 04]
- [QA 02]

AMBIENTE: PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] `/health` 200.
- [ ] Flyway no banco de produção vazio.
- [ ] Sem loja demo.
- [ ] Serviço com 1 instância.

VALIDAÇÃO: Igual ao card 012, na URL de produção ainda `onrender.com` se o DNS não entrou.

ROLLBACK: Suspender o serviço. Não apontar o domínio oficial para um boot falho.

OBSERVAÇÕES: Não reutilizar `DB_URL` de staging.

---

## 024 [INFRA 05] Site www e apex

ORDEM GLOBAL: 024

OBJETIVO: O bundle de produção serve `www.weper.com.br` e o apex, com a API de produção gravada no build.

CONTEXTO: `weperSite.js` usa `https://weper.com.br`.

PROBLEMA ATUAL: Não há static site de produção nem rewrite.

ESCOPO:

- Static Site, build com `REACT_APP_API_BASE_URL=https://api.weper.com.br`.
- Rewrite SPA.
- Preparar o serviço para os dois hosts. O DNS em si é o card 025.
- Rebuild se a URL da API mudar.

FORA DO ESCOPO:

- Campanha ou conteúdo novo da landing.

DEPENDÊNCIAS:

- [INFRA 04]
- [FRONTEND 01]

AMBIENTE: PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Bundle sem `localhost`.
- [ ] Refresh de `/cardapio/{slug}` e `/delivery/{slug}` ok no host do serviço.
- [ ] Login contra a API de produção, com CORS já incluindo www e apex.

VALIDAÇÃO: Browser no host do static site (onrender ou domínio, o que já existir).

ROLLBACK: Suspender o site. A API permanece.

OBSERVAÇÕES: CORS de produção: `https://www.weper.com.br,https://weper.com.br`.

---

## 025 [DEVOPS 03] DNS e HTTPS

ORDEM GLOBAL: 025

OBJETIVO: Os cinco nomes resolvem e o certificado é válido.

CONTEXTO: O domínio adquirido citado para o site é `www.weper.com.br`. O código comercial usa o apex.

PROBLEMA ATUAL: Nenhum CNAME foi criado por esta auditoria.

ESCOPO:

- `www` → static de produção
- apex `weper.com.br` → o mesmo site ou redirect para www
- `api` → web service de produção
- `staging` → static de staging
- `api-staging` → API de staging
- Conferir HTTPS no browser.

FORA DO ESCOPO:

- Trocar de provedor DNS.
- App Links.

DEPENDÊNCIAS:

- [INFRA 03]
- [INFRA 04]
- [INFRA 05]

AMBIENTE: STAGING, PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Os cinco hosts abrem em HTTPS.
- [ ] `api` e `api-staging` respondem `/health` do seu próprio banco (não cruzado).

VALIDAÇÃO: Curl ou browser em cada host.

ROLLBACK: Remover o CNAME do host com problema. Não apagar o domínio.

OBSERVAÇÕES: Parte de staging pode ser feita mais cedo, antes do card 015. Se isso acontecer, não duplicar o trabalho: marcar aqui o que já estiver no ar.

---

## 026 [INTEGRATION 03] Webhook Mercado Pago de produção

ORDEM GLOBAL: 026

OBJETIVO: A loja piloto recebe confirmação de pagamento na API de produção.

CONTEXTO: Sandbox ficou em staging. Produção usa outra URL e outra credencial.

PROBLEMA ATUAL: O painel do Mercado Pago ainda não conhece `api.weper.com.br`.

ESCOPO:

- Credencial de produção cifrada na loja piloto.
- URL `https://api.weper.com.br/api/webhooks/mercadopago`.
- Um pagamento real de valor mínimo, ou o fluxo que o Mercado Pago oferecer para a conta, com confirmação por webhook.
- Conferir idempotência.

FORA DO ESCOPO:

- Ligar todas as lojas futuras. Cada loja grava a própria credencial.

DEPENDÊNCIAS:

- [DEVOPS 03]
- [SECURITY 04]
- [INTEGRATION 01] como ensaio prévio

AMBIENTE: PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Status do pagamento muda por webhook.
- [ ] Token não aparece no log.
- [ ] Staging continua em sandbox.

VALIDAÇÃO: Pedido piloto e painel do Mercado Pago mostrando entrega do webhook.

ROLLBACK: Desativar o meio online da loja e a URL de notificação. Pagamentos manuais de salão seguem.

OBSERVAÇÕES: Não reutilizar o webhook secret de teste.

---

## 027 [PRODUCTION 01] Go-live manual

ORDEM GLOBAL: 027

OBJETIVO: Abrir o checklist `09-go-live-checklist.md` e só então considerar o ambiente de clientes ligado.

CONTEXTO: Auto-deploy de `main` permanece desligado.

PROBLEMA ATUAL: Não há janela nem responsável pela promoção staging → produção.

ESCOPO:

- Percorrer o checklist.
- Promover o commit já aprovado em staging.
- Confirmar backup depois do Flyway de produção.
- Deixar escrito quem suspende o serviço se o smoke de produção falhar.

FORA DO ESCOPO:

- Novas features.

DEPENDÊNCIAS:

- [QA 01]
- [QA 02]
- [INFRA 05]
- [DEVOPS 03]
- [INTEGRATION 03]

AMBIENTE: PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] Checklist marcado com data.
- [ ] Smoke mínimo de produção: login, produto, pedido, cardápio público.
- [ ] Auto-deploy cego continua desligado.

VALIDAÇÃO: Checklist e smoke anotados.

ROLLBACK: Suspender static site e web service de produção. Não destruir o Postgres.

OBSERVAÇÕES: Android de loja pode ir depois. O salão no app espera o card 028 para clientes da Play; Getnet espera o 029.

---

## 028 [ANDROID 03] Play internal

ORDEM GLOBAL: 028

OBJETIVO: `playRelease` assinado, `versionCode` > 1 se 1 já tiver sido usado, apontando para `https://api.weper.com.br/`, na faixa internal testing.

CONTEXTO: Não há `signingConfig` de Play. `versionCode` é 1. R8 já liga no release.

PROBLEMA ATUAL: Não existe artefato publicável.

ESCOPO:

- Keystore fora do Git e fora do keystore Getnet.
- `release.api.url` de produção.
- Crashlytics com json de produção, não commitado.
- Internal testing, não produção aberta da Play, até o smoke do app.

FORA DO ESCOPO:

- Mudar flavor `play`.
- Listar o app em produção aberta neste card.

DEPENDÊNCIAS:

- [PRODUCTION 01]
- [ANDROID 01]

AMBIENTE: PRODUÇÃO

SEVERIDADE: CRÍTICO

CRITÉRIOS DE ACEITE:

- [ ] AAB/APK instala e faz login na API de produção.
- [ ] Keystore não está no repositório.
- [ ] Log de corpo desligado.
- [ ] Faixa internal, não rollout 100%.

VALIDAÇÃO: Dispositivo com o build de internal testing: login e abertura de mesa.

ROLLBACK: Interromper o rollout na Play. O backend não muda.

OBSERVAÇÕES: `google-services.json` de produção via CI secret ou máquina de release.

---

## 029 [ANDROID 04] Release Getnet

ORDEM GLOBAL: 029

OBJETIVO: `getnetRelease` assinado com o keystore de certificação, URL de produção, sem Firebase.

CONTEXTO: O flavor já aplica `getnetConfig` quando `local.properties` tem o caminho.

PROBLEMA ATUAL: Não há release de terminal apontando para `api.weper.com.br`.

ESCOPO:

- Assinar com o keystore Getnet, não com o da Play.
- `BASE_URL` de produção.
- Smoke de pagamento e impressão no terminal, se o terminal estiver disponível.

FORA DO ESCOPO:

- Enviar esse APK para a Play Store.

DEPENDÊNCIAS:

- [PRODUCTION 01]
- [ANDROID 01]

AMBIENTE: PRODUÇÃO

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] APK assinado v1+v2.
- [ ] Não contém obrigação de Google Services.
- [ ] Login no terminal contra a API de produção.

VALIDAÇÃO: Pagamento de teste no terminal da loja piloto, ou bloqueio explícito se o terminal não estiver em mãos.

ROLLBACK: Não instalar o APK nos terminais. Versão anterior do APK, se existir, permanece.

OBSERVAÇÕES: Senha do keystore não entra no card.

---

## 030 [OBSERVABILITY 01] Alerta, log e runbook

ORDEM GLOBAL: 030

OBJETIVO: Alguém é avisado se `/health` cair, e existe um passo a passo de restore sem senha escrita no Git.

CONTEXTO: Log hoje é stdout. Não há alerta.

PROBLEMA ATUAL: Serviço caído só aparece se alguém abrir o painel.

ESCOPO:

- Alerta de health do Render (e-mail ou o canal que a conta já usar).
- Revisar uma amostra de log de pagamento e de login e confirmar ausência de token, senha e PAN.
- Runbook curto: onde é o backup, como restaurar, como suspender o web service, como não apontar staging para o banco restaurado.

FORA DO ESCOPO:

- Stack nova de APM.

DEPENDÊNCIAS:

- [PRODUCTION 01]

AMBIENTE: PRODUÇÃO

SEVERIDADE: ALTO

CRITÉRIOS DE ACEITE:

- [ ] Alerta testado (pausa breve ou o teste que o Render oferecer).
- [ ] Runbook versionado em `docs/production/` sem segredo.
- [ ] Amostra de log limpa.

VALIDAÇÃO: Disparo do alerta e leitura do runbook por outra pessoa.

ROLLBACK: Remover o alerta se estiver ruidoso. Não mexer no banco.

OBSERVAÇÕES: Rate limit e STOMP continuam em memória. O runbook diz para não subir a segunda instância.

---

## 031 [BACKEND 04] Object storage de imagens

ORDEM GLOBAL: 031

OBJETIVO: Logo, capa e foto de produto saem do `TEXT` do Postgres quando o tamanho do backup ou da resposta passar a doer.

CONTEXTO: Hoje a mídia sobrevive a restart porque está no banco, não num disco local. Não é bloqueio do primeiro go-live.

PROBLEMA ATUAL: Colunas `logo_url` e `cover_url` aceitam data URL grande. Categoria e produto usam `TEXT`.

ESCOPO:

- Escolher object storage compatível com o Render (não disco persistente do próprio Web Service).
- Passar a gravar URL, não base64.
- Manter leitura do formato antigo até migrar as linhas existentes.

FORA DO ESCOPO:

- Fazer isso antes do card 027.
- Persistent disk no Web Service.

DEPENDÊNCIAS:

- [PRODUCTION 01]

AMBIENTE: PRODUÇÃO

SEVERIDADE: MÉDIO

CRITÉRIOS DE ACEITE:

- [ ] Upload novo não grava data URL.
- [ ] Imagem antiga ainda aparece.
- [ ] Backup do banco diminui de forma verificável numa loja de prova, ou o card documenta por que ainda não.

VALIDAÇÃO: Trocar a logo em staging primeiro, depois produção.

ROLLBACK: Voltar a aceitar data URL. Objetos já enviados podem permanecer no bucket.

OBSERVAÇÕES: Não bloqueia o checklist de go-live.
