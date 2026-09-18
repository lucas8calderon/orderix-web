# 14 — Mapa de endpoints

Base web: `REACT_APP_API_BASE_URL` (default `http://localhost:8080`).  
Base Android: `BuildConfig.BASE_URL`.  
Autenticação padrão: `Authorization: Bearer <JWT>`, exceto login e assets públicos.

Legenda origem: **Web**, **Android**, **Nenhum cliente** (só API), **Deprecated**.

## Auth e plataforma

| Método | Endpoint | Origem | Controller | Service | Repository | Entidade |
|--------|----------|--------|------------|---------|------------|----------|
| POST | `/api/auth/login` | Web, Android | `AuthController` | `AuthService` | `UserRepository` | `User` |
| GET | `/api/auth/me` | Nenhum cliente | `AuthController` | `AuthService` | `UserRepository` | `User` |
| GET | `/api/stores` | Web master | `StoreController` | `StoreService` | `StoreRepository` | `Store` |
| GET | `/api/stores/{id}` | Service web definido, **não chamado** | `StoreController` | `StoreService` | `StoreRepository` | `Store` |
| GET | `/api/stores/dashboard` | Web master | `StoreController` | `StoreService` | `StoreRepository` | `Store` |
| POST | `/api/stores` | Web master | `StoreController` | `StoreService` | `StoreRepository`, `UserRepository` | `Store`, `User`, `Subscription` |
| PUT | `/api/stores/{id}` | Web master | `StoreController` | `StoreService` | idem | `Store`, `User`, `Subscription` |

## Colaboradores e garçons

| Método | Endpoint | Origem | Controller | Service | Repository | Entidade |
|--------|----------|--------|------------|---------|------------|----------|
| GET | `/api/employees` | Web | `EmployeeController` | `EmployeeService` | `UserRepository` | `User` |
| POST | `/api/employees` | Web | `EmployeeController` | `EmployeeService` | `UserRepository`, `WaiterRepository` | `User`, `Waiter` |
| PUT | `/api/employees/{id}` | Web | `EmployeeController` | `EmployeeService` | idem | `User` |
| DELETE | `/api/employees/{id}` | Web | `EmployeeController` | `EmployeeService` | idem | `User` |
| GET | `/api/waiters` | Nenhum cliente mapeado | `WaiterController` | `WaiterService` | `WaiterRepository` | `Waiter` |
| GET | `/api/waiters/active` | Nenhum cliente | `WaiterController` | `WaiterService` | `WaiterRepository` | `Waiter` |
| GET | `/api/waiters/{id}` | Nenhum cliente | `WaiterController` | `WaiterService` | `WaiterRepository` | `Waiter` |
| POST | `/api/waiters` | Nenhum cliente | `WaiterController` | `WaiterService` | `WaiterRepository` | `Waiter` |
| PUT | `/api/waiters/{id}` | Nenhum cliente | `WaiterController` | `WaiterService` | `WaiterRepository` | `Waiter` |
| DELETE | `/api/waiters/{id}` | Nenhum cliente | `WaiterController` | `WaiterService` | `WaiterRepository` | `Waiter` |

## Catálogo

| Método | Endpoint | Origem | Controller | Service | Repository | Entidade |
|--------|----------|--------|------------|---------|------------|----------|
| GET | `/category/all` | Web, Android | `CategoryController` | `CategoryService` | `CategoryRepository` | `Category` |
| GET | `/category/getById` | Nenhum cliente | `CategoryController` | `CategoryService` | `CategoryRepository` | `Category` |
| POST | `/category/new` | Web | `CategoryController` | `CategoryService` | `CategoryRepository` | `Category` |
| PUT | `/category/update?categoryId=` | Web | `CategoryController` | `CategoryService` | `CategoryRepository` | `Category` |
| DELETE | `/category/deleteById?categoryId=` | Web | `CategoryController` | `CategoryService` | `CategoryRepository` | `Category` |
| DELETE | `/category/delete/all` | Nenhum cliente | `CategoryController` | `CategoryService` | `CategoryRepository` | `Category` |
| GET | `/product/all` | Web, Android | `ProductController` | `ProductService` | `ProductRepository` | `Product` |
| GET | `/product/getByCategoryId?categoryId=` | Web, Android | `ProductController` | `ProductService` | `ProductRepository` | `Product` |
| GET | `/product/getByProductId?productId=` | Nenhum cliente | `ProductController` | `ProductService` | `ProductRepository` | `Product` |
| POST | `/product/new` | Web (Android API existe) | `ProductController` | `ProductService` | `ProductRepository` | `Product` |
| PUT | `/product/update?productId=` | Web | `ProductController` | `ProductService` | `ProductRepository` | `Product` |
| DELETE | `/product/delete?productId=` | Web | `ProductController` | `ProductService` | `ProductRepository` | `Product` |
| DELETE | `/product/delete/all` | Nenhum cliente | `ProductController` | `ProductService` | `ProductRepository` | `Product` |
| POST | `/product/extra/new` | Android GET extras; POST não mapeado na web | `ProductExtraController` | `ProductExtraService` | `ProductExtraRepository` | `ProductExtra` |
| GET | `/product/extra` | Android | `ProductExtraController` | `ProductExtraService` | `ProductExtraRepository` | `ProductExtra` |
| GET | `/product/extra/{id}` | Android | `ProductExtraController` | `ProductExtraService` | `ProductExtraRepository` | `ProductExtra` |
| GET | `/product/extra/byProduct?productId=` | Android | `ProductExtraController` | `ProductExtraService` | `ProductExtraRepository` | `ProductExtra` |
| PUT | `/product/extra/{id}` | Nenhum cliente web | `ProductExtraController` | `ProductExtraService` | `ProductExtraRepository` | `ProductExtra` |
| DELETE | `/product/extra/{id}` | Nenhum cliente web | `ProductExtraController` | `ProductExtraService` | `ProductExtraRepository` | `ProductExtra` |
| POST | `/product/mandatory-groups` | Nenhum cliente web mapeado | `MandatoryGroupController` | `MandatoryGroupService` | `MandatoryGroupRepository` | `MandatoryGroup` |
| POST | `/product/mandatory-groups/products/{productId}/assign/{groupId}` | Nenhum cliente web mapeado | `MandatoryGroupController` | `MandatoryGroupService` | — | `Product`/`MandatoryGroup` |
| GET | `/product/mandatory-groups/products/{productId}` | Nenhum cliente web mapeado (Android lê via product DTO) | `MandatoryGroupController` | `MandatoryGroupService` | — | `MandatoryGroup` |

