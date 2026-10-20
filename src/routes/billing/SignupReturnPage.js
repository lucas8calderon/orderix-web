import { Link } from 'react-router-dom';
import { PATHS } from '../../services/accessControl';
import '../home/styles/Rebrand.css';

/** Retorno da fatura Asaas. Abrir esta página não consulta pagamento nem ativa a loja. */
export default function SignupReturnPage() {
  return (
    <main className="wp-site">
      <section className="wp-section">
        <div className="wp-container" style={{ maxWidth: 720 }}>
          <Link to={PATHS.SIGNUP}>Voltar à contratação</Link>
          <h1>Pagamento em confirmação</h1>
          <p>
            Voltar da fatura não ativa a loja e não substitui o Pix. Se você gerou um Pix na Weper,
            volte à tela de contratação e aguarde a confirmação lá — sem precisar do login do Asaas
            nem do login da Weper.
          </p>
          <p>A loja ainda não está ativa. O convite chega por e-mail depois que o pagamento for confirmado.</p>
          <p>
            <Link to={PATHS.SIGNUP}>Continuar na contratação</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
