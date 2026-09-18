# 03 — Arquitetura do frontend web

Repositório: `weper-web`. SPA React 18 + CRA. Linguagem JavaScript.

Base HTTP: `process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'` (`src/services/apiConfig.js`).

## Estrutura

```text
src/
├── App.js                  rotas raiz
├── services/               apiConfig, auth, session, accessControl, firebase
├── theme/                  ThemeContext
├── commons/                hooks/componentes compartilhados
└── routes/
    ├── ProtectedRoute.js
    ├── home/               landing pública
    ├── login/
    ├── privacy/, subscription/
    ├── master/             /admin (MASTER / SUPER_ADMIN)
    └── dashboard/          /app (loja)
        ├── atendimento/, comandas/, tables/, kitchen/
        ├── menu/ (category, product)
        ├── employees/, dashboard-gerencial/
        ├── inventory/, settings/, financial/   órfãos / mock
        └── WaiterHome.js
```

## Rotas

Definidas em `App.js`. Paths canônicos em `accessControl.js` (`PATHS`).

| Path | Componente | Guard |
|------|------------|-------|
| `/` | `Home` | público |
| `/login` | `Login` | público |
| `/forgot-password` | `ForgotPassword` | público, **sem API** |
| `/privacy`, `/terms` | políticas | público |
| `/subscription-blocked` | `SubscriptionBlocked` | `ProtectedRoute` |
| `/app`, `/app/:section` | `Dashboard` | `StoreLayout` + `ProtectedRoute` |
| `/admin`, `/admin/:section` | `MasterDashboard` | `AdminLayout` + `ProtectedRoute` |
| `/dashboard` | redirect `/app` | legado |
| `/master/dashboard` | redirect `/admin` | legado |

### Seções `/app/:section` (`Dashboard.js` + `listItems.js`)

| Path | Componente | Quem acessa |
|------|------------|-------------|
| `/app/dashboard` | `DashboardGerencial` | ADMIN / STORE_ADMIN |
| `/app/atendimento` | `Atendimento` | ADMIN / STORE_ADMIN / CASHIER |
| `/app/cozinha` | `Kitchen` | ADMIN / STORE_ADMIN / KITCHEN |
| `/app/produtos` | `Menu` | ADMIN / STORE_ADMIN |
| `/app/colaboradores` | `Employees` | ADMIN / STORE_ADMIN |
| `/app/garcom` | `WaiterHome` | WAITER — **placeholder**, sem HTTP |

Paths em `PATHS` **sem tela montada**: `/app/estoque`, `/app/configuracoes`.

### Seções `/admin/:section`

| Path | Componente |
|------|------------|
| `/admin/dashboard` | `MasterOverview` |
| `/admin/restaurantes` | lista + form inline no `MasterDashboard` |
| `/admin/planos` | `MasterPlans` |
| `/admin/assinaturas` | `MasterSubscriptions` |

## Autenticação e sessão

| Item | Implementação |
|------|----------------|
| Login | `authService.login` → `POST /api/auth/login` `{ email, password }` |
| Token | `localStorage` chave `weper.token` (`session.js`) |
| User | `localStorage` chave `weper.user` |
| Refresh | **não existe** |
| Interceptor request | `Authorization: Bearer ${token}` |
| Interceptor 401 | `clearSession` + redirect `/login` |
| Interceptor 403 com “assinatura” | marca `subscriptionActive: false` → `/subscription-blocked` |
| Firebase | `initializeFirebase()` em `App.js`; **não usado no login** |
| Google OAuth | botão desabilitado (`GOOGLE_OAUTH_ENABLED`) |

## Roles

`ROLES` em `accessControl.js`: MASTER, SUPER_ADMIN, STORE_ADMIN, ADMIN, WAITER, KITCHEN, CASHIER.

`ProtectedRoute` exige autenticação + `canAccessRoute` (assinatura + `storeId` para não-platform + role). Menu filtrado por `dashboardItems[].roles`.

`ROLE_PERMISSIONS` é stub: o RBAC fino da UI é só rota/menu; a autorização real está no JWT/backend.

## Estado global

Sem Redux/Zustand. Contexts:

| Context | Arquivo | Papel |
|---------|---------|-------|
| `AppThemeProvider` | `theme/ThemeContext.js` | tema |
| `ProductProvider` | `menu/product/providers/ProductContext.js` | UI produtos |
| `CategoryProvider` | `menu/category/providers/CategoryContext.js` | UI categorias |
| `TablesProvider` | `tables/provider/TablesContext.js` | UI mesas |
| `ComandasProvider` | `comandas/provider/ComandasContext.js` | UI comandas |
| `EmployeesProvider` | `employees/provider/EmployeesContext.js` | UI colaboradores |

## Services HTTP (todos)

| Service | Endpoints |
|---------|-----------|
| `authService` | `POST /api/auth/login` |
| `storesService` | `GET/POST /api/stores`, `GET/PUT /api/stores/{id}`, `GET /api/stores/dashboard` |
| `employeesService` | CRUD `/api/employees` |
| `categoryService` | `/category/all`, `/new`, `/update`, `/deleteById` |
| `productService` | `/product/all`, `/new`, `/update`, `/delete`, `/getByCategoryId` |
| `tablesService` | `/tables/all`, `/new`, `/delete` |
| `comandasService` | `/comandas/all`, `/new`, `/delete` |
| `accountService` | `GET /tables/{id}/orders`, `POST /tables/{id}/group-orders/close`, equivalentes de comanda |
| `kitchenService` | `GET /kitchen/orders`, `PATCH /kitchen/orders/{id}/status` |
| `dashboardService` | `GET /dashboard/overview?period=` |

A web **não** chama `POST /tables/{id}/orders` (criação de pedido), `/counter/orders/{id}/close`, `/home/*`, `/api/waiters`, `/product/extra`, `/api/auth/me`.

## Mapa tela → API

```text
LoginPage / LoginForm
  → authService.login
  → POST /api/auth/login

MasterDashboard (Restaurantes)
  → storesService
  → GET/POST /api/stores, PUT /api/stores/{id}, GET /api/stores/dashboard

Employees
  → employeesService
  → CRUD /api/employees

Menu (Category + Product)
  → categoryService + productService
  → /category/*  e  /product/*

Atendimento (Tables + Comandas + CheckoutDialog)
  → tablesService, comandasService, accountService
  → CRUD mesas/comandas + GET conta + POST close

Kitchen
  → kitchenService
  → GET /kitchen/orders  (polling 12s)
  → PATCH /kitchen/orders/{id}/status

DashboardGerencial
  → dashboardService
  → GET /dashboard/overview

WaiterHome, ForgotPassword, Settings, Inventory
  → sem API de negócio
```

## Tenant na web

Comentário em `accessControl.js`: tenant vem do JWT; query params **não** devem trocar de loja. Requests enviam só `Authorization`. `user.storeId` fica na sessão para UI (`getRestaurantId`).

## Realtime

Polling 12s em `Kitchen.js` (`setInterval(loadOrders, 12000)`). Atendimento e dashboard recarregam sob ação do usuário.

## Telas órfãs / mock

- `Inventory.js`, `Settings.js` — mock local, não montados no `Dashboard`
- `Financial`, `Orders`, `Overview`, `Chart`, `Deposits`, `Establishment`, `Checkout.js` — legado não ligado às rotas atuais
- `MasterOverview` usa `mockRevenueHistory.js` para parte do gráfico de receita
- `getStoreById` existe no service e **não é chamado**
