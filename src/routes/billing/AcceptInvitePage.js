import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../home/styles/Rebrand.css';

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const tokenFromLink = useMemo(() => params.get('token') || '', [params]);
  const [token, setToken] = useState(tokenFromLink);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password.trim().length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('A confirmação da senha não confere.');
      return;
    }
    if (!token.trim()) {
      setError('Cole o código do convite.');
      return;
    }
    setPending(true);
    try {
      await axios.post('/api/auth/invite/accept', {
        token: token.trim(),
        password: password.trim(),
      });
      setDone(true);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Não foi possível definir a senha.';
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="wp-site">
      <section className="wp-section">
        <div className="wp-container" style={{ maxWidth: 720 }}>
          <Link to="/login">Ir para o login</Link>
          <h1>Definir senha</h1>
          <p>O convite vale uma vez e expira em 24 horas. Depois disso, entre com o e-mail do responsável financeiro.</p>
          {done ? (
            <div>
              <h2>Senha definida</h2>
              <p>A loja já pode ser acessada.</p>
              <Link to="/login">Entrar</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="token">Código do convite</label>
              <input id="token" value={token} onChange={(event) => setToken(event.target.value)} required />
              <label htmlFor="password">Senha</label>
              <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <label htmlFor="confirmation">Confirmar senha</label>
              <input id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
              {error ? <p role="alert">{error}</p> : null}
              <button className="wp-button wp-button--primary" type="submit" disabled={pending}>
                {pending ? 'Salvando' : 'Definir senha'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
