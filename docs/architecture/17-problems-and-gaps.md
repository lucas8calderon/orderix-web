# 17 — Problemas, gaps e inconsistências

Somente itens com correspondência no código. Classificação: **CRÍTICO** / **ALTO** / **MÉDIO** / **BAIXO**.

Critério de “implementado”: UI → ação → client → endpoint → controller → service → repository → banco → response → UI. Elo ausente = parcial.

---

## CRÍTICO

### C1. Sem baixa de estoque na venda

`Product.quantity` não é decrementado em nenhum service de pedido. Dashboard alerta 1–8 unidades como se fosse estoque real. Risco operacional: números de estoque mentem após a primeira venda.

### C2. Platform admin sem `storeId` desliga o filtro Hibernate

`StoreHibernateFilterAspect` + `StoreAccess` com `storeId == null` não isolam dados de loja. `GET /product/all`, `/order/all`, `/kitchen/orders` etc. ficam acessíveis a MASTER autenticado. A UI master não expõe essas telas, mas a API sim.

### C3. Pedidos só nascem no Android

Nenhum fluxo web chama `POST /tables/{tableId}/orders`. Loja só com web **não consegue lançar pedido de atendimento**.

---

## ALTO

### A1. Sem realtime no KDS

Polling 12s. Cozinha e salão podem divergir por até esse intervalo. Sem lock otimista: dois clientes PATCH o mesmo pedido por último ganha.

### A2. Fechar mesa não sincroniza cozinha (e vice-versa)

`Order.status` CLOSED e `kitchenStatus` são independentes, exceto balcão `DELIVERED`. Caixa pode cobrar pedido ainda NEW; cozinha não altera pedido já CLOSED.

### A3. Endpoints `/order/new|edit|getByTable` deprecated mas Android ainda declara `POST order/new`

O carrinho usa `GroupOrderAPI` (ok). Se algum caminho residual chamar `OrderAPI.createOrderWithProducts`, o backend lança erro.

### A4. Matching de comanda por `customerName`

`ComandaAccountService.matchesComanda` associa pedidos cujo nome contém `"comanda"` + número. Colisão possível na mesma loja.

### A5. Sem refresh token

401 derruba sessão. JWT 12h. `RefreshTokenInterceptor` no Android não refresha.

### A6. Entidades filhas sem `store_id`

`OrderItem`, `OrderProductExtra`, `OrderMandatorySelection`, `MandatoryItem`. Isolamento só via pai.

### A7. Tela de estoque e configurações na web são mock e não montadas

Paths liberados no `accessControl`; `screenBySlug` não inclui. Usuário STORE_ADMIN pode ter rota permitida sem UI.

---

## MÉDIO

### M1. `WaiterController` sem cliente

Web usa `EmployeeController` (que chama `ensureForUser`). Android não chama `/api/waiters`. API de waiters parece órfã.

### M2. `GET /api/auth/me` sem cliente

### M3. Prefixos de API inconsistentes (`/api/*` vs legado)

Funciona, mas complica gateway/CORS/docs.

### M4. Taxa de serviço 10% duplicada (web UI e backend)

Se um lado mudar, a prévia do caixa mente até o POST.

### M5. `OrdersViewModel` Android força display (`isPaid=true`, `saleType="balcao"`, `orderStatus="fazendo"`)

Lista de pedidos pode mentir na UI.

### M6. `CounterOrderFragment` sem navegação a partir do Home

Balcão vai a categorias; fragmento no graph parece legado.

### M7. Forgot password e registro: stubs

Web e Android sem backend.

### M8. Firebase Auth morto no web; Google login desabilitado

### M9. Master: gráfico de receita parcialmente mock (`mockRevenueHistory.js`); `getStoreById` nunca chamado

### M10. Queries nativas em `ProductRepository` ignoram filtro Hibernate

### M11. `CategoryRepository.existsByName(String)` sem store — método latente

### M12. Kitchen status sem máquina de estados

Qualquer enum é aceito; dá para pular ou voltar.

### M13. Badge de notificações hardcoded `"4"` em `Dashboard.js`

### M14. Imagens de cardápio em data URL/base64 no JSON

Payload grande; filesystem efêmero no Render de qualquer forma.

### M15. Release Android `BASE_URL` placeholder Render

App de produção não aponta para host real sem build extra.

### M16. Sem cancelamento / estorno / devolução de pedido

### M17. Concorrência ao fechar mesa

Dois caixas no mesmo `GroupOrder` ACTIVE: o segundo toma `GROUP_ORDER_ALREADY_CLOSED` ou condição de corrida conforme timing. Sem versão/lock explícito além do status.

### M18. `GET /kitchen/**` bloqueia WAITER; PATCH permite

Garçom atualiza status sem ver o board KDS (intencional ou não, assim está).

---

## BAIXO

### B1. `OrderConfirmationViewModel` vazio

### B2. Pastas Android vazias (`checkout`, `tableSales`, `contact`)

### B3. README Android desatualizado (Room, Picasso, Firestore)

### B4. Plugin Compose no Gradle root sem UI Compose

### B5. `ROLE_PERMISSIONS` stub na web

### B6. `CreateProductUseCase` no Android — catálogo é responsabilidade da web

### B7. Dual modelo de produtos no pedido: ManyToMany `order_product` **e** `tb_order_item`

Redundância; risco de divergência se um lado for atualizado e o outro não (`OrderService` grava os dois na criação).

### B8. `WaiterHome` web placeholder

### B9. Assinatura: planos na web (`PLANS`) espelham backend; telas MasterPlans/MasterSubscriptions não têm API própria de “planos” — o plano vai no `CreateStoreRequest`

---

## Matriz rápida de elos quebrados

| Sintoma | Elo ausente |
|---------|-------------|
| Inventário | UI mock + sem service de movimento + sem baixa no OrderService |
| Esqueci senha | UI sem endpoint |
| Seleção de estabelecimento no Android | Não há tela; User já tem Store |
| Pedido na web | Sem chamada POST create |
| Pagamento PSP | Sem integração |
| Sync offline Android | Sem Room |
| KDS push | Sem WebSocket |
| `/api/waiters` | Sem tela |
| `POST /order/new` | Controller lança deprecated |
