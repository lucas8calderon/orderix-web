# Como a loja cadastra o PagBank

Guia para o administrador da loja. Não contém token, chave nem exemplo de credencial. Consulta da documentação do PagBank em 18 out 2026.

A cobrança usa a API de Pedidos. O cliente paga na página de delivery da Weper. Não é o Checkout hospedado, nem a API antiga que pede e-mail e token.

Uma loja que já usa Mercado Pago continua nele. O PagBank só entra quando o administrador escolhe esse provedor e salva.

## Na Weper

1. Abra [www.weper.com.br](https://www.weper.com.br) e entre com o e-mail do administrador da loja.
2. No menu lateral, abra Configurações.
3. Abra Delivery. O bloco é Pagamentos online. O atalho Pagamentos do salão não guarda este token.
4. Em Provedor online, escolha PagBank.
5. Em Ambiente, use Sandbox só para teste. Produção é a cobrança real.
6. Cole o token em Token da conta e clique em Salvar. A tela não mostra o token de novo.
7. Clique em Testar conexão. O teste guarda a chave pública de cartão.
8. Ligue Pix online e salve. O cartão de crédito online só libera depois do teste.

O mesmo passo a passo aparece em carrossel nesse bloco, nas abas Na Weper e No PagBank.

## No PagBank

O token de produção sai da conta que vai receber o dinheiro, no computador:

1. Entre na conta PagBank.
2. No menu lateral, abra Vendas.
3. Abra Integrações.
4. Clique em Gerar Token.

Se a conta já tiver token, o PagBank envia o atual para o e-mail do cadastro. Gerar outro invalida o anterior. A aba Tokens do portal de desenvolvedor é só sandbox.

A conta precisa de uma chave Pix. Sem ela, a cobrança é recusada.

Fonte: [Token de autenticação](https://developer.pagbank.com.br/docs/token-de-autenticacao), consulta em 18 out 2026.

## Produção e sandbox

Sandbox fala com `https://sandbox.api.pagseguro.com`. Produção fala com `https://api.pagseguro.com`. Os hosts foram conferidos na página de ambientes em 18 out 2026.

O token fica só na conta da loja. Não existe token PagBank no servidor da Weper. Não envie o token por mensagem ou comentário.

A produção pode responder que a conta ainda não foi liberada para a API de Pedidos. Nesse caso o token pode estar certo, e falta a homologação do PagBank. O prazo informado por eles é de até 4 dias úteis quando o pedido de homologação está completo. Fonte: [Primeiros passos](https://developer.pagbank.com.br/docs/primeiros-passos).

## Webhook

A loja não cola segredo de webhook. A Weper envia a URL de notificação ao criar a cobrança e só muda o pagamento depois de consultar o PagBank com o token da loja. Corpo sem assinatura válida não quita o pedido.

Enquanto a notificação real não for aceita, a tela de Pix continua consultando até pagar, expirar ou falhar.

## Voltar ao Mercado Pago

Em Provedor online, escolha Mercado Pago e salve. A conta PagBank permanece guardada. Pagamento já criado continua no provedor em que nasceu.

## Quando o pagamento não quita

Pix recusado na criação não marca o pedido como pago. Cartão autorizado ou em análise também não. O crédito deste cadastro é à vista. Débito com 3DS fica de fora.

O estorno do valor é manual no painel do PagBank ou do Mercado Pago. Na Weper, a cozinha ou o administrador cancela o pedido e informa o motivo. Esse texto aparece para o cliente e para quem recupera o pedido em aberto.
