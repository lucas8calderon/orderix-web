# Restore e suspensão

Produção em 15 out 2026. Sem senha, connection string ou chave.

## Onde está cada peça

| Peça | Nome | Painel |
| --- | --- | --- |
| Banco | `weper-production-db` | https://dashboard.render.com/d/dpg-db7uc5jl550s73de2qsg-a |
| API | `weper-production-api` | https://dashboard.render.com/web/srv-db7ufn8m7kps73cv0ql0 |
| Site | `weper-production-web` | https://dashboard.render.com/static/srv-db7ubmo473hc7381t6v0 |

O banco de staging é outra instância. A API de staging não usa este Postgres.

O plano do banco é `0.1c-256mb`, Postgres 16, disco de 1 GB, uma instância, sem réplica. A cópia de segurança fica na aba Recovery desse banco, no Render. O painel mostra PITR de 7 dias, conferido no card 021.

## Alerta de health

O workspace `weper` envia só notificações de falha, por e-mail. A API de produção herda esse padrão e não tem destino próprio. O caminho conferido pelo Render é `GET /health`.

Uma instância que falha esse caminho por cerca de 60 segundos é reiniciada, e o Render avisa. Não troque esse caminho para testar sem devolvê-lo a `/health` no mesmo instante: o próximo deploy usa o caminho gravado.

Em 15 out 2026 o teste foi feito só na API de staging. Um deploy com um caminho que não existe falhou, o evento `deploy_ended` ficou com status failed, e a instância anterior continuou respondendo `GET /health` 200. O caminho voltou para `/health` e o deploy seguinte ficou no ar. Produção não entrou nesse teste.

## Se o site ou a API precisar sair do ar

1. Abra o serviço (API ou site) no painel.
2. Suspenda o serviço. Não delete.
3. O Postgres permanece. Suspender a API não apaga pedido, usuário nem backup.

Para voltar, retome o mesmo serviço. O auto-deploy de produção continua desligado: um resume não deve puxar commit novo sozinho.

## Se o banco precisar ser restaurado

1. Abra `weper-production-db` e a aba Recovery.
2. Restaure para uma instância nova. Não restaure por cima do banco que está servindo.
3. Não aponte `weper-staging-api` para a instância nova nem para a de produção.
4. No serviço `weper-production-api`, troque só as variáveis de banco para a instância nova depois de conferir o `/health` dela em separado.
5. A senha da instância nova aparece na aba Connect do banco novo. Ela não entra neste arquivo nem no Git.
6. Confirme `GET /health` da API de produção. O login de demonstração (`minions@gmail.com`, `lucas.adm@gmail.com`) continua inexistente.

## O que não fazer

- Não criar uma segunda instância da API. O rate limit de login e o sync em memória não são compartilhados entre processos.
- Não copiar `DB_URL` de produção para staging.
- Não colar a senha do banco, `JWT_SECRET`, `PAYMENT_SECRETS_KEY` ou `BOOTSTRAP_SUPER_PASSWORD` em card, chat ou documento.
