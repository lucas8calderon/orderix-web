# 02 — Auditoria de prontidão

Classificação usada em todo o pacote.

Severidade: CRÍTICO, ALTO, MÉDIO, BAIXO.  
Tipo: BLOCKER PRODUÇÃO, SEGURANÇA, INFRA, BACKEND, FRONTEND, ANDROID, BANCO, INTEGRAÇÃO, DEVOPS, QUALIDADE, OBSERVABILIDADE.  
Ambiente: LOCAL, STAGING, PRODUÇÃO, TODOS.

## Contagem

```text
CRÍTICO  8
ALTO    12
MÉDIO    8
BAIXO    4

BLOCKERS PARA STAGING     7
BLOCKERS PARA PRODUÇÃO   12
```

Os 12 de produção incluem os 7 de staging. Produção não começa enquanto o staging não existir.

## Críticos

| ID | Problema | Tipo | Ambiente |
|----|----------|------|----------|
| P01 | `V1` não cria o schema. Banco vazio + `ddl-auto=validate` não sobe. O schema real ainda depende de `update` | BANCO, BLOCKER PRODUÇÃO | TODOS |
| P02 | README manda `DDL_OPTION=CREATE` e depois `UPDATE`. O boot em Render (`RENDER=true`) só aceita `validate` ou `none`. Seguir o README impede a subida ou, fora desse modo, recria schema | BANCO, DEVOPS, BLOCKER PRODUÇÃO | TODOS |
| P03 | Não há profile, banco, serviço nem variáveis de homologação. O Render citado no README é laboratório que expira, não staging | INFRA, BLOCKER PRODUÇÃO | STAGING |
| P04 | Build da web sem `REACT_APP_API_BASE_URL` grava `http://localhost:8080` no bundle | FRONTEND, BLOCKER PRODUÇÃO | STAGING, PRODUÇÃO |
| P05 | Release Android aponta para `YOUR-BACKEND-HOST` e falha sem `local.properties`. Não há buildType staging. Flavors `play`/`getnet` são de adquirente | ANDROID, BLOCKER PRODUÇÃO | STAGING, PRODUÇÃO |
| P06 | Não há `GET /health` nem Actuator. O Render não tem caminho público estável para health check | INFRA, BACKEND, BLOCKER PRODUÇÃO | STAGING, PRODUÇÃO |
| P07 | `PAYMENT_SECRETS_KEY` vazio deriva a chave do JWT também em produção | SEGURANÇA, BLOCKER PRODUÇÃO | STAGING, PRODUÇÃO |
| P08 | Não há Postgres exclusivo de produção, backup automático nem restore ensaiado. O banco de lab não pode ser promovido | BANCO, BLOCKER PRODUÇÃO | PRODUÇÃO |

## Altos

| ID | Problema | Tipo | Ambiente |
|----|----------|------|----------|
| P09 | WebSocket aceita qualquer origem | SEGURANÇA | TODOS |
| P10 | `DEMO_SEED=true` não impede o boot de produção | SEGURANÇA | PRODUÇÃO |
| P11 | OkHttp loga o corpo em debug e release | SEGURANÇA, ANDROID | PRODUÇÃO |
| P12 | STOMP e rate limit vivem na memória do processo. Mais de uma instância parte o sync | BACKEND, INFRA | STAGING, PRODUÇÃO |
| P13 | Não há CI | DEVOPS, QUALIDADE | TODOS |
| P14 | Os três repositórios publicam a partir de `main`. Não há branch de homologação | DEVOPS | TODOS |
| P15 | Logo, capa e fotos em `TEXT` no Postgres | BACKEND | TODOS |
| P16 | Não há keystore da Play Store no fluxo de build | ANDROID, BLOCKER PRODUÇÃO | PRODUÇÃO |
| P17 | `google-services.json` está fora do Git (correto) e o release `play` não reproduz sem injeção | ANDROID | STAGING, PRODUÇÃO |
| P18 | CORS `*` é o default fora do modo produção | SEGURANÇA | LOCAL |
| P19 | Não há Blueprint Render. Deploy seria manual e fácil de divergir | INFRA, DEVOPS | STAGING, PRODUÇÃO |
| P20 | Filtro Hibernate não cobre `delivery`, cardápio público e pagamento online | SEGURANÇA, BACKEND | TODOS |

## Médios

