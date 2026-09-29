# 07 — Plano de migração

Nada desta lista foi executado. A ordem é a dependência técnica, não a ordem em que os problemas foram lidos.

## Grafo

```text
Baseline Flyway que cria o schema
        ↓
Boot recusa demo, DDL perigoso e chave de pagamento vazia
        ↓
Health + profile staging + origem do WebSocket + log Android
        ↓
Branch staging (três repos) e CI de build/teste
        ↓
Postgres staging exclusivo
        ↓
API staging (Docker, 1 instância, validate)
        ↓
Static Site staging com API URL de build e rewrite SPA
        ↓
CORS apontando para essa origem
        ↓
Android staging (flavors play/getnet intactos)
        ↓
Mercado Pago sandbox + webhook da API staging
        ↓
Smoke e isolamento de lojas
        ↓
Postgres produção + backup com restore ensaiado
        ↓
Secrets exclusivos
        ↓
API produção + site www/apex + DNS
        ↓
Webhook Mercado Pago de produção
        ↓
Play internal + Getnet assinado
        ↓
Alerta, runbook, object storage quando o TEXT do banco apertar
```

## Fases

### Fase 0 — Auditoria

Este pacote e o quadro Trello. Nenhuma mudança de runtime.

### Fase 1 — Bloqueadores de código

Baseline de schema, fail-fast de segredo e de `DEMO_SEED`, health, profile staging, WebSocket, log do Android, URL da web sem localhost. Ainda sem criar serviço na nuvem.

### Fase 2 — Fundação Git

Branch `staging` nos três repositórios. `main` não publica produção sozinha. CI executa build e testes. Lockfile da web volta a ser versionado.

### Fase 3 — Homologação da API

Postgres novo. Web Service. Flyway num banco vazio. `/health` 200. Swagger ausente. Demo ausente. Uma instância.

### Fase 4 — Homologação web

Static Site, rewrite, bundle apontando para `api-staging`, CORS fechado nessa origem. Cardápio e delivery abrem no host de staging.

### Fase 5 — Homologação Android

`playStaging` e `getnetStaging` contra a API de staging. Sem novo flavor de adquirente.

### Fase 6 — Integrações

Mercado Pago de teste e webhook. Places com chave restrita. InfinitePay/Getnet só como conferência de aparelho. ViaCEP no formulário.

### Fase 7 — QA

Smoke dos fluxos críticos e prova de que a loja A não lê a loja B, incluindo os services que ficam fora do filtro Hibernate.

### Fase 8 — Produção

Terceiro Postgres, backup, restore ensaiado, API, site, DNS, HTTPS, secrets novos. Sem copiar o banco de lab ou de staging.

### Fase 9 — Android de loja

Keystore Play, `versionCode`, faixa internal. Keystore Getnet à parte.

### Fase 10 — Operação

Alerta de health, runbook de restore, revisão de log. Object storage para logo/capa/produto quando o backup ou o payload justificar. Não bloqueia o primeiro cliente se as imagens couberem no Postgres.

## O que não fazer no meio do caminho

- Não apontar staging e produção para o mesmo `DB_URL`.
- Não ligar `DDL_OPTION=create` nem `update` no Render.
- Não promover o banco que o README ensina a apagar e recriar.
- Não colocar segredo em `application.properties`, `.env` commitado ou `google-services.json` no Git.
- Não escalar o Web Service para duas instâncias.
- Não usar ngrok como URL de webhook de staging ou produção.
- Não alterar os flavors `play` e `getnet` para representar ambiente.

## Branches

Estado: só `main` é linha principal, nos três remotes.

Recomendação:

```text
feature/*  →  PR  →  main
main       →  PR  →  staging     (deploy automático só de staging)
staging    →  promoção manual  →  produção
```

Produção: auto-deploy desligado, ou ligado apenas depois de um workflow com aprovação. Não criar as branches nesta etapa.

## DNS (não aplicar agora)

No provedor do domínio `weper.com.br`:

```text
www            CNAME   static site de produção
@              ALIAS/ANAME para o mesmo site, ou redirect para www
api            CNAME   web service de produção
staging        CNAME   static site de staging
api-staging    CNAME   web service de staging
```

O apex em `.com.br` depende do DNS aceitar ALIAS/ANAME. Se o provedor só tiver A, o Render informa os registros no painel no momento de vincular o domínio. Até lá, `src/config/weperSite.js` continua em `https://weper.com.br`.
