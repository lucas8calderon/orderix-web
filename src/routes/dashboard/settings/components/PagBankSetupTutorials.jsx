import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const TUTORIALS = [
  {
    id: 'weper',
    label: 'Na Weper',
    slides: [
      {
        title: 'Entre na loja',
        body: 'Abra www.weper.com.br e entre com o e-mail e a senha do administrador da loja. Garçom e cozinha não chegam nesta tela.',
        example: ['www.weper.com.br', 'E-mail do administrador', 'Senha', 'Entrar'],
      },
      {
        title: 'Abra Configurações',
        body: 'No menu lateral do painel, clique em Configurações.',
        example: ['Menu', 'Dashboard', 'Atendimento', 'Configurações'],
      },
      {
        title: 'Abra Delivery',
        body: 'Dentro de Configurações, abra Delivery. O cadastro do PagBank fica no bloco Pagamentos online, não em Pagamentos do salão.',
        example: ['Configurações da Loja', 'Delivery', 'Pagamentos online'],
      },
      {
        title: 'Escolha PagBank',
        body: 'Em Provedor online, selecione PagBank. Uma loja que já usa Mercado Pago continua nele até esta troca. Cobrança já criada não muda de provedor.',
        example: ['Provedor online', 'Mercado Pago', 'PagBank'],
      },
      {
        title: 'Cole o token e salve',
        body: 'A loja usa produção. Cole o token no campo Token da conta e clique em Salvar. O valor não volta para a tela. Sandbox fica só na homologação Weper ou no perfil master.',
        example: ['Token da conta', 'Salvar'],
      },
      {
        title: 'Teste e ligue o Pix',
        body: 'Depois de salvar, clique em Testar conexão. O teste guarda a chave de cartão e não mostra o token. Aí ligue Pix online. O cartão só libera depois desse teste. Salve de novo.',
        example: ['Testar conexão', 'Pix online', 'Cartão de crédito online'],
      },
    ],
  },
  {
    id: 'pagbank',
    label: 'No PagBank',
    slides: [
      {
        title: 'Use a conta que recebe',
        body: 'O token é da conta PagBank do estabelecimento, no computador. O dinheiro cai nessa conta. A Weper não recebe o valor e não pede e-mail nem token da API antiga.',
        example: ['Conta PagBank da loja', 'Computador', 'Quem recebe é a loja'],
      },
      {
        title: 'Gere o token de produção',
        body: 'No menu lateral, abra Vendas, depois Integrações, e clique em Gerar Token. Caminho conferido em 18 out 2026 na documentação do PagBank.',
        example: ['Vendas', 'Integrações', 'Gerar Token'],
      },
      {
        title: 'Se o token já existir',
        body: 'O PagBank envia o token atual para o e-mail da conta. Gerar outro invalida o anterior. Não use o token da aba Tokens do portal de desenvolvedor: aquele é só sandbox.',
        example: ['Enviar por e-mail', 'Token antigo deixa de valer', 'Aba Tokens = sandbox'],
      },
      {
        title: 'Tenha uma chave Pix',
        body: 'A conta precisa de ao menos uma chave Pix. Sem ela, o PagBank recusa a cobrança. O cliente paga na página de delivery da Weper, sem abrir outro site.',
        example: ['Chave Pix ativa', 'QR na página da loja', 'Sem redirect'],
      },
      {
        title: 'Cole só na Weper',
        body: 'Volte em Configurações, Delivery, Pagamentos online. Ambiente Produção, campo Token da conta, Salvar. Não envie o token por mensagem, e-mail solto ou comentário.',
        example: ['Pagamentos online', 'Produção', 'Token da conta'],
      },
      {
        title: 'Se a produção recusar',
        body: 'A mensagem “conta ainda não foi liberada” significa que o PagBank precisa homologar a API de Pedidos. O token pode estar certo. Pix recusado ou cartão em análise não entra como pago. O estorno do valor é manual no painel do PagBank.',
        example: ['Homologação da API de Pedidos', 'Pix recusado não quita', 'Estorno no painel'],
      },
    ],
  },
];

export function PagBankSetupTutorials() {
  const [trackId, setTrackId] = useState(TUTORIALS[0].id);
  const [index, setIndex] = useState(0);
  const track = TUTORIALS.find((item) => item.id === trackId) || TUTORIALS[0];
  const slide = track.slides[index];

  const selectTrack = (nextId) => {
    setTrackId(nextId);
    setIndex(0);
  };

  return (
    <Box className="pagbank-tutorial" aria-roledescription="carrossel" aria-label="Como cadastrar o PagBank">
      <Typography className="pagbank-tutorial__kicker" variant="overline">
        Tutorial
      </Typography>
      <Typography className="pagbank-tutorial__title" variant="subtitle1">
        Como cadastrar o PagBank
      </Typography>
      <Box className="pagbank-tutorial__tracks" role="tablist" aria-label="Tutoriais">
        {TUTORIALS.map((item) => (
          <Button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === track.id}
            className={item.id === track.id ? 'is-selected' : ''}
            onClick={() => selectTrack(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </Box>
      <Typography className="pagbank-tutorial__step" variant="body2">
        Passo {index + 1} de {track.slides.length}
      </Typography>
      <Typography className="pagbank-tutorial__slide-title" variant="h6">
        {slide.title}
      </Typography>
      <Typography className="pagbank-tutorial__body" variant="body2">
        {slide.body}
      </Typography>
      <Box className="pagbank-tutorial__screen" aria-hidden="true">
        {slide.example.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </Box>
      <Box className="pagbank-tutorial__nav">
        <Button type="button" variant="text" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}>
          Anterior
        </Button>
        <Box className="pagbank-tutorial__dots">
          {track.slides.map((item, dotIndex) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Passo ${dotIndex + 1}: ${item.title}`}
              className={dotIndex === index ? 'is-current' : ''}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </Box>
        <Button
          type="button"
          variant="text"
          disabled={index === track.slides.length - 1}
          onClick={() => setIndex((current) => current + 1)}
        >
          Próximo
        </Button>
      </Box>
    </Box>
  );
}
