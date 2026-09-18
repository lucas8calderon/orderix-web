# 04 — Arquitetura do Android

Repositório: `weper-android`. Módulo único `:app`. Package: `weper.solutions`. Application: `WeperApplication` (`@HiltAndroidApp`).

## Stack real (vs README)

O README cita Room, Firebase Auth, Firestore e Picasso. O Gradle/código **não** têm Compose runtime de UI, Room, Koin, WorkManager nem FCM messaging.

| Item | Realidade |
|------|-----------|
| UI | XML + ViewBinding, Navigation + Safe Args |
| DI | Hilt 2.51.1 |
| Rede | Retrofit 2.11 + Gson + OkHttp |
| Async | Coroutines + LiveData (StateFlow só em `ShiftAttentionStore`) |
| Sessão | DataStore Proto (`user_session.pb`) |
| Offline | **Não** (sem Room; cache em memória de produtos) |
| Impressão | ESCPOS ThermalPrinter Bluetooth |
| Crash | Firebase Crashlytics |
| minSdk / target | 26 / 35 |

`BuildConfig.BASE_URL`: debug via `-PdebugApiUrl` ou `local.properties` `debug.api.url` (ex.: `http://192.168.15.9:8080/`); release placeholder `https://YOUR-BACKEND-HOST.onrender.com/`.

## Activities (Manifest)

| Activity | Papel |
|----------|--------|
| `LoginActivity` | LAUNCHER |
| `MainActivity` | Shell + bottom nav + polling de turno |
| `ForgotPasswordActivity` | Stub local, sem API |
| `ThermalPrinterActivity` | Bluetooth |

`RegisterActivity` existe e **não** está no Manifest.

## Fragments (`nav_graph.xml`)

| Fragment | Função |
|----------|--------|
| `HomeFragment` | Cards Balcão / Mesas / Comandas + turno |
| `AtendimentoFragment` | Hub de atendimento |
| `TablesFragment` | Lista mesas |
| `ComandasFragment` | Lista comandas |
| `CategoriesFragment` | Catálogo |
| `ProductsFragment` | Produtos da categoria |
| `ProductDetailFragment` | Detalhe, extras, mandatory, qty |
| `CartFragment` | Carrinho |
| `OrderConfirmationFragment` | Confirmação (`OrderConfirmationViewModel` vazio) |
| `GroupOrderFragment` | Conta da mesa/comanda |
| `CounterOrderFragment` | No graph, **sem action de entrada a partir do Home** (balcão vai a categorias) |
| `OrdersFragment` / `OrderDetailsFragment` | Lista/detalhe |
| `ShiftOrdersFragment` | Pedidos do turno (prontos/preparo) |
| `AccountFragment` | Conta / logout / tema |

## Camadas por feature

Padrão: `presentation` (Fragment + ViewModel) → `domain` (UseCase + Repository interface) → `data` (RepositoryImpl + DataSource + Retrofit API).

Carrinho **não** tem repository: estado só em `CartViewModel`.

## ViewModels e UseCases

| ViewModel | UseCases / repos principais |
|-----------|-----------------------------|
| `LoginViewModel` | `PostAuthenticationUseCase` |
| `HomeViewModel` | `GetHomeOptionsUseCase`, `GetShiftOverviewUseCase` |
| `TablesViewModel` | `GetAllTablesUseCase`, `GetGroupOrderByTableUseCase` |
| `ComandasViewModel` | `GetAllComandasUseCase`, `GetGroupOrderByComandaUseCase` |
| `CategoriesViewModel` | `GetCategoriesUseCase` |
| `ProductsViewModel` / `ProductDetailViewModel` | `GetProductsUseCase` + extras |
| `CartViewModel` | `CreateOrderInGroupUseCase` |
| `GroupOrderViewModel` | close mesa/comanda, `UpdateKitchenStatusUseCase` |
| `OrderDetailsViewModel` | `CloseCounterOrderUseCase` |
| `OrdersViewModel` | `GetAllOrdersUseCase` (`GET /order/all`) |
| `ThermalPrinterViewModel` | scan/connect/print |
| `ForgotPasswordViewModel` / `RegisterViewModel` | stubs |

## Retrofit APIs

| Interface | Endpoints |
|-----------|-----------|
| `AuthAPI` | `POST api/auth/login` |
| `HomeAPI` | `GET home/options/all`, `GET home/shift` |
| `TablesAPI` | `GET tables/all`, `GET tables/{tableId}/orders` |
| `ComandasAPI` | `GET comandas/all`, `GET comandas/{id}/orders` |
| `CategoriesAPI` | `GET category/all` |
| `ProductsAPI` | `GET product/all`, `GET product/getByCategoryId`, `POST product/new`, extras |
| `GroupOrderAPI` | `POST tables/{id}/orders`, close mesa/comanda/balcão |
| `OrderAPI` | `POST order/new` (**wired no DI; carrinho não usa**), `GET order/all` |
| `KitchenAPI` | `PATCH kitchen/orders/{id}/status` |

## Autenticação

```text
LoginActivity
  → LoginViewModel
  → PostAuthenticationUseCase
  → AuthenticationRepository
  → AuthAPI
  → POST api/auth/login
```

Após resposta:

1. Aceita só `WAITER` ou `CASHIER` **e** `waiterId != null`.
2. Grava `UserSession` no DataStore Proto (token, storeId, storeName, waiterId, role…).
3. `AuthInterceptor` envia `Authorization: Bearer`.
4. `RefreshTokenInterceptor`: em 401 **limpa sessão** e abre `LoginActivity`. **Não renova token** (há campo `refreshToken` praticamente não usado).

Não há tela de seleção de estabelecimento. `storeId` vem no `AuthUserDto` do login e não é reenviado nas requests.

## Fluxos de tela → API

```text
LOGIN
LoginActivity → AuthAPI → POST api/auth/login

HOME
HomeFragment → HomeAPI → GET home/options/all
                       → GET home/shift   (também a cada 12s na MainActivity)

MESA
TablesFragment → TablesAPI GET tables/all
  → GroupOrderFragment → GET tables/{tableId}/orders
  → Categories…Cart → POST tables/{tableId}/orders
  → fechar → POST tables/{tableId}/group-orders/close

COMANDA
ComandasFragment → GET comandas/all
  → setComandaInfo (tableId forçado 999)
  → POST tables/999/orders  (body com comandaId)
  → GET comandas/{id}/orders
  → POST comandas/{id}/orders/close

BALCÃO
HomeFragment.startCounterSale()  (tableId=999, waiterId=999)
  → catálogo → carrinho (exige paymentType)
  → POST tables/999/orders  (paymentMethod no body)
  → POST counter/orders/{orderId}/close  (se fechar depois)

KDS
Não há tela KDS. Garçom pode PATCH kitchen/orders/{id}/status
e ver prontos via GET home/shift.
```

## Offline / sync

Inexistente para domínio. UI de “Sincronização” na conta é texto estático. Marks locais do garçom (`WaiterOrderMarksRepository`, Preferences DataStore) **não** fecham conta no servidor.

## Gaps Android

- `OrderAPI.createOrderWithProducts` (`POST /order/new`) está no DI, mas o backend **lança deprecated** e o cart usa `GroupOrderAPI`.
- `OrdersViewModel` força display (`saleType="balcao"`, `isPaid=true`, `orderStatus="fazendo"`).
- `CounterOrderFragment` no graph sem navegação clara do Home.
- Pastas vazias: `checkout`, `tableSales`, `contact`.
- Role `KITCHEN` aparece em label da conta, mas o login rejeita quem não é WAITER/CASHIER.
