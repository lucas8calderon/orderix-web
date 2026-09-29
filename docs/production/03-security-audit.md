# 03 — Auditoria de segurança

Somente leitura. Nenhum segredo completo é reproduzido. Valores de exemplo aparecem mascarados.

## Busca no código versionado

Procura por chaves de API, tokens de gateway, chaves privadas, `google-services.json`, `.env` com segredo e keystores.

| Onde | Achado | Classe |
|------|--------|--------|
| `application.properties` | JWT default `change-me-…` e senha bootstrap default | ATENÇÃO |
| `DataInitializer` / catálogo demo | senha demo `123456` e usuário de plataforma, só com `DEMO_SEED=true` | ATENÇÃO |
| `.env.example` (backend) | nomes de variáveis, valores vazios | OK |
| `.env.development` (web) | só `http://localhost:8080` | OK |
| `.gitignore` | `.env`, `local.properties`, `google-services.json` | OK |
| Árvore atual dos três repos | sem `APP_USR-…`, sem `AIza…`, sem PEM, sem keystore | OK |
| README do backend | não guarda e-mail/senha da conta Render | OK |
| Android `local.properties` | keystore Getnet e URLs ficam fora do Git | OK |

Não foi encontrado segredo vivo de Mercado Pago, Google ou Firebase commitado na árvore atual. Uma varredura do histórico Git fica como demanda: esta auditoria não reescreveu histórico e não rotacionou credencial.

## O que o boot já recusa em produção

`ProductionSafetyChecks` considera produção o profile `prod`/`production` ou a variável `RENDER=true` (a plataforma Render injeta essa variável).

Nesse modo o processo recusa:

- `JWT_SECRET` vazio, curto (< 32) ou igual ao default;
- `CORS_ALLOWED_ORIGINS` vazio ou com `*`;
- `DDL_OPTION` diferente de `validate` ou `none`;
- Swagger (`/swagger-ui`, `/v3/api-docs`);
- criação do SUPER_ADMIN quando a senha ainda é a default;
- cópia automática das credenciais de teste do Mercado Pago para as lojas.

`JwtTokenProvider` também recusa segredo com menos de 32 bytes em qualquer ambiente.

## Lacunas que o boot ainda aceita

| Lacuna | Classe | Por que importa |
|--------|--------|-----------------|
| `PAYMENT_SECRETS_KEY` vazio deriva a chave AES do JWT | CRÍTICO | O comentário diz "somente não-prod", mas `PaymentSecretEncryptor` não consulta o ambiente. Rodar JWT quebra a leitura dos tokens cifrados da loja. Quem tem o JWT lê o access token do Mercado Pago. |
| `DEMO_SEED=true` não derruba o boot de produção | ALTO | Cria lojas demo e um MASTER com senha conhecida no código. |
| WebSocket `/ws/sync` com `setAllowedOriginPatterns("*")` | ALTO | O filtro HTTP exige autenticação, mas a origem não acompanha o CORS da API. |
| `HttpLoggingInterceptor.Level.BODY` em todos os builds | ALTO | `Authorization` e `Idempotency-Key` são redatados. Corpo de login, pedido, cliente e pagamento ainda pode ir para o logcat no release. |
| CORS default `*` quando o processo não é produção | ALTO | Um deploy sem profile e sem `RENDER=true` abre origem. |
| Rate limit de login só em memória (8 / 15 min por IP) | MÉDIO | Reinício zera o contador. Mais de uma instância não compartilha o limite. |
| JWT de 12 h (`43200000` ms), sem refresh e sem revogação | MÉDIO | Logout apaga o token no cliente. O JWT segue válido até expirar. |
| Token do painel em `localStorage` | MÉDIO | XSS lê a sessão. Não há cookie `HttpOnly`. |
| Broker STOMP em memória | ALTO | Segunda instância não recebe o mesmo `/topic`. Autoscaling quebra o sync do salão. |

## Autenticação

```text
POST /api/auth/login
        ↓
JWT (sub = userId, role, username, storeId informativo)
        ↓
Cliente guarda o token
        ↓
Authorization: Bearer
        ↓
Filtro recarrega User + Store no banco
        ↓
TenantContext
```

Delivery do cliente final:

```text
POST /api/public/delivery/auth/register|login
        ↓
JWT com typ=DELIVERY_CUSTOMER
        ↓
rotas /api/public/delivery/account/** e pagamentos do próprio pedido
```

Não há endpoint de refresh. 401 no web limpa a sessão e manda para o login, exceto em landing, cardápio e delivery. No Android, o interceptor de 401 encerra a sessão cifrada.

Senhas de usuário usam BCrypt.

## Autorização e lojas

`StoreHibernateFilterAspect` liga o filtro da loja nos services e chama `requireStoreId()`. Conta de plataforma sem loja recebe 403 nos services cobertos, em vez de ver todas as lojas.

Fora do aspecto, de propósito: `auth`, `StoreService`, CRM, assinatura, cardápio público, pacote `delivery` e `payment.online` / `payment.provider`. Esses fluxos resolvem a loja pelo slug público ou precisam checar o tenant na mão. Isso entra no teste de isolamento antes da produção.

`StoreAccess` compara `entity.store.id` com o tenant e responde 404 quando a loja não bate, para não confirmar que o id existe.

Papéis de gestão da loja incluem `MASTER` e `SUPER_ADMIN`. Fechar conta e criar pagamento também incluem `WAITER`. Estorno não inclui `WAITER`.

Assinatura inativa bloqueia o usuário da loja (403 com mensagem de assinatura). Cardápio e delivery públicos não herdam esse bloqueio. A assinatura da plataforma é manual no painel MASTER; não há gateway de mensalidade.

## Webhook Mercado Pago

```text
POST /api/webhooks/mercadopago
POST /api/webhooks/mercado-pago/orders
```

Sem JWT. Exige header `x-signature` válido contra o segredo da loja (ou o de teste, se o ambiente da conta for teste). Evento repetido é ignorado por `provider + eventId`. Pedido desconhecido responde 200 sem efeito. Log registra ids e status, não o segredo.

Não há URL de notificação montada no código: ela é configurada no painel do Mercado Pago e precisa ser a URL pública da API daquele ambiente.

## Arquivos

Logo e capa da loja, imagem de categoria e de produto ficam no PostgreSQL (`TEXT` / data URL). O caminho `/images/**` serve arquivo estático do classpath (`sem-imagem`). Não há upload para disco local do processo. No Render o disco é efêmero, mas essas mídias sobrevivem ao restart porque estão no banco. O custo é payload e backup grande. Object storage fica depois da fundação, não como pré-requisito do primeiro staging.

## Logs

O código de pagamento declara que não loga PAN, JWT nem e-mail. O webhook loga `storeId`, `paymentId` e status. O Android ainda loga corpo HTTP. Não foi visto registro de senha no backend. QR Code Pix pode permanecer na coluna `qr_code` / `qr_code_base64` do pagamento.

## LGPD (visão técnica, sem parecer jurídico)

Dados presentes: nome, e-mail, telefone, endereço da loja, endereço do cliente de delivery, telefone do pedido, leads de CRM (telefone, Instagram, endereço), identificadores de pagamento (NSU, status, QR). Não há coluna de CPF/CNPJ de cliente no modelo lido. Documento da InfinitePay é identificador público da conta da loja.

Não há política técnica de retenção, exclusão de conta de cliente, anonimização de backup nem registro de acesso a dados pessoais. Backup de produção carrega esses dados e precisa de acesso restrito.
