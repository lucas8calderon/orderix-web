# Fluxograma do sistema Weper / Weper

Fluxos extraídos do código real (`weper-backend`, `weper-web`, `weper-android`).  
No Cursor ou no GitHub, os blocos Mermaid renderizam como diagrama.

---

## 1. Arquitetura geral

```mermaid
flowchart TB
    subgraph usuarios [Usuários]
        Master[MASTER / SUPER_ADMIN]
        Admin[STORE_ADMIN]
        Caixa[CASHIER]
        Cozinha[KITCHEN]
        Garcom[WAITER]
    end

    subgraph web [weper-web — React SPA]
        AdminPanel["/admin<br/>lojas e assinaturas"]
        StoreApp["/app<br/>catálogo, colaboradores, dashboard"]
        Atendimento["/app/atendimento<br/>caixa"]
        KDS["/app/cozinha<br/>polling 12s"]
    end

    subgraph android [weper-android — Kotlin]
        AppGarcom["App garçom / caixa<br/>mesa, comanda, balcão"]
    end

    subgraph backend [weper-backend — Spring Boot]
        API["REST + JWT<br/>TenantContext storeId"]
    end

    PG[(PostgreSQL)]

    Master --> AdminPanel
    Admin --> StoreApp
    Caixa --> Atendimento
    Cozinha --> KDS
    Garcom --> AppGarcom
    Caixa --> AppGarcom

    AdminPanel -->|Axios Bearer| API
    StoreApp -->|Axios Bearer| API
    Atendimento -->|Axios Bearer| API
    KDS -->|Axios Bearer| API
    AppGarcom -->|Retrofit Bearer| API
    API -->|JPA storeFilter| PG
```

---

## 2. Jornada completa do estabelecimento

```mermaid
flowchart TD
    A[MASTER faz login na web] --> B[POST /api/auth/login]
    B --> C[Cria loja em /admin/restaurantes]
    C --> D[POST /api/stores]
    D --> E[tb_store + User STORE_ADMIN + tb_subscription]

    E --> F[STORE_ADMIN faz login]
    F --> G[Cadastro de colaboradores]
    G --> H[POST /api/employees]
    H --> I{Role}

    I -->|WAITER / CASHIER| J[Cria User + Waiter]
    I -->|KITCHEN / STORE_ADMIN| K[Cria só User]

    J --> L[Cadastro de categorias e produtos]
    K --> L
    L --> M["/category/* e /product/*"]
    M --> N[Cadastro de mesas e comandas]
    N --> O["POST /tables/new e /comandas/new"]

    O --> P[Garçom entra no Android]
    P --> Q[POST api/auth/login]
    Q --> R{WAITER ou CASHIER com waiterId?}
    R -->|Não| S[AuthFailure.NotWaiter]
    R -->|Sim| T[storeId vem do User — sem tela de escolha]
    T --> U[Home: Balcão / Mesas / Comandas]
```

---

## 3. Atendimento — mesa, comanda e balcão

```mermaid
flowchart TD
    U[Home Android] --> V{Tipo de atendimento}

    V -->|Mesa| M1[GET /tables/all]
    M1 --> M2[Escolhe mesa]
    M2 --> M3[Catálogo e carrinho]
    M3 --> M4["POST /tables/{tableId}/orders"]
    M4 --> M5[Cria ou reusa GroupOrder ACTIVE]
    M5 --> M6[Order ACTIVE + kitchenStatus NEW]
    M6 --> M7[tb_table.isAvailable = false]

    V -->|Comanda| C1[GET /comandas/all]
    C1 --> C2["setComandaInfo — tableId forçado 999"]
    C2 --> C3[Catálogo e carrinho]
    C3 --> C4["POST /tables/999/orders com comandaId"]
    C4 --> C5[Order com comanda_id — sem GroupOrder]
    C5 --> C6[tb_comanda.isAvailable = false]

    V -->|Balcão| B1[startCounterSale tableId=999 waiterId=999]
    B1 --> B2[Catálogo e carrinho — exige paymentMethod]
    B2 --> B3["POST /tables/999/orders"]
    B3 --> B4[Order standalone ACTIVE já com pagamento]
```

---

## 4. Pedido no backend

