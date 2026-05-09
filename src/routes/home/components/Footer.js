import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const handlePrivacyClick = () => {
    navigate('/privacy');
  };

  return (
    <footer className="footer" id="support">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Orderix</h3>
            <p className="footer-description">
              A gestão completa que o seu restaurante precisa para crescer e prosperar.
            </p>
            <div className="social-links">
              <a href="#facebook" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/orderix_solutions_oficial/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link" 
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="#fff" strokeWidth="2"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#fff" strokeWidth="2"/>
                </svg>
              </a>
              <a href="#linkedin" className="social-link" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="#whatsapp" className="social-link" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Produto</h4>
            <ul className="footer-links">
              <li><a href="#features">Funcionalidades</a></li>
              <li><a href="#plans">Planos e preços</a></li>
              <li><a href="#demo">Demonstração</a></li>
              <li><a href="#updates">Atualizações</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Empresa</h4>
            <ul className="footer-links">
              <li><a href="#about">Sobre nós</a></li>
              <li><a href="#careers">Carreiras</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#press">Imprensa</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Suporte</h4>
            <ul className="footer-links">
              <li><a href="#help">Central de ajuda</a></li>
              <li><a href="#docs">Documentação</a></li>
              <li><a href="#contact">Fale conosco</a></li>
              <li><a href="#status">Status do sistema</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#terms">Termos de uso</a></li>
              <li><a href="#" onClick={handlePrivacyClick}>Política de privacidade</a></li>
              <li><a href="#cookies">Cookies</a></li>
              <li><a href="#licenses">Licenças</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2025 Orderix - Todos os direitos reservados
          </p>
          <p className="footer-made">
            Feito com ❤️ para estabelecimentos brasileiros
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
