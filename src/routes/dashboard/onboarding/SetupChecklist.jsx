import { Link } from 'react-router-dom';
import { Box, IconButton, LinearProgress, Typography } from '@mui/material';
import { ArrowRight, CheckCircle2, Circle, X } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';
import { onboardingSupportUrl } from '../../../services/onboardingService';
import './Onboarding.css';

export const CHECKLIST_TASKS = {
  store_info: { label: 'Cadastrar informações da loja', to: `${PATHS.APP_CONFIGURACOES}/empresa` },
  products: { label: 'Adicionar produtos ao cardápio', to: PATHS.APP_PRODUTOS },
  payments: { label: 'Configurar recebimentos', to: `${PATHS.APP_CONFIGURACOES}/pagamentos` },
  channel: { label: 'Configurar entrega ou atendimento', to: `${PATHS.APP_CONFIGURACOES}/canais` },
  first_order: { label: 'Realizar um pedido de teste', to: PATHS.APP_ATENDIMENTO },
};

/**
 * Checklist "Prepare sua loja para vender". O estado de cada tarefa vem do backend, calculado dos
 * dados reais da loja; aqui não existe checkbox manual.
 */
export default function SetupChecklist({ checklist, onDismiss, onAcknowledge }) {
  if (!checklist || !checklist.visible || !Array.isArray(checklist.tasks) || checklist.tasks.length === 0) {
    return null;
  }
  const total = checklist.tasks.length;
  const done = checklist.completedCount ?? checklist.tasks.filter((task) => task.done).length;
  const percent = Math.round((done / total) * 100);

  if (checklist.allDone) {
    return (
      <Box component="section" className="onb-checklist onb-checklist--done" aria-live="polite" data-testid="setup-checklist-done" sx={{ bgcolor: 'background.paper' }}>
        <Box className="onb-checklist-head">
          <CheckCircle2 size={22} className="onb-checklist-success" aria-hidden="true" />
          <Box>
            <Typography component="h2" className="onb-checklist-title">Sua loja está pronta para começar! 🎉</Typography>
            <Typography className="onb-checklist-sub">
              Parabéns por concluir os primeiros passos. Desejamos muitas vendas e sucesso com a Weper!
            </Typography>
          </Box>
          <IconButton size="small" aria-label="Fechar" onClick={onAcknowledge}>
            <X size={18} />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="section" className="onb-checklist" aria-labelledby="onb-checklist-title" data-testid="setup-checklist" sx={{ bgcolor: 'background.paper' }}>
      <Box className="onb-checklist-head">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" id="onb-checklist-title" className="onb-checklist-title">
            Prepare sua loja para vender
          </Typography>
          <Typography className="onb-checklist-sub">Conclua os primeiros passos no seu ritmo.</Typography>
        </Box>
        <span className="onb-checklist-count">{done} de {total}</span>
        <IconButton size="small" aria-label="Dispensar checklist" onClick={onDismiss}>
          <X size={18} />
        </IconButton>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percent}
        className="onb-checklist-progress"
        aria-label={`${done} de ${total} passos concluídos`}
      />
      <ul className="onb-checklist-list">
        {checklist.tasks.map((task) => {
          const meta = CHECKLIST_TASKS[task.id];
          if (!meta) return null;
          return (
            <li key={task.id} className={task.done ? 'is-done' : ''}>
              {task.done
                ? <CheckCircle2 size={18} className="onb-checklist-check" aria-hidden="true" />
                : <Circle size={18} className="onb-checklist-dot" aria-hidden="true" />}
              <span className="onb-checklist-label">
                {meta.label}
                <span className="sr-only">{task.done ? ' (concluído)' : ' (pendente)'}</span>
              </span>
              {!task.done ? (
                <Link to={meta.to} className="onb-checklist-go" aria-label={`${meta.label}: abrir`}>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="onb-checklist-help">
        Precisa de ajuda?{' '}
        <a href={onboardingSupportUrl()} target="_blank" rel="noopener noreferrer">
          Fale com a Weper.
          <span className="sr-only"> (abre o WhatsApp em nova aba)</span>
        </a>
      </p>
    </Box>
  );
}
