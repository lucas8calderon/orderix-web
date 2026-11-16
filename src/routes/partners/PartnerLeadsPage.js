import { Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { CrmBoard } from '../master/crm/CrmBoard';
import { PATHS, partnerCanOpenCrm } from '../../services/accessControl';
import { getCurrentUser } from '../../services/session';
import PartnerShell from './PartnerShell';

/** Mesmo Kanban do CRM. A busca no Google Places continua só no painel admin. */
export default function PartnerLeadsPage() {
  const user = getCurrentUser();
  if (!partnerCanOpenCrm(user)) {
    return (
      <PartnerShell>
        <Alert severity="info" sx={{ mt: 2 }}>
          Os leads do CRM ficam disponíveis quando a Weper ativar seu cadastro.{' '}
          <Link to={PATHS.PARTNERS_DASHBOARD}>Voltar ao início</Link>
        </Alert>
      </PartnerShell>
    );
  }

  return (
    <PartnerShell maxWidth={1440}>
      <CrmBoard />
    </PartnerShell>
  );
}
