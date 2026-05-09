import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Credenciais de teste
    if (email === 'testes@testes.com' && password === '123456') {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas. Tente: testes@testes.com / 123456');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Acesse seu painel</h2>
          <p>Entre com suas credenciais para gerenciar seu restaurante</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail ou CPF</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit">
            Entrar
          </button>

          <a href="#forgot" className="forgot-link">Esqueci minha senha</a>

          <div className="signup-link">
            Ainda não tem conta? <a href="#signup">Cadastre-se e experimente grátis</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
