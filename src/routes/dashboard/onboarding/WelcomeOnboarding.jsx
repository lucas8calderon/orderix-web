import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Dialog, IconButton, Typography } from '@mui/material';
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  ChefHat,
  Headset,
  LayoutDashboard,
  Package,
  PartyPopper,
  QrCode,
  Receipt,
  Rocket,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { onboardingSupportUrl } from '../../../services/onboardingService';
import './Onboarding.css';

const FEATURES = [
  { label: 'Pedidos e PDV', Icon: Receipt },
  { label: 'Mesas e comandas', Icon: UtensilsCrossed },
  { label: 'Cozinha', Icon: ChefHat },
  { label: 'Estoque', Icon: Package },
  { label: 'Cardápio digital', Icon: QrCode },
  { label: 'Delivery próprio', Icon: Bike },
];

const SUPPORT_POINTS = [
  'Orientação na configuração inicial.',
  'Ajuda com o cadastro de produtos.',
  'Suporte humanizado.',
  'Acompanhamento para começar a utilizar o sistema.',
];

export function buildSteps(storeName) {
  const name = String(storeName || '').trim();
  return [
    {
      id: 'welcome',
      Icon: PartyPopper,
      title: name ? `Bem-vindo à Weper, ${name}! 🎉` : 'Bem-vindo à Weper! 🎉',
      subtitle: 'Uma nova etapa começa agora.',
      body: [
        'Estamos muito felizes em fazer parte do seu negócio!',
        'Desejamos muito sucesso, ótimas vendas e muitos clientes satisfeitos.',
        'Conte com a Weper para ajudar a tornar sua operação mais simples e organizada.',
      ],
    },
    {
      id: 'platform',
      Icon: LayoutDashboard,
      title: 'Tudo para seu negócio.',
      subtitle: 'Sua operação em um só lugar.',
      body: [
        'Com a Weper, você pode organizar pedidos, mesas, comandas, cozinha, estoque, cardápio digital e delivery em uma única plataforma.',
      ],
      extra: 'features',
    },
    {
      id: 'delivery',
      Icon: ShoppingBag,
      title: 'Seu delivery, sua marca.',
      subtitle: 'Mais liberdade para vender.',
      body: [
        'Tenha seu próprio cardápio digital, compartilhe o link com seus clientes e receba pedidos diretamente na sua operação.',
        'Na Weper, você não paga comissão por pedido.',
      ],
      highlight: 'Seu negócio. Seus clientes. Suas vendas.',
    },
    {
      id: 'support',
      Icon: Headset,
      title: 'Conte com a gente!',
      subtitle: 'Você não precisa começar sozinho.',
      body: [
        'Nossa equipe está aqui para ajudar você a dar os primeiros passos.',
        'Precisa de ajuda para configurar sua loja, cadastrar produtos ou entender alguma funcionalidade? Pode contar com a Weper!',
      ],
      extra: 'support',
    },
    {
      id: 'start',
      Icon: Rocket,
      title: 'Vamos começar?',
      subtitle: 'Prepare sua loja para receber pedidos.',
      body: [
        'Agora é hora de colocar tudo em funcionamento! Vamos ajudar você a configurar sua loja, organizar seu cardápio e realizar seu primeiro pedido.',
        'Desejamos muito sucesso e excelentes vendas! Seja muito bem-vindo à Weper.',
      ],
    },
  ];
}

/**
 * Carrossel de boas-vindas (5 etapas). Nunca bloqueia o painel: fechar equivale a pular.
 * onStep salva o progresso; onFinish('complete' | 'explore' | 'skip') registra a decisão.
 */
