# 09 — Go-live

Usar só depois que o staging correspondente passou. Itens marcados até 14 out 2026 continuam como estavam. Os marcados em 15 out 2026 estão indicados na linha. O corte do card 027 foi conferido por Lucas Calderon em 15 out 2026. Android, InfinitePay e Getnet seguem nos cards 028 e 029. A seção "Fora deste corte" continua aberta.

Se um smoke de produção falhar, Lucas Calderon suspende o static site e o web service de produção. O Postgres não é destruído.

```text
WEPER — GO LIVE CHECKLIST
```

## Infraestrutura

- [x] Web Service de produção no ar, 1 instância
- [x] Static Site de produção com build de produção
- [x] PostgreSQL de produção, instância diferente da de staging e da de lab
- [x] `www.weper.com.br` e apex
- [x] `api.weper.com.br` (15 out 2026)
- [x] DNS publicado (15 out 2026)
- [x] HTTPS válido nos quatro nomes públicos (www, apex, api, e os de staging continuam de pé) (15 out 2026)
- [x] `GET /health` 200 sem corpo sensível
- [x] Autoscaling desligado
- [x] Auto-deploy de produção desligado ou com aprovação explícita

## Segurança

- [x] `JWT_SECRET` exclusivo, longo, diferente de staging (15 out 2026, produção com 64 caracteres e valor diferente do staging)
- [x] `PAYMENT_SECRETS_KEY` exclusiva e obrigatória (15 out 2026, produção com 64 caracteres e valor diferente do staging)
- [x] `DEMO_SEED=false` e boot recusa `true`
- [x] Senha bootstrap não é a default
- [x] CORS só `https://www.weper.com.br` e `https://weper.com.br`
- [x] WebSocket sem origem `*`
- [x] Swagger inacessível
- [x] Login exige usuário real; conta demo não existe
- [x] Loja A não lê dados da loja B (15 out 2026, conferido por Lucas Calderon)
- [x] Log sem senha, JWT, access token, PAN ou data URL (15 out 2026, amostra 12:50–13:50 UTC sem ocorrências)

## Banco

- [x] Flyway aplica a baseline num banco vazio
- [x] `DDL_OPTION=validate`
- [x] Backup automático do plano (15 out 2026, PITR de 7 dias no card 021)
- [x] Restore ensaiado em instância descartável (15 out 2026, export lógico no card 021, instância local apagada em seguida)
- [x] Staging não aponta para essa URL

## Integrações

- [x] Mercado Pago de produção por loja, ambiente `prod` (15 out 2026, loja Ensaio)
- [x] Webhook `https://api.weper.com.br/api/webhooks/mercadopago` com assinatura aceita (15 out 2026, pedido 15)
- [x] Evento duplicado não cobra de novo (15 out 2026, conferido por Lucas Calderon)
- [x] Google Places com chave restrita, ou prospecção desligada de propósito (15 out 2026, conferido por Lucas Calderon)
- [ ] InfinitePay com handle da loja no flavor `play` (card 028)
- [ ] Getnet no flavor `getnet`, keystore próprio (card 029)
- [x] ViaCEP no endereço (15 out 2026, conferido por Lucas Calderon)
- [x] Link de WhatsApp da landing confere com o número comercial (15 out 2026, o site publicado leva ao wa.me do número da landing)

## Web

- [x] `REACT_APP_API_BASE_URL=https://api.weper.com.br` no build (15 out 2026, `main.51f9028c.js`)
- [x] Refresh em `/cardapio/{slug}` e `/delivery/{slug}` não cai em 404 (15 out 2026)
- [x] Login, painel, cozinha, estoque, configurações (15 out 2026)
- [x] Landing em `www`

## Android

- [ ] `playRelease` com `https://api.weper.com.br/`
- [ ] Assinatura Play fora do Git
- [ ] `versionCode` maior que qualquer build já enviado
- [ ] `versionName` definido
- [ ] R8 ligado
- [ ] Cleartext desligado
- [ ] Log de corpo desligado
- [ ] Crashlytics no projeto Firebase de produção
- [ ] `getnetRelease` assinado com o keystore Getnet, sem Firebase obrigatório
- [ ] Flavors `play` e `getnet` inalterados como dimensão de adquirente

## QA no domínio oficial

- [x] Login (15 out 2026)
- [x] Criação de loja pelo MASTER (15 out 2026, conferido por Lucas Calderon)
- [x] Produtos e categorias (15 out 2026, categoria e produto criados e removidos em seguida)
- [x] Mesas (15 out 2026, mesa 27)
- [x] Comandas (15 out 2026, comanda 27)
- [x] Balcão (15 out 2026, a aba lista os pedidos já existentes)
- [x] Cozinha (15 out 2026, a tela abre com os filtros)
- [x] Estoque (15 out 2026, a tela abre com os saldos da loja)
- [x] Delivery público e conta do cliente (15 out 2026, pedido 15)
- [x] Cardápio digital (15 out 2026, `/cardapio/ensaio`)
- [x] Pix sandbox não entra aqui; Pix de produção de uma loja piloto (15 out 2026, pedido 15)
- [x] Webhook de produção (15 out 2026, pedido 15)
- [x] Permissões (garçom, caixa, cozinha, admin) (15 out 2026, conferido por Lucas Calderon)
- [x] Isolamento entre duas lojas (15 out 2026, conferido por Lucas Calderon)
- [x] Self-service por QR, se a loja piloto usar (15 out 2026, conferido por Lucas Calderon)
- [x] Assinatura inativa bloqueia o painel e não bloqueia o cardápio público (15 out 2026, conferido por Lucas Calderon)

## Fora deste corte

- [ ] Object storage de imagens (card 031 em stand by em 15 out 2026, sem custo extra)
- [ ] Refresh token
- [ ] E-mail de esqueci senha
- [ ] Segunda instância / broker compartilhado
- [ ] App Links
