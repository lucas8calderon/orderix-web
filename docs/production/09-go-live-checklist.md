# 09 — Go-live

Usar só depois que o staging correspondente passou. Itens marcados foram conferidos em 14 out 2026. O restante continua aberto.

```text
WEPER — GO LIVE CHECKLIST
```

## Infraestrutura

- [x] Web Service de produção no ar, 1 instância
- [x] Static Site de produção com build de produção
- [x] PostgreSQL de produção, instância diferente da de staging e da de lab
- [x] `www.weper.com.br` e apex
- [ ] `api.weper.com.br`
- [ ] DNS publicado
- [ ] HTTPS válido nos quatro nomes públicos (www, apex, api, e os de staging continuam de pé)
- [x] `GET /health` 200 sem corpo sensível
- [x] Autoscaling desligado
- [x] Auto-deploy de produção desligado ou com aprovação explícita

## Segurança

- [ ] `JWT_SECRET` exclusivo, longo, diferente de staging
- [ ] `PAYMENT_SECRETS_KEY` exclusiva e obrigatória
- [x] `DEMO_SEED=false` e boot recusa `true`
- [x] Senha bootstrap não é a default
- [x] CORS só `https://www.weper.com.br` e `https://weper.com.br`
- [x] WebSocket sem origem `*`
- [x] Swagger inacessível
- [x] Login exige usuário real; conta demo não existe
- [ ] Loja A não lê dados da loja B
- [ ] Log sem senha, JWT, access token, PAN ou data URL

## Banco

- [x] Flyway aplica a baseline num banco vazio
- [x] `DDL_OPTION=validate`
- [ ] Backup automático do plano
- [ ] Restore ensaiado em instância descartável
- [x] Staging não aponta para essa URL

## Integrações

- [ ] Mercado Pago de produção por loja, ambiente `prod`
- [ ] Webhook `https://api.weper.com.br/api/webhooks/mercadopago` com assinatura aceita
- [ ] Evento duplicado não cobra de novo
- [ ] Google Places com chave restrita, ou prospecção desligada de propósito
- [ ] InfinitePay com handle da loja no flavor `play`
- [ ] Getnet no flavor `getnet`, keystore próprio
- [ ] ViaCEP no endereço
- [ ] Link de WhatsApp da landing confere com o número comercial

## Web

- [ ] `REACT_APP_API_BASE_URL=https://api.weper.com.br` no build
- [ ] Refresh em `/cardapio/{slug}` e `/delivery/{slug}` não cai em 404
- [ ] Login, painel, cozinha, estoque, configurações
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

- [ ] Login
- [ ] Criação de loja pelo MASTER
- [ ] Produtos e categorias
- [ ] Mesas
- [ ] Comandas
- [ ] Balcão
- [ ] Cozinha
- [ ] Estoque
- [ ] Delivery público e conta do cliente
- [ ] Cardápio digital
- [ ] Pix sandbox não entra aqui; Pix de produção de uma loja piloto
- [ ] Webhook de produção
- [ ] Permissões (garçom, caixa, cozinha, admin)
- [ ] Isolamento entre duas lojas
- [ ] Self-service por QR, se a loja piloto usar
- [ ] Assinatura inativa bloqueia o painel e não bloqueia o cardápio público

## Fora deste corte

- [ ] Object storage de imagens
- [ ] Refresh token
- [ ] E-mail de esqueci senha
- [ ] Segunda instância / broker compartilhado
- [ ] App Links
