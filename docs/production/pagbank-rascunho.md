# PagBank no delivery — rascunho

Este texto descreve o que já está no código e o que ainda depende de uma conta sandbox. Não contém token, chave, segredo nem URL assinada.

## O que o cliente vê

O pagamento continua na página de delivery da Weper. Não há redirecionamento para um checkout hospedado e não usamos link de pagamento.

Pix: o backend cria o pedido na API de Pedidos e devolve o copia-e-cola e a imagem. O navegador não recebe o token da loja.

Cartão: o navegador cifra o cartão com a chave pública e envia só o resultado. A Weper não grava número, CVV nem o blob cifrado. Débito e parcelamento ficam de fora desta etapa. O pagamento é à vista, com captura imediata.

## Quem recebe o dinheiro

Cada loja informa o token da própria conta PagBank. A cobrança usa esse token, então o valor cai na conta do estabelecimento. A Weper não recebe o dinheiro e não usa split nem marketplace.

Mercado Pago permanece disponível. A loja escolhe um provedor online por vez. Uma cobrança já criada continua no provedor em que nasceu.

## O que confirma o pagamento

O pedido só fica pago depois que o servidor consulta o PagBank com o token da loja. Aviso do navegador e o corpo da notificação não liquidam a venda. `AUTHORIZED` e `IN_ANALYSIS` deixam o pedido em análise. Status desconhecido não vira pago.

A notificação chega em `POST /api/webhooks/pagbank`, com a assinatura do corpo cru. A rota do Mercado Pago não muda.

## O que ainda não está feito

Homologar no sandbox, inclusive Pix com chave Pix na conta, cartão cifrado de verdade, a primeira notificação real e cancelamento/estorno. O host de produção da API ainda precisa ser confirmado na documentação de ambientes antes de qualquer loja em produção. Não há credencial PagBank no servidor.

Enquanto isso, o provedor padrão das lojas continua Mercado Pago.
