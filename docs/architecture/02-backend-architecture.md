# 02 — Arquitetura do backend

Repositório: `weper-backend`. Package raiz: `weper.solutions.backend`. Entry point: `WeperApplication`.

## Stack

- Spring Boot 3.2.5 / Java 17 / Maven
- `spring-boot-starter-web`, `data-jpa`, `security`, `aop`
- PostgreSQL driver
- JJWT 0.12.6
- MapStruct 1.4.2.Final + Lombok
- springdoc-openapi 2.0.2
- Bind: `server.address=0.0.0.0`, `server.port=${PORT:8080}` (compatível com Render)

## Packages

```text
weper.solutions.backend
├── app.home          HomeController, ShiftOverviewController
├── auth              AuthController, AuthService, JwtTokenProvider
├── category          Category CRUD
├── comanda           Comanda CRUD
├── dashboard         Dashboard operacional da loja
├── employee          Funcionários (User da loja)
├── exception         GlobalExceptionHandler, ApiError
├── media             DefaultMenuImage
├── order             Order, GroupOrder, Kitchen, ComandaAccount, Counter
├── product           Product, Extra, MandatoryGroup
├── security          SecurityConfig, JWT filter, TenantContext, CORS, Hibernate aspect
├── store             Store + StoreAccess + StoreFilters
├── subscription      planos/assinatura
├── table             mesas
├── user              User, Role, UserPrincipal
├── waiter            garçons (entidade Waiter 1:1 User)
├── DataInitializer   bootstrap SUPER_ADMIN / demo seed
└── GroupOrderMigration  ApplicationRunner legado
```

## Controllers

| Controller | `@RequestMapping` | Papel |
|------------|-------------------|--------|
| `AuthController` | `/api/auth` | Login e `/me` |
| `StoreController` | `/api/stores` | CRUD lojas (MASTER/SUPER_ADMIN) |
| `EmployeeController` | `/api/employees` | CRUD usuários da loja |
| `WaiterController` | `/api/waiters` | CRUD entidade `Waiter` |
| `CategoryController` | `/category` | CRUD categorias |
| `ProductController` | `/product` | CRUD produtos |
| `ProductExtraController` | `/product/extra` | Extras |
| `MandatoryGroupController` | `/product/mandatory-groups` | Grupos obrigatórios |
| `TableController` | `/tables` | CRUD mesas |
| `GroupOrderController` | `/tables` | Pedidos de mesa/balcão |
| `ComandaController` | `/comandas` | CRUD comandas |
| `ComandaOrderController` | `/comandas` | Conta da comanda |
| `CounterOrderController` | `/counter/orders` | Fechar pedido de balcão |
| `OrderController` | `/order` | `GET /all` ativo; `new/edit/getByTable` **deprecated** |
| `KitchenController` | `/kitchen` | KDS |
| `DashboardController` | `/dashboard` | Overview da loja |
| `HomeController` | `/home` | Cards estáticos Balcão/Mesas/Comandas |
| `ShiftOverviewController` | `/home` | Overview do turno do garçom |

Lista completa de métodos: [14-api-map.md](./14-api-map.md).

## Services

| Service | Responsabilidade |
|---------|------------------|
| `AuthService` | Login (email ou username), BCrypt, loja ativa, JWT, `alignWaiterStore` |
| `StoreService` | CRUD `Store`, cria `User` STORE_ADMIN + `Subscription` |
| `SubscriptionService` | Criar/atualizar assinatura; `isSubscriptionActive` |
| `EmployeeService` | CRUD `User` da loja; roles STORE_ADMIN/WAITER/KITCHEN/CASHIER; `ensureForUser` se floor operator |
| `WaiterService` | CRUD `Waiter` + User; `ensureForUser` |
| `CategoryService` | CRUD categorias |
| `ProductService` | CRUD produtos; campo `quantity` é cadastro, não movimento |
| `ProductExtraService` | Extras |
| `MandatoryGroupService` | Grupos obrigatórios e assign a produto |
| `TableService` | CRUD mesas (`deleted`) |
| `ComandaService` | CRUD comandas |
| `OrderService` | Cria `Order` + `OrderItem` + extras + mandatory; fecha balcão; totais |
| `OrderMandatoryValidationService` | Valida seleções obrigatórias |
| `GroupOrderService` | Conta de mesa; `tableId==999` desvia para pedido avulso |
| `ComandaAccountService` | Conta aberta e fechamento de comanda |
| `KitchenService` | Lista KDS + atualiza `KitchenStatus` |
| `DashboardService` | Overview financeiro/operacional/estoque crítico |
| `ShiftOverviewService` | Visão do turno |

## Repositories ↔ entidades

