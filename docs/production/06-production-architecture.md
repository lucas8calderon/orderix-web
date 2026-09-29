# 06 — Arquitetura de produção

Recomendação. Nenhum recurso foi criado.

## Topologia

```text
www.weper.com.br
weper.com.br          → mesmo site, apex canônico ou redirect para www
        │
        ▼
Static Site (bundle de produção)
        │
        ▼
api.weper.com.br
        │
        ▼
Web Service Docker, 1 instância, profile prod
        │
        ▼
PostgreSQL produção (terceira instância, só deste ambiente)

ANDROID release
playRelease  → Play Store, BASE_URL https://api.weper.com.br/
getnetRelease → terminal, mesmo host, keystore Getnet
```

```text
                         ┌─ Mercado Pago (credencial prod por loja)
                         ├─ Google Places (chave restrita por IP)
FRONTEND → BACKEND ──────┼─ ViaCEP
ANDROID  → BACKEND ──────┼─ InfinitePay (no aparelho play)
                         └─ Getnet (no terminal)
                                │
                                ▼
                         PostgreSQL produção
```

Firebase Crashlytics só no app Play de produção, projeto separado do de staging.

## Hosts

| Host | Função |
|------|--------|
| `weper.com.br` | Apex. Servir o site ou redirecionar para `www` |
| `www.weper.com.br` | Site, painel, `/cardapio/{slug}`, `/delivery/{slug}` |
| `api.weper.com.br` | API e webhook |
| `staging.weper.com.br` | Homologação web |
| `api-staging.weper.com.br` | Homologação API |

HTTPS em todos, certificado gerido pelo Render ao vincular o domínio. Não há deep link Android hoje; se for necessário depois, o host do site entra no assetlinks.

## Serviços Render

| Recurso | Notas |
|---------|--------|
| Web Service backend | Docker, health `/health`, região igual à do banco, auto-deploy desligado ou restrito a uma branch protegida com aprovação |
| Static Site | `npm ci && npm run build`, publish `build`, rewrite SPA, `REACT_APP_API_BASE_URL=https://api.weper.com.br` no build |
| PostgreSQL | Plano com backup. Não o free que expira em 30 dias se a base for de cliente |
| Disco persistente | Não. Mídia está no banco. Object storage é evolução, não disco do Render (disco prende o serviço em uma instância e não substitui backup) |
| Autoscaling | Desligado enquanto o STOMP for em memória |
| Key Value | Não é necessário para o primeiro go-live |

Logs: stdout do Render. Sem segredo, PAN, JWT ou data URL de imagem.

## Variáveis exclusivas de produção

```text
SPRING_PROFILES_ACTIVE=prod
DB_URL DB_USER DB_PASS
DDL_OPTION=validate
JWT_SECRET
JWT_EXPIRATION_MS          (manter 12 h até existir refresh)
CORS_ALLOWED_ORIGINS=https://www.weper.com.br,https://weper.com.br
CORS_ALLOW_CREDENTIALS=false
DEMO_SEED=false
BOOTSTRAP_SUPER_USER
BOOTSTRAP_SUPER_PASSWORD
PAYMENT_SECRETS_KEY
GOOGLE_PLACES_API_KEY
MERCADO_PAGO_ENVIRONMENT=prod
```

Tokens de Mercado Pago de produção ficam cifrados por loja, não como fallback global. O fallback de env só existe para ambiente `test`.

`BOOTSTRAP_*` cria o SUPER_ADMIN uma vez. Não redefine senha em boot seguinte.

## Android release

```text
release.api.url=https://api.weper.com.br/
minify/R8 ligado (já está)
cleartext desligado (já está no config de release)
versionCode incrementado a cada envio
versionName semântico
assinatura Play fora do Git
assinatura Getnet fora do Git e diferente da Play
```

## Ordem de corte

Staging aprovado no checklist de smoke → banco de produção vazio com a mesma baseline → API de produção → site no domínio → webhook de produção no Mercado Pago das lojas reais → faixa interna da Play, depois produção.

O laboratório Render atual, se ainda existir, permanece isolado e não recebe o domínio oficial.
