import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, Clock3, ExternalLink, Mail, MessageCircle } from 'lucide-react';
import { PATHS } from '../../services/accessControl';
import { WHATSAPP_NUMBER } from '../home/landingAssets';

export const SUPPORT_MESSAGE =
  'Olá! Acabei de contratar a Weper e preciso de ajuda para acessar minha conta. Meu pagamento já foi confirmado. Podem me ajudar?';

/** Link oficial de suporte, com o número centralizado da landing. Sem dados pessoais na mensagem. */
export function supportWhatsAppUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(SUPPORT_MESSAGE)}`;
}

const INVITE_COPY = {
  SENT: {
    title: 'Convite de acesso por e-mail',
    Icon: Mail,
    tone: 'info',
  },
  PENDING: {
    title: 'Estamos preparando seu acesso',
    text: 'O pagamento foi confirmado. Você receberá as instruções por e-mail assim que seu convite estiver pronto.',
    Icon: Clock3,
    tone: 'info',
  },
  FAILED: {
    title: 'Não conseguimos enviar seu convite',
    text: 'Seu pagamento foi confirmado, mas houve um problema no envio das instruções de acesso. Nossa equipe poderá ajudar.',
    Icon: AlertCircle,
    tone: 'warning',
  },
};

/**
 * Última etapa do checkout. Só é exibida com o pagamento confirmado pelo backend (poll de status).
 * O estado do convite vem do backend; sem ele, mostra "preparando" em vez de afirmar que foi enviado.
 */
export default function SignupConfirmation({ inviteStatus, maskedEmail }) {
  const status = INVITE_COPY[inviteStatus] ? inviteStatus : 'PENDING';
  const copy = INVITE_COPY[status];
  const { Icon } = copy;

  return (
    <div className="ct-done" data-testid="signup-paid">
      <div className="ct-done-hero">
        <span className="ct-done-icon" aria-hidden="true">
          <Check size={30} strokeWidth={3} />
        </span>
        <h2 id="ct-checkout-title" className="ct-done-title">Pagamento confirmado!</h2>
        <p className="ct-done-lead">Sua assinatura Weper foi confirmada com sucesso.</p>
      </div>

      <section
        className={`ct-invite ct-invite--${copy.tone}`}
        aria-labelledby="ct-invite-title"
        aria-live="polite"
        data-testid={`invite-${status.toLowerCase()}`}
      >
        <span className="ct-invite-icon" aria-hidden="true">
          <Icon size={22} />
        </span>
        <div className="ct-invite-body">
          <h3 id="ct-invite-title">{copy.title}</h3>
          {status === 'SENT' ? (
            <>
              <p>
                {maskedEmail
                  ? <>Enviamos as instruções de acesso para <strong>{maskedEmail}</strong>.</>
                  : 'Enviamos as instruções de acesso para o e-mail informado na contratação.'}
              </p>
              <p className="ct-invite-hint">
                Verifique sua caixa de entrada ou spam, aceite o convite e crie sua senha para começar a usar a Weper.
              </p>
            </>
          ) : (
            <p>{copy.text}</p>
          )}
        </div>
      </section>

      <Link className="ct-done-cta" to={PATHS.LOGIN}>
        Acessar Weper
        <ArrowRight size={18} aria-hidden="true" />
      </Link>

      <div className="ct-done-help">
        <span>Precisa de ajuda?</span>
        <a href={supportWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="ct-done-support">
          <MessageCircle size={17} aria-hidden="true" />
          Suporte via WhatsApp
          <ExternalLink size={14} aria-hidden="true" />
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      </div>
    </div>
  );
}
