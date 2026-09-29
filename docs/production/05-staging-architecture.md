# 05 — Arquitetura de homologação

Recomendação. Nada disso foi criado.

## Topologia

```text
ANDROID playStaging / getnetStaging
        │
        ▼
https://api-staging.weper.com.br
        │
        ▼
Web Service Render (Docker, 1 instância)
profile staging
        │
        ├── PostgreSQL staging (instância exclusiva)
        ├── Mercado Pago sandbox
        ├── Google Places (chave só deste ambiente)
        └── ViaCEP / wa.me (públicos)

https://staging.weper.com.br
        │
        └── mesma API staging
```

Uma instância só. O broker STOMP é em memória. Autoscaling fica desligado até existir um broker externo.

## Nomes

Compatíveis com Render e com DNS de `weper.com.br`:

| Serviço | Host sugerido | Tipo Render |
|---------|---------------|-------------|
| Painel, landing, cardápio, delivery | `staging.weper.com.br` | Static Site |
| API | `api-staging.weper.com.br` | Web Service (Docker) |
| Banco | hostname interno do Postgres Render | PostgreSQL |

`staging.weper.com.br` e `api-staging.weper.com.br` são CNAME para os hosts `*.onrender.com`. TLS sai do Render. Não usar o banco nem o serviço de laboratório descritos no README.

Região: a mesma para API e Postgres. O README cita Oregon. O Render não oferece região no Brasil. App e banco na mesma região evitam a URL externa do Postgres.

## Banco

Instância nova, vazia, só de homologação.

```text
DB_URL     jdbc interno do Render (não a URL externa)
DB_USER    usuário gerado
DB_PASS    senha gerada, só no painel
DDL_OPTION validate
```

A baseline Flyway (demanda 001) precisa ter rodado nesse banco vazio antes de considerar o serviço pronto.

## API

```text
SPRING_PROFILES_ACTIVE=staging
PORT                       injetado pelo Render
server.address             já é 0.0.0.0
health check path          /health
DEMO_SEED                  false
JWT_SECRET                 exclusivo, >= 32, diferente do default e do de produção
PAYMENT_SECRETS_KEY        exclusivo
CORS_ALLOWED_ORIGINS       https://staging.weper.com.br
MERCADO_PAGO_ENVIRONMENT   test
BOOTSTRAP_SUPER_PASSWORD   senha forte, não weper123
```

Branch que dispara deploy: `staging`, nos três repositórios. Push em `main` não publica homologação.

Build: o `Dockerfile` atual. Start: `java -jar`, já definido. Não montar persistent disk.

Cardápio e delivery nesse ambiente:

```text
https://staging.weper.com.br/cardapio/{slug}
https://staging.weper.com.br/delivery/{slug}
```

Webhook:

```text
https://api-staging.weper.com.br/api/webhooks/mercadopago
```

## Web

Static Site.

```text
build:   npm ci && npm run build
publish: build
rewrite: /*  ->  /index.html  (200)
env de build: REACT_APP_API_BASE_URL=https://api-staging.weper.com.br
```

A variável entra na hora do build. Trocar env sem rebuild não muda o bundle do CRA.

## Android

Novo `buildType` `staging`. Os flavors `play` e `getnet` permanecem.

```text
BASE_URL              https://api-staging.weper.com.br/
applicationIdSuffix   .staging
minify                pode ficar desligado neste buildType
cleartext             não
logging HTTP          NONE ou BASIC, nunca BODY
```

Variantes resultantes: `playStaging` e `getnetStaging`, sem renomear `playDebug`, `playRelease`, `getnetDebug`, `getnetRelease`.

`google-services.json` de um app Firebase de staging, injetado na máquina de build, fora do Git. Flavor `getnet` continua sem Firebase.

## O que staging não é

- Não usa credencial de produção do Mercado Pago.
- Não usa o Postgres de produção nem o de laboratório.
- Não recebe o domínio `www.weper.com.br`.
- Não faz seed de McDonald's / Minions.
