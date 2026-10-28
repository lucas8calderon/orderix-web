# Impressão USB 80 mm — Weper Web

Piloto da KP-IM609 pelo Chrome ou Edge, usando o driver do Windows e a janela de impressão. Não há ESC/POS direto nem impressão silenciosa. A validação física continua pendente até o cliente confirmar o papel.

## Escopo

Configurações → Visão Geral oferece o teste e o diagnóstico. Na cobrança de mesas, comandas, balcão, pedidos por cliente e delivery, a comanda usa os itens já carregados da conta e o título daquela tela (mesa, comanda, entrega ou retirada). Imprimir não cobra, não fecha a conta, não envia o pedido à cozinha e não aciona Bluetooth.

O papel é uma comanda. Traz `COMANDA`, `NÃO É DOCUMENTO FISCAL` e `NÃO É COMPROVANTE DE PAGAMENTO`. O preço de cada item inclui adicionais pelo mesmo cálculo da cobrança. Não resume taxa, desconto, entrega nem pagamento, e não imprime telefone.

Cada pedido sai como na tela: `Pedido #id`, nome do cliente, quantidade, nome, grupos obrigatórios, extras com quantidade, observação do item e observação do pedido. Se o código legível for diferente do id, a linha `Código` aparece junto. Pedido cancelado leva o motivo. Nomes longos quebram dentro da área útil. Acentos permanecem porque a página é UTF-8.

## Ativação e reversão

`REACT_APP_THERMAL_PRINT_SCOPE` é variável de build do Create React App. `all` (também com espaços ou maiúsculas) libera todas as lojas que tenham `storeId` na sessão. Uma lista como `12,34` restringe às lojas indicadas. Ausente ou vazia desativa. Não há ativação por URL ou localStorage. A flag só mostra ou esconde a interface; o backend continua validando o JWT.

O valor entra no JavaScript na hora do build. Gravar a variável no Render sem um build novo não muda o site. A opção “salvar e publicar o build existente” não serve: é preciso rebuild.

Para reverter sem desfazer o restante do site, esvazie `REACT_APP_THERMAL_PRINT_SCOPE` no serviço `weper-production-web` e dispare um deploy com rebuild. A interface some na publicação seguinte.

Para voltar o artefato inteiro, republicar o deploy anterior a esta liberação: `dep-dbgjbtt9el5s73b3gvvg`, commit `8d7e6c5` (27 out 2026). Não usar o deploy de `c8a0593`: ele remove publicações posteriores já no ar, entre elas a ordem das categorias, os filtros da cozinha e o pixel.

## Publicação

Conferido em 28 out 2026 no Render, workspace `weper`:

| Peça | Valor |
| --- | --- |
| Site | `weper-production-web` |
| URLs | `https://www.weper.com.br`, apex e `https://weper-production-web.onrender.com` |
| Branch do serviço | `staging` |
| Auto-deploy | desligado |
| Build | `npm ci && CI=false npm run build` |
| Pasta publicada | `build` |
| API no bundle em produção (`main.9f2a9efb.js`) | `https://api.weper.com.br` |

O GitHub Actions em `.github/workflows/ci.yml` só testa. Push em `staging` não publica: os static sites de produção e de homologação estão com auto-deploy desligado, e os deploys recentes foram disparados manualmente (`trigger: api`). O README descreve a mesma promoção manual.

`npm run build` recusa URL ausente, HTTP, localhost e host `*.invalid`, inclusive `https://validation.invalid`. Esse host serve só para ensaio local e não pode ir para o serviço.

Passos da liberação:

1. Publicar só o commit do piloto em `staging`. O working tree tem outras alterações locais; elas não entram nesse commit.
2. Confirmar que o push não criou deploy.
3. No `weper-production-web`, manter `REACT_APP_API_BASE_URL=https://api.weper.com.br`. Não apontar para localhost, para a API de homologação nem para `validation.invalid`.
4. Definir `REACT_APP_THERMAL_PRINT_SCOPE=all` nesse serviço, sem substituir as outras variáveis.
5. Disparar o deploy manual com rebuild. Homologação (`weper-staging-web`) fica como está.
6. No bundle novo, confirmar `https://api.weper.com.br` e a ausência de `localhost` e `validation.invalid`.
7. A confirmação física da KP-IM609 continua com o cliente.

## Roteiro do cliente

1. Instalar o driver indicado pelo fabricante e imprimir a página de teste do Windows. USB conectado e bobina de 80 mm.
2. Entrar em `https://www.weper.com.br`, abrir Configurações → Visão Geral e usar Imprimir teste KP-IM609. Permitir pop-ups da Weper.
3. Na janela, selecionar a KP-IM609, papel 80 mm, escala 100%, margens nenhuma e cabeçalhos/rodapés desativados. O conteúdo tem 80 mm de largura e reserva 4 mm de cada lado (72 mm úteis). O Chrome usado na validação ignora `size: 80mm auto`, então o formulário de 80 mm precisa ser escolhido no diálogo e no driver. Se a prévia mostrar A4, escolher antes o formulário de bobina. O comprimento vem do driver.
4. Conferir o fim da comanda, os acentos (`ação`, `pão`, `açúcar`, `café`), a quantidade e a quebra do nome longo. A faixa do teste não é pedido de cliente.
5. Cancelar a janela de impressão. O painel não pode dizer que imprimiu. Escolher “Cancelei a impressão”, preencher a observação sem dados de clientes e copiar o relatório. O relatório não é enviado nem gravado sozinho.
6. Abrir uma cobrança real e imprimir a comanda sem finalizar a venda. Conferir, contra a tela, mesa ou comanda, número do pedido, quantidades, adicionais, observações e nomes longos. O papel precisa dizer que não é documento fiscal nem comprovante de pagamento. A conta deve continuar aberta.
7. Enviar o relatório manualmente ao suporte. Aceite físico: teste e comanda real completos, legíveis e sem corte, confirmados por quem está na impressora.

## Limitações

Não há validação física da KP-IM609 nesta entrega. A janela não informa papel, erro de spooler ou cancelamento. `afterprint` e o fechamento da janela não contam como sucesso. Corte, gaveta e ESC/POS direto ficam de fora. Largura, paginação e alimentação dependem do driver. Se o teste remoto falhar de forma sistêmica, esvaziar a flag e republicar, ou restaurar o deploy `dep-dbgjbtt9el5s73b3gvvg`.

Referências: https://developer.mozilla.org/en-US/docs/Web/API/Window/print e https://developer.mozilla.org/en-US/docs/Web/API/Window/afterprint_event