```mermaid
flowchart LR
    subgraph android [Android]
        Cart[CartViewModel.processOrder]
        UC[CreateOrderInGroupUseCase]
        API[GroupOrderAPI]
    end

    subgraph spring [Backend]
        GOC[GroupOrderController]
        GOS[GroupOrderService.createOrder]
        OS[OrderService.addNewOrder]
    end

    subgraph db [PostgreSQL]
        GO[tb_group_order]
        O[tb_order]
        I[tb_order_item]
        T[tb_table / tb_comanda]
    end

    Cart --> UC --> API
    API -->|"POST /tables/{id}/orders"| GOC --> GOS
    GOS -->|mesa real| GO
    GOS --> OS
    OS --> O
    OS --> I
    GOS --> T
```

---

## 5. Cozinha / KDS

```mermaid
flowchart TD
    P[Pedido criado kitchenStatus = NEW] --> Q[Web Kitchen.js]
    Q --> R["GET /kitchen/orders a cada 12s"]
    R --> S[Colunas do KDS]
    S --> T[Novo]
    T --> U[Em produção]
    U --> V[Feito / READY]
    V --> W[Entregue / DELIVERED]
    W --> X[Finalizado / FINALIZED]
    T -.-> Y["PATCH /kitchen/orders/{id}/status"]
    U -.-> Y
    V -.-> Y
    W -.-> Y
    Y --> Z{Balcão standalone e DELIVERED?}
    Z -->|Sim| AA[Order.status = CLOSED]
    Z -->|Não| AB[Só altera kitchenStatus]
```

---

## 6. Caixa e pagamento

```mermaid
flowchart TD
    A[CASHIER em /app/atendimento] --> B{Recurso}
    B -->|Mesa| C["GET /tables/{id}/orders"]
    B -->|Comanda| D["GET /comandas/{id}/orders"]
    C --> E[CheckoutDialog]
    D --> E
    E --> F[paymentMethod + taxa 10% + desconto]
    F --> G{Tipo}
    G -->|Mesa| H["POST /tables/{id}/group-orders/close"]
    G -->|Comanda| I["POST /comandas/{id}/orders/close"]
    H --> J[GroupOrder e Orders CLOSED]
    I --> K[Orders CLOSED]
    J --> L[tb_table.isAvailable = true]
    K --> M[tb_comanda.isAvailable = true]
    J --> N[PaymentMethodEnum gravado no pedido]
    K --> N
    N --> O[Dashboard GET /dashboard/overview]
    O --> P[Estoque NÃO é baixado]
```

---

## 7. Autenticação

```mermaid
flowchart TD
    U[Usuário] --> C{Cliente}
    C -->|Web| W[LoginForm]
    C -->|Android| A[LoginActivity]
    W --> P["POST /api/auth/login"]
    A --> P
    P --> AS[AuthService]
    AS --> V1{User ativo?}
    V1 -->|Não| E[Credenciais inválidas]
    V1 -->|Sim| V2{Senha BCrypt ok?}
    V2 -->|Não| E
    V2 -->|Sim| V3{Loja ativa se não for MASTER?}
    V3 -->|Não| E2[STORE_INACTIVE]
    V3 -->|Sim| JWT[Gera JWT — sub, role, storeId]
    JWT --> WEB[localStorage weper.token]
    JWT --> AND[DataStore Proto]
    WEB --> R1[Redirect por role]
    AND --> R2{WAITER ou CASHIER com waiterId?}
    R2 -->|Não| E3[NotWaiter]
    R2 -->|Sim| MAIN[MainActivity]
```

---

## 8. Multi-tenant

```mermaid
flowchart LR
    JWT[Authorization Bearer] --> F[JwtAuthenticationFilter]
    F --> U[Recarrega User no banco]
    U --> TC[TenantContext.storeId]
    TC --> H[StoreHibernateFilterAspect]
    H --> SQL["WHERE store_id = :storeId"]
    SQL --> A[Loja A]
    SQL -.->|não retorna| B[Loja B]
```

---

## 9. Quem fala com quem

```mermaid
flowchart TB
    subgraph web [Web]
        Master[Master /admin]
        Gestao[Gestão /app]
        Caixa[Caixa]
        KDS[KDS]
    end

    subgraph android [Android]
        Pedido[Criar pedido]
        Close[Fechar conta]
        Shift[GET /home/shift]
    end

    API[Backend Spring]

    Master -->|CRUD /api/stores| API
    Gestao -->|employees, category, product, tables, comandas, dashboard| API
    Caixa -->|GET conta + POST close mesa/comanda| API
    KDS -->|GET /kitchen/orders + PATCH status| API
    Pedido -->|POST /tables/id/orders| API
    Close -->|POST close mesa/comanda/balcão| API
    Shift --> API
```
