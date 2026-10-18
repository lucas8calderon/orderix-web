import { Link } from 'react-router-dom';
import '../home/styles/Rebrand.css';

/** Retorno da fatura Asaas. Abrir esta página não consulta pagamento nem ativa a loja. */
export default function SignupReturnPage() {
  return (
    <main className="wp-site">
      <section className="wp-section">
        <div className="wp-container" style={{ maxWidth: 720 }}>
          <Link to="/">Voltar</Link>
          <h1>Pagamento em confirmação</h1>
          <p>Voltar da fatura não ativa a loja. O convite chega depois que o pagamento for confirmado.</p>
          <p>A loja ainda não está ativa.</p>
        </div>
      </section>
    </main>
  );
}
