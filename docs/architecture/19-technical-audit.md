# 19 — Auditoria técnica completa (Android + Web + Backend)

Auditoria **somente leitura**, 17/09/2026. Nada foi alterado no código.  
Evidências apontam arquivo e trecho. Métricas de runtime = **BASELINE NECESSÁRIO** (não inventadas).

Documentos irmãos: [01-system-overview](./01-system-overview.md), [14-api-map](./14-api-map.md), [17-problems-and-gaps](./17-problems-and-gaps.md).

---

## 1. Resumo executivo

Weper/Weper é um SaaS multi-tenant de operação para alimentação: **Android lança o pedido no salão**, **web gere catálogo/caixa/KDS/admin**, **backend Spring Boot + PostgreSQL** é a única fonte de verdade. A arquitetura cabe no tamanho do produto.

O que trava escala e confiança: superfície de **segurança de piloto** (JWT/CORS defaults, token no aparelho, Swagger aberto), **lacuna de isolamento** quando MASTER não tem `storeId`, **estoque que não baixa**, **pedido que não nasce na web**, **listagens sem página**, **quase zero testes**.

Não precisa de microserviços. Precisa fechar o perímetro, versionar o schema, paginar e cobrir o fluxo pedido → cozinha → caixa.

---

## 2. Arquitetura atual

```text
MASTER / SUPER_ADMIN  →  Web /admin
STORE_ADMIN / ADMIN   →  Web /app (gestão)
CASHIER               →  Web caixa + Android
KITCHEN               →  Web /app/cozinha
WAITER                →  Android (pedido, mesa, comanda, balcão, impressão)

        ┌──────────────┐              ┌──────────────┐
        │  WEB  CRA    │              │ ANDROID XML  │
        │  Axios JWT   │              │ Retrofit JWT │
        └──────┬───────┘              └──────┬───────┘
               │                             │
               └──────────┬──────────────────┘
                          ▼
                 BACKEND Spring Boot 3.2.5
                 TenantContext + filtro Hibernate
                          │
                          ▼
                       PostgreSQL
```

Web e Android **não** se falam. Tenant **não** vai em header: sai do `User.store` recarregado no `JwtAuthenticationFilter`.

---

## 3. Mapa de funcionalidades

| Feature | Android | Web | Backend |
|---------|---------|-----|---------|
| Login JWT | Sim (só WAITER/CASHIER) | Sim (todos os roles) | `POST /api/auth/login` |
| Catálogo CRUD | Leitura | Sim | `/category`, `/product` |
| Mesas / comandas CRUD | Leitura | Sim | `/tables`, `/comandas` |
| Lançar pedido | **Sim** | **Não** | `POST /tables/{id}/orders` |
| Fechar conta | Sim | Sim | close mesa/comanda/balcão |
| KDS | PATCH status | Board + poll 12s | `/kitchen/orders` |
| Dashboard loja | Não | Sim | `/dashboard/overview` |
| Admin lojas | Não | `/admin` | `/api/stores` |
| Impressão térmica | Sim | Não | — |
| Estoque movimento | Não | UI órfã | Sem baixa |
| Pagamento PSP | Não | Não | Enum local |
| Offline | Não | Não | — |
| Forgot password | Mock | Sem API | Sem endpoint |

---

## 4. Fluxos principais

```text
STORE_ADMIN cadastra catálogo/mesas na WEB
        ↓
WAITER no ANDROID: mesa|comanda|balcão → carrinho
        ↓
POST /tables/{tableId}/orders   (tableId 999 = balcão/comanda)
        ↓
Order ACTIVE + kitchenStatus NEW
        ↓
WEB KDS GET /kitchen/orders a cada 12s
        ↓
PATCH /kitchen/orders/{id}/status  NEW → IN_PREPARATION → READY → DELIVERED
        ↓
WEB caixa ou ANDROID fecha:
  POST /tables/{id}/group-orders/close
  POST /comandas/{id}/orders/close
  POST /counter/orders/{id}/close
        ↓
Dashboard lê pedidos CLOSED
```

Polling paralelo no Android: `GET /home/shift` a cada 12s (`MainActivity`).

---

## 5. Android — achados