## Mesas, comandas, pedidos

| Método | Endpoint | Origem | Controller | Service | Repository | Entidade |
|--------|----------|--------|------------|---------|------------|----------|
| GET | `/tables/all` | Web, Android | `TableController` | `TableService` | `TableRepository` | `Table` |
| GET | `/tables/available` | Nenhum cliente | `TableController` | `TableService` | `TableRepository` | `Table` |
| GET | `/tables/unavailable` | Nenhum cliente | `TableController` | `TableService` | `TableRepository` | `Table` |
| POST | `/tables/new` | Web | `TableController` | `TableService` | `TableRepository` | `Table` |
| DELETE | `/tables/delete?tableId=` | Web | `TableController` | `TableService` | `TableRepository` | `Table` |
| DELETE | `/tables/delete/all` | Nenhum cliente | `TableController` | `TableService` | `TableRepository` | `Table` |
| POST | `/tables/{tableId}/orders` | **Android** | `GroupOrderController` | `GroupOrderService` + `OrderService` | `GroupOrderRepository`, `OrderRepository` | `GroupOrder`, `Order`, `OrderItem` |
| GET | `/tables/{tableId}/orders` | Web, Android | `GroupOrderController` | `GroupOrderService` | idem | `GroupOrder` / sintético 999 |
| POST | `/tables/{tableId}/group-orders/close` | Web, Android | `GroupOrderController` | `GroupOrderService` | idem | `GroupOrder`, `Order`, `Table` |
| GET | `/comandas/all` | Web, Android | `ComandaController` | `ComandaService` | `ComandaRepository` | `Comanda` |
| POST | `/comandas/new` | Web | `ComandaController` | `ComandaService` | `ComandaRepository` | `Comanda` |
| DELETE | `/comandas/delete?comandaId=` | Web | `ComandaController` | `ComandaService` | `ComandaRepository` | `Comanda` |
| GET | `/comandas/{comandaId}/orders` | Web, Android | `ComandaOrderController` | `ComandaAccountService` | `OrderRepository` | `Order` (DTO GroupOrder) |
| POST | `/comandas/{comandaId}/orders/close` | Web, Android | `ComandaOrderController` | `ComandaAccountService` | `OrderRepository` | `Order`, `Comanda` |
| POST | `/counter/orders/{orderId}/close` | Android | `CounterOrderController` | `OrderService` | `OrderRepository` | `Order` |
| GET | `/order/all` | Android | `OrderController` | `OrderService` | `OrderRepository` | `Order` |
| POST | `/order/new` | Deprecated (Android ainda declara) | `OrderController` | — | — | — |
| GET | `/order/getByTable` | Deprecated | `OrderController` | — | — | — |
| PUT | `/order/edit` | Deprecated | `OrderController` | — | — | — |

## Cozinha, home, dashboard

| Método | Endpoint | Origem | Controller | Service | Repository | Entidade |
|--------|----------|--------|------------|---------|------------|----------|
| GET | `/kitchen/orders` | Web KDS | `KitchenController` | `KitchenService` | `OrderRepository` | `Order` |
| PATCH | `/kitchen/orders/{orderId}/status` | Web, Android | `KitchenController` | `KitchenService` | `OrderRepository` | `Order` |
| GET | `/dashboard/overview?period=` | Web | `DashboardController` | `DashboardService` | vários | agregados |
| GET | `/home/options/all` | Android | `HomeController` | estático | — | `HomeDTO` |
| GET | `/home/shift` | Android | `ShiftOverviewController` | `ShiftOverviewService` | `OrderRepository` | `Order` |

## Público / docs

| Método | Endpoint | Notas |
|--------|----------|-------|
| GET | `/swagger-ui/**`, `/v3/api-docs/**` | público |
| GET | `/images/**` | público |
| OPTIONS | `/**` | CORS |

Prefixos mistos são reais: recursos novos em `/api/*`, legado em `/category`, `/product`, `/tables`, `/order`, `/kitchen`.