| Repository | Entidade | Tabela |
|------------|----------|--------|
| `StoreRepository` | `Store` | `tb_store` |
| `UserRepository` | `User` | `tb_user` |
| `SubscriptionRepository` | `Subscription` | `tb_subscription` |
| `CategoryRepository` | `Category` | `tb_category` |
| `ProductRepository` | `Product` | `tb_product` |
| `ProductExtraRepository` | `ProductExtra` | `tb_product_extra` |
| `MandatoryGroupRepository` | `MandatoryGroup` | `tb_mandatory_group` |
| `MandatoryItemRepository` | `MandatoryItem` | `tb_mandatory_item` |
| `TableRepository` | `Table` | `tb_table` |
| `ComandaRepository` | `Comanda` | `tb_comanda` |
| `WaiterRepository` | `Waiter` | `tb_waiter` |
| `OrderRepository` | `Order` | `tb_order` |
| `OrderItemRepository` | `OrderItem` | `tb_order_item` |
| `OrderProductExtraRepository` | `OrderProductExtra` | `tb_order_product_extra` |
| `OrderMandatorySelectionRepository` | `OrderMandatorySelection` | `tb_order_mandatory_selection` |
| `GroupOrderRepository` | `GroupOrder` | `tb_group_order` |

## DTOs e mappers

**MapStruct** (`@Mapper(componentModel = "spring")`): `OrderMapper`, `ProductMapper`, `CategoryMapper`, `TableMapper`, `ComandaMapper`, `WaiterMapper`, `MandatoryGroupMapper`, `MandatoryItemMapper`.

**Montagem manual:** Store, Employee, Auth, GroupOrder, Dashboard, Shift.

DTOs de request/response relevantes: `LoginRequest`/`LoginResponse`, `AuthUserDTO`, `CreateStoreRequest`, `UpdateStoreRequest`, `CreateEmployeeRequest`, `EmployeeDTO`, `WaiterDTO`, `CategoryDTO`, `ProductDTO`, `ProductExtraDTO`, `MandatoryGroupDTO`, `OrderDTO`, `GroupOrderDTO`, `CloseGroupOrderRequest`, `CloseCounterOrderRequest`, `KitchenStatusRequest`, `StoreOverviewDTO`, `ShiftOverviewDTO`, `HomeDTO`.

## Segurança

Não há `@PreAuthorize`. Tudo em `SecurityConfig.authorizeHttpRequests`.

Público: `OPTIONS /**`, Swagger, `GET /images/**`, `POST /api/auth/login`.

| Recurso | Roles |
|---------|-------|
| `/api/stores/**` | MASTER, SUPER_ADMIN |
| Mutação waiters/employees | ADMIN, STORE_ADMIN, MASTER, SUPER_ADMIN |
| Mutação tables/comandas/category/product | idem |
| Fechar mesa/comanda/balcão | WAITER, CASHIER + admins |
| PATCH kitchen status | WAITER, CASHIER, KITCHEN + admins |
| GET `/kitchen/**` | KITCHEN + admins (WAITER **não** lista o KDS) |
| Demais | autenticado |

`UserPrincipal.getAuthorities()`: MASTER e SUPER_ADMIN compartilham ambos os roles; ADMIN e STORE_ADMIN também.

Senha: BCrypt (`PasswordEncoder` bean). JWT HMAC, claims `sub` (userId), `username`, `role`, `storeId` (se houver loja), `iat`, `exp`.

Em runtime o `storeId` efetivo **não** vem do claim: `JwtAuthenticationFilter` recarrega `User` via `findByIdWithStore` e seta `TenantContext`.

Assinatura inativa: filtro responde **403** `SUBSCRIPTION_INACTIVE` (exceto `/api/auth*`).

## Multi-tenancy

Ver [06-multitenancy-flow.md](./06-multitenancy-flow.md). Resumo: `TenantContext` + Hibernate `@Filter storeFilter` via `StoreHibernateFilterAspect` em `*Service.*` (exceto auth, `StoreService`, `SubscriptionService`, `WaiterService.ensureForUser`). `StoreAccess.owned(...)` valida `entity.store.id == TenantContext.storeId`.

## Jobs / realtime / integrações

- Sem `@Scheduled`, `@Async`, WebSocket, SSE, filas.
- `DataInitializer` (`ApplicationRunner`): SUPER_ADMIN, patches de schema, seed demo opcional (`DEMO_SEED`).
- `GroupOrderMigration` (`ApplicationRunner`): migração legada de group orders.
- Sem gateway de pagamento, e-mail, storage de arquivos (imagens de cardápio vão como TEXT/base64 no JSON).

## Banco

- URL: `${DB_URL}` default `jdbc:postgresql://localhost:5432/weper`
- `ddl-auto=${DDL_OPTION:update}`
- Sem migrations versionadas
- CORS: `${CORS_ALLOWED_ORIGINS:*}`