| Sev. | Achado | Evidência |
|------|--------|-----------|
| CRÍTICO | `runBlocking` na main em `onCreateView` | `CategoriesFragment.kt` L81–83 |
| CRÍTICO | Token em Proto DataStore em claro + `allowBackup=true` | `SessionRepositoryImpl`, `AndroidManifest` |
| CRÍTICO | Release `BASE_URL` placeholder, minify off | `app/build.gradle.kts` |
| ALTO | `RefreshTokenInterceptor` só limpa sessão | interceptor de 401 |
| ALTO | Sem Room / fila offline | ausência de `@Database` |
| ALTO | PII e payload de pedido no Crashlytics | `LoginActivity`, `CartViewModel` |
| ALTO | Forgot/register mock | `ForgotPasswordDataSource`, `RegistrationUserDataSource` |
| MÉDIO | Polling 12s do turno; vários OkHttp (um por `*Di`) | `MainActivity`; módulos DI |
| MÉDIO | Fragments >400 LOC; pastas vazias | Categories 649, GroupOrder 458 |

**Adequado (não mexer agora):** restrição WAITER/CASHIER, ViewBinding+Navigation, timeouts OkHttp, cleartext só em debug, módulo de impressão encapsulado.

---

## 6. Web — achados

| Sev. | Achado | Evidência |
|------|--------|-----------|
| ALTO | Sem `timeout` no Axios | `src/services/apiConfig.js` |
| ALTO | Sem lazy das rotas do app | `App.js` importa Dashboard/Master eager |
| ALTO | Firebase init sem Auth usado | `firebase.js` + `App.js` |
| ALTO | Deps mortas: styled-components, @mui/x-charts, tailwind-merge | `package.json` vs grep |
| ALTO | Testes só smoke + accessControl | `App.test.js`, `accessControl.test.js` |
| MÉDIO | `Kitchen.js` ~898 linhas + poll 12s | L444–447 |
| MÉDIO | Token em `localStorage` | `session.js` |
| MÉDIO | Inventory/Financial/Settings/Overview MUI órfãos | não montados em `Dashboard.js` |
| BAIXO | `hasPermission` stub | `accessControl.js` |

**Adequado:** `ProtectedRoute` + `ROLE_ROUTES`, interceptor 401/assinatura, fluxo Atendimento → CheckoutDialog, catálogo responsivo (tabela vs cards).

---

## 7. Backend — achados

| Sev. | Achado | Evidência |
|------|--------|-----------|
| CRÍTICO | `ddl-auto=update` default, sem Flyway | `application.properties` L12 |
| CRÍTICO | JWT/bootstrap defaults se o profile não for prod | L19–24; `ProductionSafetyChecks` só prod/RENDER |
| CRÍTICO | Um teste: `contextLoads` | `WeperApplicationTests` |
| ALTO | CORS `*` default | L15; `CorsConfig` |
| ALTO | Sem rate limit no login | `SecurityConfig` |
| ALTO | MASTER sem storeId não aplica filtro | `StoreHibernateFilterAspect` L27–30 |
| ALTO | GET dashboard/employees = qualquer autenticado | `SecurityConfig` L82 |
| ALTO | `getAllOrders` N+1 + sem página | `OrderService` |
| ALTO | Sem idempotência create/close | controllers de pedido |
| MÉDIO | Product.category EAGER; imagens TEXT no JSON | `Product.java` |
| MÉDIO | Swagger público | `SecurityConfig` L59 |
| MÉDIO | Sem actuator / correlation id | `pom.xml` |

**Adequado:** `JwtAuthenticationFilter` recarrega User; `StoreAccess` + filtro para usuário de loja; close rejeita já CLOSED; `ensureUser` não reseta senha do SUPER_ADMIN; `ProductionSafetyChecks` em prod.

---

## 8. Integração

| Tema | Problema |
|------|----------|
| Pedido | Só Android cria; web só consulta/fecha |
| Prefixos | `/api/*` (auth, stores, employees) vs legado `/product`, `/tables` |
| Órfãos | `/api/waiters/**`, `GET /api/auth/me`, vários GET byId, `delete/all` |
| Deprecated | Android ainda declara `POST /order/new`; backend rejeita |
| Taxa 10% | Calculada na UI (`CheckoutDialog`) e de novo no backend |
| Erros | Envelopes diferentes; 401 web redireciona, Android faz logout |
| Refresh | Não existe nos três |
| KDS vs caixa | `Order.status` CLOSED e `kitchenStatus` independentes |

