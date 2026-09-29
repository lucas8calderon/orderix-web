# 01 — Arquitetura atual

Auditoria somente leitura em 28/09/2026. Nenhum código, banco, DNS ou serviço foi alterado.

A documentação de arquitetura do ecossistema já vive em `orderix-web/docs/`. Os três repositórios são Git separados. Este pacote fica em `orderix-web/docs/production/` para permanecer junto dessa documentação. A auditoria de 17/09/2026 (`docs/architecture/19-technical-audit.md`) está desatualizada: Flyway, delivery, Mercado Pago, estoque, rate limit e profile `prod` já existem.

## Árvore real

Os diretórios do workspace não se chamam `weper-*`. Os repositórios GitHub ainda usam o nome antigo `orderix`.

```text
WEPER
├── orderix-backend     Java 17, Spring Boot 3.2.5, Maven, Docker
│   ├── src/main/java/weper/solutions/backend
│   ├── src/main/resources/application.properties
│   ├── src/main/resources/application-prod.properties
│   ├── src/main/resources/db/migration   Flyway V1–V30
│   ├── Dockerfile
│   └── .env.example
├── orderix-web         React 18, Create React App (react-scripts 5)
│   ├── src
│   ├── public
│   ├── .env.development
│   └── docs
└── orderix-android     Kotlin, AGP 8.6.0, flavors play | getnet
    ├── app
    ├── payments-api
    ├── payments-manual
    ├── payments-infinitepay
    └── payments-getnet
```

Não há `docker-compose`, `render.yaml`, GitHub Actions, GitLab CI ou Jenkins em nenhum dos três repositórios.

## O que cada parte faz

```text
LANDING + PAINEL + CARDÁPIO + DELIVERY          APP DE SALÃO
orderix-web (CRA)                               orderix-android
        │                                               │
        └──────────────────┬────────────────────────────┘
                           ▼
                  orderix-backend
                  Spring Boot :8080
                  JWT stateless
                           │
                           ▼
                     PostgreSQL
```

Web e Android não se falam. Os dois consomem a mesma API.

Papéis observados: `SUPER_ADMIN`, `MASTER`, `STORE_ADMIN`, `ADMIN`, `CASHIER`, `KITCHEN`, `WAITER` e, no delivery, `DELIVERY_CUSTOMER` (JWT com claim `typ`).

## Backend

| Item | Estado |
|------|--------|
| Linguagem | Java 17 |
| Framework | Spring Boot 3.2.5 |
| Build | Maven (`weper-1.0.0.jar`) |
| Persistência | Spring Data JPA + PostgreSQL + Flyway |
| Segurança | Spring Security, sessão stateless, JWT (jjwt 0.12.6) |
| Tempo real | STOMP em `/ws/sync`, broker simples em memória |
| Docs HTTP | springdoc; negado quando o processo é tratado como produção |
| Testes | 57 classes `*Test.java` |
| Health / Actuator | Ausente |
| Profile | Só `application.properties` e `application-prod.properties` |

Módulos em `weper.solutions.backend`: `auth`, `security`, `user`, `store`, `subscription`, `employee`, `waiter`, `category`, `product`, `catalog`, `table`, `comanda`, `order`, `inventory`, `payment`, `delivery`, `publicmenu`, `selfservice`, `sync`, `dashboard`, `crm`, `idempotency`, `media`, `exception`, `config`.

O tenant não viaja em header. `JwtAuthenticationFilter` recarrega o `User` no banco e grava `TenantContext` com o `storeId` da conta. O claim `storeId` do JWT não é a fonte de autorização.

## Banco

Default local, só se `DB_URL` não existir:

```text
jdbc:postgresql://localhost:5432/weper
usuário postgres
senha DB_PASS (sem default no properties)
ddl-auto default: update
```

Flyway está ligado, com `baseline-on-migrate` e `out-of-order=true`. `V1__baseline.sql` não cria tabela: é um marcador vazio. As tabelas de negócio nasceram do Hibernate `ddl-auto=update`. As migrations V2–V30 são aditivas e, em vários pontos, só alteram tabela se ela já existir.

Não há seeds versionados além de `DataInitializer` (SUPER_ADMIN opcional e lojas demo só com `DEMO_SEED=true`).

