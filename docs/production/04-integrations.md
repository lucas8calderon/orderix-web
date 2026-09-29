# 04 — Integrações

Inventário pelo código em 28/09/2026. Asaas, Stone e PagSeguro não aparecem.

## Mercado Pago

| Campo | Valor |
|-------|--------|
| Projetos | Backend (Orders API), Web (checkout Pix/cartão e configurações), Android não chama o Mercado Pago direto |
| Finalidade | Pix e cartão online no delivery |
| Credenciais | Access token, public key, webhook secret, ambiente `test` ou `prod` |
| Onde ficam | Env `MERCADO_PAGO_*` como fallback de teste; por loja, cifradas em `tb_payment_provider_account` |
| Sandbox | Sim. Default `MERCADO_PAGO_ENVIRONMENT=test`. Fallback de env só em ambiente de teste |
| Produção | A conta da loja precisa de credenciais reais e `environment=prod`. Aí o fallback de env não entra |
| Webhook | `POST /api/webhooks/mercadopago` e alias `/api/webhooks/mercado-pago/orders` |
| Callback / redirect | Checkout é da própria web; não há return URL fixa no backend |
| Domínio | A URL de notificação precisa ser HTTPS público da API daquele ambiente |
| Risco | Chave de cifra vazia deriva do JWT. Sem URL pública, o Pix não confirma sozinho |
| Antes da produção | `PAYMENT_SECRETS_KEY` exclusiva, credencial de produção por loja, webhook da API de produção, teste de assinatura e de evento duplicado |

## InfinitePay

| Campo | Valor |
|-------|--------|
| Projetos | Android flavor `play` (`payments-infinitepay`), backend guarda handle e documento públicos |
| Finalidade | Pagamento no aparelho (InfiniteTap) no salão / balcão |
| Credenciais | Handle e documento públicos. Comentário do backend: InfiniteTap não usa API key nem webhook nesta fase |
| Onde ficam | `tb_payment_provider_account` (campos públicos). `INFINITEPAY_SECRET` citado como vazio |
| Sandbox | Depende do app/conta InfinitePay no aparelho, não de um ambiente no backend |
| Produção | Handle real da loja |
| Webhook | Não |
| Callback | Activity de retorno no flavor `play` |
| Domínio | Não |
| Risco | Baixo no servidor. O fluxo é local ao POS/celular |
| Antes da produção | Validar handle de uma loja real no APK de release, sem misturar com o flavor Getnet |

## Getnet

| Campo | Valor |
|-------|--------|
| Projetos | Android flavor `getnet` (`payments-getnet` + SDK POS) |
| Finalidade | Pagamento e impressão no terminal Getnet |
| Credenciais | Keystore de assinatura v1+v2 via `local.properties` (`getnet.store.file` e senhas). Fora do Git |
| Onde ficam | Máquina de build / CI, nunca o repositório |
| Sandbox | Certificação no terminal, não há URL de API Weper específica |
| Produção | APK assinado com o keystore exigido pela Getnet |
| Webhook | Não no backend |
| Callback | `GetnetBridgeActivity` / URI `getnet:` |
| Domínio | A API Weper do release precisa ser HTTPS alcançável pelo terminal |
| Risco | Sem keystore não há APK de certificação. Firebase é desligado neste flavor |
| Antes da produção | Keystore separado do da Play Store. Não criar flavor novo de ambiente em cima de `getnet` |

## Google Places

| Campo | Valor |
|-------|--------|
| Projetos | Backend CRM (`/api/crm/prospecting`), painel master no web só chama a API Weper |
| Finalidade | Prospecção de leads. A chave não vai ao browser |
| Credenciais | `GOOGLE_PLACES_API_KEY` |
| Onde ficam | Env / `.env` local. Vazio = a prospecção informa que não está configurada |
| Sandbox | A API do Google não tem sandbox equivalente; há teto interno (500 buscas e 500 detalhes / mês, 20 resultados) |
| Produção | Chave restrita por IP do serviço |
| Webhook | Não |
| Domínio | Não |
| Risco | Chave sem restrição de IP, se for colada num lugar amplo |
| Antes da produção | Chave distinta de staging, restrição de IP, teto mantido |

## ViaCEP

| Campo | Valor |
|-------|--------|
| Projetos | Web (`src/services/viaCepService.js`) |
| Finalidade | Completar endereço a partir do CEP |
| Credenciais | Nenhuma |
| Sandbox / produção | API pública `https://viacep.com.br/ws` |
| Webhook | Não |
| Risco | Indisponibilidade externa. Sem dado secreto |
| Antes da produção | Smoke de um CEP válido em staging |

## WhatsApp

| Campo | Valor |
|-------|--------|
| Projetos | Web (landing, CRM, delivery) |
| Finalidade | Link `https://wa.me/` . Não há API oficial da Meta |
| Credenciais | Nenhuma. Número comercial da landing está no código (`5511…`) |
| Webhook | Não |
| Risco | Baixo. É deep link do cliente |
| Antes da produção | Confirmar o número exibido na landing |

## Instagram

Link público `https://www.instagram.com/weper.com.br/` no rodapé. Sem token da Meta.

## Firebase

| Campo | Valor |
|-------|--------|
| Projetos | Android flavor `play`: Crashlytics (BOM 33.2.0). Flavor `getnet` não inicializa Firebase |
| Web | Sem `firebase` no `src` atual. README antigo cita `REACT_APP_FIREBASE_*`; o arquivo de exemplo não está no repo |
| Credenciais | `google-services.json` gitignored |
| FCM / AdMob / Analytics explícito | Não encontrados |
| Risco | Um único projeto Firebase mistura crash de lab e de cliente |
| Antes da produção | App Android de staging e de produção separados, arquivo injetado no build, nunca commitado |

## E-mail, SMS, mapas pagos, ngrok

Não há SMTP, provedor de e-mail, SMS nem ngrok no código. Esqueci senha não tem API. Geolocalização de prospecção é Places; endereço de delivery é ViaCEP + bairros da loja.

## Webhooks

| Provedor | Evento | Endpoint | Ambiente hoje | Auth | Idempotência | Status |
|----------|--------|----------|---------------|------|--------------|--------|
| Mercado Pago | notificação de order | `/api/webhooks/mercadopago` | local, sem URL pública | `x-signature` HMAC | `provider + eventId` | Implementado. Depende de túnel ou URL real para o provedor alcançar o processo |

Não usar ngrok em staging nem em produção. Cada ambiente ganha a própria URL:

```text
staging:    https://api-staging.weper.com.br/api/webhooks/mercadopago
produção:   https://api.weper.com.br/api/webhooks/mercadopago
```

Os nomes de host são recomendação, não estão criados.