---

## 9. Performance

Gargalos identificados no código (sem números de prod):

1. `GET /order/all` + loop de extras (N+1).
2. `GET /product/all` / `/category/all` sem página; imagens em data URL.
3. Polling 12s × (KDS web + turno Android) por sessão aberta.
4. Bundle web: Firebase + recharts + MUI charts + react-beautiful-dnd + Kitchen no chunk do Dashboard.
5. Vários clientes OkHttp no Android.
6. `runBlocking` na abertura de categorias.

**BASELINE NECESSÁRIO:** tempo de `GET /kitchen/orders`, `GET /order/all`, `GET /product/all`, TTI da `/app`, startup Android, requests/min por loja no KDS.

---

## 10. Robustez

| Falha | Android | Web | Backend |
|-------|---------|-----|---------|
| API cai | Mensagem via `ErrorHandler`; sem fila | Toast/erro Axios; sem retry global | — |
| Internet cai | Sem sync | Sem `navigator.onLine` | — |
| Request lento | Timeout OkHttp 45s/15s | **Sem timeout** | Thread preso até o client |
| Clique duplo | Debounce parcial | Checkout tem `closing`; Kitchen frágil | Close já CLOSED falha; create **duplica** |
| Sessão expira | Logout (sem refresh) | Redirect login | 401 |
| Dois caixas na mesma mesa | Corre-se pelo status | Idem | Sem lock otimista explícito |

---

## 11. Segurança

Não reproduzir valores de secret. Locais de risco:

| Risco | Onde | Sev. |
|-------|------|------|
| JWT default | `application.properties` `app.jwt.secret` | CRÍTICO se não-prod |
| Bootstrap SUPER_ADMIN default | mesmo arquivo `BOOTSTRAP_SUPER_*` | CRÍTICO se exposto |
| DEMO `123456` | `DemoStoreCatalog` se `DEMO_SEED=true` | ALTO |
| CORS `*` | `app.cors.allowed-origins` | ALTO em prod |
| Token Android em claro + backup | DataStore Proto | CRÍTICO |
| Token web `localStorage` | `session.js` | ALTO (XSS) |
| Swagger público | `SecurityConfig` | MÉDIO |
| Sem rate limit login | — | ALTO |
| Authz frouxa em GET | dashboard, employees, waiters | ALTO |
| Padding JWT &lt; 32 bytes | `JwtTokenProvider` | ALTO |
| PII Crashlytics | Login/pedido Android | ALTO |

---

## 12. Banco de dados

- Schema via Hibernate `update` + patches JDBC em `DataInitializer`. **Sem migrations versionadas.**
- Filtro `store_id` nas entidades de operação. Filhos do pedido (`OrderItem`, extras, mandatory) **sem** `store_id` próprio.
- Unique composto só pontual (`Category` store+name). Pedidos/status sem índices explícitos encontrados.
- Soft-delete em Table/Comanda; Product é hard delete.
- Dual escrita: `order_product` ManyToMany **e** `tb_order_item`.

---

## 13. Arquivos candidatos à remoção

| Projeto | Arquivo | Evidência | Confiança | Risco |
|---------|---------|-----------|-----------|-------|
| Android | `checkout/`, `contact/`, `tableSales/` | pastas vazias | Alta | Baixo |
| Android | `commons.base.BaseActivity` | zero imports | Alta | Baixo |
| Android | Register (fora do Manifest) | mock | Alta | Médio se planejado |
| Web | `dashboard/overview/*` template MUI | não no Dashboard | Alta | Baixo |
| Web | `inventory/**`, `financial/**`, `settings/**` | não montados | Alta | Médio (produto) |
| Web | seções landing órfãs | não em `Home.js` | Média | Baixo |
| Backend | `ServletInitializer` | packaging jar | Média | Baixo |
| Backend | `GroupOrderMigration` a cada boot | ApplicationRunner | Média | Médio |

---

## 14. Dependências candidatas