## Frontend web

| Item | Estado |
|------|--------|
| UI | React 18.3.1, React Router 6, MUI 5, Axios |
| Build | `react-scripts` 5 (`npm start` / `npm run build`) |
| Lockfile | `package-lock.json` está no `.gitignore` |
| API | `REACT_APP_API_BASE_URL` ou `http://localhost:8080` |
| Sessão | `localStorage` (`weper.token`, `weper.user`) |
| Testes | 50 arquivos `*.test.js` / `*.test.jsx` |
| PWA | Não |
| Firebase | Não há inicialização no `src` atual |

Rotas públicas relevantes:

```text
/                         landing
/cardapio/:slug           cardápio digital
/delivery/:slug           delivery
/delivery/:slug/conta     conta do cliente
/delivery/pedido/:token   acompanhamento
/demo/:slug               demonstração local de UI
```

`buildPublicMenuUrl` e o equivalente de delivery usam `window.location.origin`. A URL comercial fixa é `https://weper.com.br` em `src/config/weperSite.js`.

## Android

| Item | Estado |
|------|--------|
| Linguagem | Kotlin, JVM 17 |
| AGP / Kotlin | 8.6.0 / 2.0.20 |
| SDK | min 26, compile 35, target 35 |
| applicationId | `weper.solutions` |
| versionCode / versionName | 1 / 1.0 |
| Flavors | dimensão `acquirer`: `play` e `getnet` |
| buildTypes | `debug` e `release` apenas |
| R8 | `isMinifyEnabled = true` no release |
| HTTP | Retrofit 2.11 + OkHttp 4.12 |
| DI | Hilt 2.51.1 |
| Local | Room (fila de sync) + DataStore + EncryptedSharedPreferences |
| Firebase | Crashlytics só no flavor `play`; `google-services.json` está no `.gitignore` |
| Cleartext | só no `network_security_config` de debug |

`BASE_URL` de debug: `-PdebugApiUrl`, senão `debug.api.url` em `local.properties`, senão `http://10.0.2.2:8080/`.

`BASE_URL` de release: `-PreleaseApiUrl` ou `release.api.url`. Sem isso, o placeholder é `https://YOUR-BACKEND-HOST.onrender.com/` e a task release falha de propósito.

Não existe flavor nem buildType de staging. Os flavors atuais são de adquirente e não devem ser redefinidos.

## Git

| Repo | Remote | Branch atual |
|------|--------|----------------|
| orderix-backend | `github.com/lucas8calderon/orderix-backend` | `main` |
| orderix-web | `github.com/lucas8calderon/orderix-web` | `main` |
| orderix-android | `github.com/lucas8calderon/orderix-android` | `main` |

Há branches de feature antigas. Não há `develop` nem `staging`. Não há proteção de branch descrita no repositório.

## O que ainda é local

- Postgres default em `localhost:5432/weper`.
- API web default em `http://localhost:8080` (`.env.development` commitado, sem segredo).
- Android debug em `10.0.2.2` ou IP de LAN via `local.properties` (não commitado).
- CORS default `*`.
- JWT default no properties, rejeitado quando o processo é produção.
- Bootstrap `weper` / `weper123`, e demo `lucas.adm@gmail.com` / `123456` só se `DEMO_SEED=true`.
- Credenciais Mercado Pago e Google Places vazias no `.env.example`; o seed local copia token de teste do ambiente para as lojas e recusa fazer isso em produção.
- Imagens de logo, capa, categoria e produto ficam em colunas `TEXT` (data URL ou caminho). Não há disco de upload nem object storage.
- O README do backend ainda descreve um Postgres e um Web Service no Render como laboratório que expira, com `DDL_OPTION=update` ou `CREATE`.

## Dependência entre os três

```text
Schema versionado que nasce em banco vazio
        ↓
API com profile, health e segredos do ambiente
        ↓
Web com REACT_APP_API_BASE_URL desse ambiente
        ↓
Android com BASE_URL desse ambiente
        ↓
Webhook Mercado Pago apontando para essa API
```

O cardápio e o delivery públicos dependem dos dois primeiros. InfinitePay e Getnet dependem do aparelho, não de um webhook HTTP do backend.