export default function WelcomeOnboarding({ open, storeName, initialStep = 0, onStep, onFinish }) {
  const steps = buildSteps(storeName);
  const last = steps.length - 1;
  const [index, setIndex] = useState(() => Math.min(Math.max(initialStep, 0), last));
  const [direction, setDirection] = useState(1);
  const headingRef = useRef(null);

  useEffect(() => {
    if (open) setIndex(Math.min(Math.max(initialStep, 0), last));
  }, [open, initialStep, last]);

  useEffect(() => {
    if (open && headingRef.current) headingRef.current.focus();
  }, [index, open]);

  const go = useCallback((next) => {
    const bounded = Math.min(Math.max(next, 0), last);
    setDirection(bounded >= index ? 1 : -1);
    setIndex(bounded);
    if (onStep) onStep(bounded);
  }, [index, last, onStep]);

  function handleKeyDown(event) {
    if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
    if (event.key === 'ArrowRight' && index < last) {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      go(index - 1);
    }
  }

  const step = steps[index];
  const { Icon } = step;

  return (
    <Dialog
      open={open}
      onClose={() => onFinish('skip')}
      fullWidth
      maxWidth={false}
      aria-labelledby="onb-title"
      aria-describedby="onb-body"
      onKeyDown={handleKeyDown}
      PaperProps={{ className: 'onb-dialog', elevation: 0 }}
    >
      <Box className="onb-head">
        <span className="onb-brand">
          <Sparkles size={16} aria-hidden="true" />
          Boas-vindas Weper
        </span>
        <span className="onb-count" aria-live="polite">{index + 1} de {steps.length}</span>
        <IconButton size="small" aria-label="Fechar apresentação" onClick={() => onFinish('skip')}>
          <X size={18} />
        </IconButton>
      </Box>

      <Box className="onb-progress" role="progressbar" aria-label="Progresso da apresentação"
        aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1}>
        {steps.map((item, i) => (
          <span key={item.id} className={`onb-progress-bar${i <= index ? ' is-on' : ''}`} />
        ))}
      </Box>

      <Box key={step.id} className={`onb-step onb-step--${direction > 0 ? 'next' : 'prev'}`} data-testid={`onb-step-${step.id}`}>
        <span className={`onb-icon${index === last ? ' onb-icon--last' : ''}`} aria-hidden="true">
          <Icon size={30} />
        </span>
        <Typography component="h2" id="onb-title" className="onb-title" tabIndex={-1} ref={headingRef}>
          {step.title}
        </Typography>
        <Typography className="onb-subtitle">{step.subtitle}</Typography>
        <Box id="onb-body" className="onb-body">
          {step.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </Box>

        {step.extra === 'features' ? (
          <ul className="onb-features">
            {FEATURES.map(({ label, Icon: FeatureIcon }) => (
              <li key={label}><FeatureIcon size={16} aria-hidden="true" />{label}</li>
            ))}
          </ul>
        ) : null}
        {step.highlight ? <p className="onb-highlight">{step.highlight}</p> : null}
        {step.extra === 'support' ? (
          <>
            <ul className="onb-points">
              {SUPPORT_POINTS.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <a className="onb-support" href={onboardingSupportUrl()} target="_blank" rel="noopener noreferrer">
              Falar com suporte
              <span className="sr-only"> (abre o WhatsApp em nova aba)</span>
            </a>
          </>
        ) : null}
      </Box>

      <Box className={`onb-actions${index === last ? ' onb-actions--last' : ''}`}>
        {index === 0 ? (
          <Button variant="text" color="inherit" className="onb-ghost" onClick={() => onFinish('skip')}>
            Pular apresentação
          </Button>
        ) : index < last ? (
          <Button variant="text" color="inherit" className="onb-ghost" startIcon={<ArrowLeft size={16} />} onClick={() => go(index - 1)}>
            Voltar
          </Button>
        ) : (
          <Button variant="text" color="inherit" className="onb-ghost" onClick={() => onFinish('explore')}>
            Explorar por conta própria
          </Button>
        )}
        {index < last ? (
          <Button variant="contained" disableElevation endIcon={<ArrowRight size={16} />} onClick={() => go(index + 1)}>
            Continuar
          </Button>
        ) : (
          <Button variant="contained" disableElevation endIcon={<ArrowRight size={16} />} onClick={() => onFinish('complete')}>
            Começar a configurar minha loja
          </Button>
        )}
      </Box>
    </Dialog>
  );
}