| Projeto | Dep | Evidência |
|---------|-----|-----------|
| Web | `styled-components`, `@mui/styled-engine-sc` | zero imports |
| Web | `@mui/x-charts` | só Chart.js órfão |
| Web | `firebase` | init sem login |
| Web | `tailwind-merge`, `@fontsource/roboto` | zero usos |
| Android | plugin Compose no root | não aplicado no app |
| Android | plugin kapt | projeto usa ksp |
| Backend | MapStruct 1.4.2 / springdoc 2.0.2 | revisão de compat (não remover) |
| Backend | falta actuator, validation starter, Flyway | gap, não remoção |

---

## 15. Estrutura sugerida

### Android

```text
ATUAL: feature packages + DI que recria Retrofit
SUGERIDA: manter features; um NetworkModule compartilhado;
          data/domain/presentation consistentes (repository vs model.repository);
          tirar ViewModel → DataSource direto.
```

Benefício: menos clientes HTTP e menos duplicação. **Não** migrar para Compose agora.

### Web

```text
ATUAL: routes/dashboard/<feature> + contexts globais
SUGERIDA: lazy por rota (/app, /admin, /cozinha);
          um api client; mortos fora do bundle;
          Kitchen fatiado (board, poll, persist).
```

Não reescrever em TypeScript de uma vez.

### Backend

```text
ATUAL: package por domínio (bom)
SUGERIDA: manter; unificar prefixo /api quando houver gateway;
          Flyway; Pageable nas listagens;
          @PreAuthorize além do matcher por path.
```

Não quebrar em microserviços.

---

## 16. Quick wins

1. Timeout Axios (10–15s).
2. Tirar `runBlocking` de `CategoriesFragment`.
3. `isMinifyEnabled` + `BASE_URL` real no flavor release.
4. CORS explícito em prod (já há env; forçar, não só warn).
5. Fechar Swagger em prod.
6. Lazy `Dashboard` / `MasterDashboard` / `Kitchen`.
7. Remover styled-components/firebase do bundle se Auth não for usado.
8. Rate limit no `POST /api/auth/login`.

---

## 17. Mudanças estruturais

- Flyway no lugar de `ddl-auto=update`.
- Idempotency-Key em create/close.
- Paginação + fetch join nas listagens de pedido.
- Decisão de produto: pedido na web e/ou baixa de estoque.
- Encrypted session no Android.
- Testes de isolamento tenant + fluxo close.

---

## 18. O que NÃO devemos mexer

- `TenantContext` + filtro Hibernate + `StoreAccess` (ajustar o bypass MASTER, não reescrever).
- `JwtAuthenticationFilter` (reload User + gate assinatura).
- `ProductionSafetyChecks` e regra de não resetar senha do SUPER_ADMIN.
- Contratos de path já usados pelos dois clientes.
- Lógica de close (mesa/comanda/balcão) sem testes primeiro.
- Fluxo Atendimento → Checkout na web.
- Impressão térmica Android.
- Restrição de login Android a WAITER/CASHIER (se for regra).

---

## 19. Top 20 melhorias

1. Secrets/CORS/rate limit/Swagger em produção  
2. Criptografar token Android + backup  
3. Isolar MASTER sem storeId  
4. Flyway  
5. Remover `runBlocking`  
6. BASE_URL/minify release  
7. Paginar + N+1 pedidos  
8. Idempotência pedido  
9. Restringir GET dashboard/employees  
10. Timeout Axios  
11. Code-split web  
12. Decidir pedido na web  
13. Decidir estoque (baixar ou parar de alertar)  
14. Testes isolamento tenant  
15. Testes E2E pedido-KDS-caixa  
16. Medir polling 12s (não WS ainda)  
17. Autorização por role consistente  
18. Limpar código/deps mortos  
19. Correlation ID + health  
20. Unificar prefixo `/api` com os clientes  

---

## 20. Roadmap

```text
FASE 0  Segurança (JWT, CORS, token, Swagger, rate limit)
FASE 1  Multi-tenant MASTER + GET sensíveis
FASE 2  Quick wins (runBlocking, timeout, BASE_URL, lazy)
FASE 3  Banco (Flyway, índices, paginação, N+1)
FASE 4  Integração (idempotência, pedido web?, estoque?)
FASE 5  Limpeza (mortos Android/Web)
FASE 6  Android robustez (offline só se produto pedir)
FASE 7  Web performance (bundle, Kitchen split)
FASE 8  Polling: medir; WS só com baseline
FASE 9  Testes do fluxo crítico
FASE 10 Observabilidade (actuator, request id)
```
