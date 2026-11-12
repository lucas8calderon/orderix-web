# Telas da seção "Funcionalidades" da home

As imagens de `src/assets/images/landing/features/` são capturas do produto com dados fictícios da loja de demonstração "Weper Burger". Estes scripts refazem as capturas quando a interface mudar.

## Como funciona

- `capture-panel.js`: abre o painel da loja (`/app/dashboard`, `/app/atendimento`, `/app/cozinha`, `/app/estoque`) no dev server local. A sessão é fictícia e toda chamada à API é interceptada pelo Playwright, que responde com os dados do próprio script. Nenhum backend, banco ou credencial é usado.
- `capture-delivery.js`: abre o delivery público (`/delivery/weper-burger`) e o acompanhamento do pedido em tamanho de celular, também com a API interceptada. Nenhum pedido é criado.
- `convert.js`: converte as capturas em WebP nos tamanhos usados pela landing. Também recorta a barra de status das capturas do app Android (`orderix-visual/assets/product-screenshots/app-garcom`).

## Rodar

Com o `npm start` da web em `http://localhost:3000`:

```bash
node scripts/landing-screens/capture-panel.js
node scripts/landing-screens/capture-delivery.js
node scripts/landing-screens/convert.js
```

O Playwright e o sharp vêm de `orderix-visual/node_modules`. Para usar outra instalação, defina `PLAYWRIGHT_PATH` e `SHARP_PATH`. Se o terminal usa proxy, rode sem `HTTP_PROXY`/`HTTPS_PROXY`: o Chromium não alcança `localhost` através dele.

## Cuidados

- Use só dados fictícios. Não capture lojas reais nem marcas de terceiros.
- As capturas do app do garçom são de aparelho (20/09/2026). Só entram as telas sem nome de loja e sem produto de marca.
- Não há captura do autoatendimento em tablet. Por isso a seção só cita o recurso com um link, sem mockup.
