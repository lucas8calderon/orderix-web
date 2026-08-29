import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WeperMark } from './WeperMark';
import { openWhatsApp, scrollToId } from '../landingAssets';
import { PATHS } from '../../../services/accessControl';
import '../styles/Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const goSection = (id) => (e) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <footer className="footer" id="support">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <WeperMark size={44} />
            <p className="footer-description">
              Soluções inteligentes para estabelecimentos que querem crescer com
              eficiência e controle da operação.
            </p>
            <div className="social-links">
              {/* TODO(rebrand): Instagram ainda aponta para perfil legado até existir Weper. */}
              <a
                href="https://www.instagram.com/orderix_solutions_oficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <button
                type="button"
                className="social-link"
                aria-label="WhatsApp"
                onClick={() => openWhatsApp('Olá! Gostaria de falar com a Weper.')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Produto</h4>
            <ul className="footer-links">
              <li><a href="#produto" onClick={goSection('produto')}>Funcionalidades</a></li>
              <li><a href="#app-garcom" onClick={goSection('app-garcom')}>App do Garçom</a></li>
              <li><a href="#kds" onClick={goSection('kds')}>Sistema KDS</a></li>
              <li><a href="#autoatendimento" onClick={goSection('autoatendimento')}>Autoatendimento</a></li>
              <li><a href="#painel" onClick={goSection('painel')}>Painel Admin</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Soluções</h4>
            <ul className="footer-links">
              <li><a href="#solucoes" onClick={goSection('solucoes')}>Restaurantes</a></li>
              <li><a href="#solucoes" onClick={goSection('solucoes')}>Bares</a></li>
              <li><a href="#solucoes" onClick={goSection('solucoes')}>Cafeterias</a></li>
              <li><a href="#solucoes" onClick={goSection('solucoes')}>Lanchonetes</a></li>
              <li><a href="#solucoes" onClick={goSection('solucoes')}>Outros segmentos</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Recursos</h4>
            <ul className="footer-links">
              <li><a href="#recursos" onClick={goSection('recursos')}>Ferramentas</a></li>
              <li><a href="#plans" onClick={goSection('plans')}>Planos e preços</a></li>
              <li><a href="#faq" onClick={goSection('faq')}>Central de dúvidas</a></li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => openWhatsApp('Olá! Quero uma demonstração da Weper.')}>
                  Demonstração
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Empresa</h4>
            <ul className="footer-links">
              <li><a href="#empresa" onClick={goSection('empresa')}>Sobre nós</a></li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => openWhatsApp('Olá! Gostaria de falar com a Weper.')}>
                  Contato
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Legal</h4>
            <ul className="footer-links">
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => navigate(PATHS.PRIVACY)}
                >
                  Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => navigate(PATHS.TERMS)}
                >
                  Termos de uso
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 Weper Solutions. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