| ID | Problema | Tipo | Ambiente |
|----|----------|------|----------|
| P21 | JWT de 12 h, sem refresh; painel em `localStorage` | SEGURANÇA | TODOS |
| P22 | `package-lock.json` ignorado. O build da web não é reproduzível | DEVOPS, FRONTEND | TODOS |
| P23 | Dockerfile compila pulando `WeperApplicationTests` | QUALIDADE | TODOS |
| P24 | Acompanhamento do delivery abre por `publicToken` na URL | SEGURANÇA | TODOS |
| P25 | Sem métrica, alerta ou id de correlação | OBSERVABILIDADE | STAGING, PRODUÇÃO |
| P26 | Flyway `out-of-order=true` por causa de versões que chegaram fora de ordem | BANCO | TODOS |
| P27 | URL comercial fixa em `https://weper.com.br`, sem DNS desenhado para `www` e `api` | INFRA | PRODUÇÃO |
| P28 | Android não declara App Link para cardápio ou delivery | ANDROID | PRODUÇÃO |

## Baixos

| ID | Problema | Tipo | Ambiente |
|----|----------|------|----------|
| P29 | Swagger aberto só fora de produção | SEGURANÇA | LOCAL |
| P30 | README Android ainda cita `chefia-elwd.onrender.com` | DEVOPS | LOCAL |
| P31 | Auditoria de 17/09/2026 descreve um sistema anterior (sem Flyway, sem pagamento, sem delivery) | QUALIDADE | LOCAL |
| P32 | Sem e-mail transacional. Esqueci senha não tem API | INTEGRAÇÃO | TODOS |

## Banco, em detalhe

Configuração efetiva hoje:

```text
URL        ${DB_URL:jdbc:postgresql://localhost:5432/weper}
usuário    ${DB_USER:postgres}
senha      ${DB_PASS} sem default
schema     public (não há schema nomeado)
ddl-auto   ${DDL_OPTION:update}
Flyway     on, baseline-on-migrate, baseline-version=1, out-of-order
```

Hibernate em produção, se o modo produção estiver ativo: `validate` (default do profile) ou `none`.

`V1` é `DO $$ BEGIN NULL; END $$`. `V2` cria idempotência e itens se não existirem, e só altera mesa/comanda/categoria quando a tabela já existe. `V3` em diante cria o ledger de pagamento. As tabelas centrais (`tb_store`, `tb_user`, `tb_order`, e o restante que o JPA criou no passado) não têm `CREATE TABLE` versionado.

Consequência: um Postgres novo de staging não pode usar `validate` até existir uma baseline que crie o schema inteiro. Usar `update` ou `create` nesse banco viola a regra que o próprio código passou a impor e pode destruir dados (`create` / `create-drop`).

Não há job de backup, script de restore nem teste de restauração no repositório.

Isolamento pretendido: staging e produção em instâncias Postgres diferentes. O laboratório descrito no README (`weper-db`) não entra em nenhum dos dois.

## Testes que já existem

Backend: autenticação JWT, rate limit, segurança de produção, tenant, webhook Mercado Pago, Pix/cartão, delivery, estoque, cozinha, CRM. São testes de unidade/componente, sem suíte de repositório contra Postgres.

Web: cardápio, delivery, checkout, configurações, pagamento (mapeamento), cozinha, acesso. Sem E2E de browser.

Android: pagamento, impressão, sessão, sync, URI Getnet e InfinitePay. Um instrumentado de exemplo. Sem UI de ponta a ponta.

Fluxos que precisam de prova antes da produção, sem tentar cobrir o produto inteiro com testes novos de uma vez:

```text
login
criar loja (MASTER)
produto e categoria
mesa, comanda, balcão
pedido e status de cozinha
estoque
delivery (catálogo, pedido, Pix sandbox, webhook)
cardápio público
permissões por papel
loja A não lê loja B
```

## CI/CD

Inexistente. O Dockerfile é o único artefato de deploy do backend. A web não tem rewrite de SPA (`_redirects`, `render.yaml` ou equivalente). Produção não pode fazer auto-deploy a cada push em `main`.

## Observabilidade

Logs de aplicação via stdout (o que o Render coleta). Sem Actuator, sem alerta, sem Crashlytics de staging separado, sem trilha de auditoria de quem alterou preço ou pagamento. Crashlytics existe só no flavor `play`, se o `google-services.json` local estiver presente.
