import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../home/landingAssets';
import { PATHS } from '../../services/accessControl';
import '../home/styles/Footer.css';
import './PrivacyPolicy.css';

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="privacy-policy">
      <header className="privacy-header">
        <div className="privacy-container">
          <button className="back-button" type="button" onClick={() => navigate(PATHS.HOME)}>
            <ArrowLeft size={20} />
            Voltar ao início
          </button>
          <div className="privacy-theme-toggle">
            <ThemeToggleButton className="header-theme-toggle" />
          </div>
          <h1 className="privacy-title">
            <FileText className="privacy-icon" />
            Termos de uso
          </h1>
          <p className="privacy-subtitle">Versão resumida do piloto — agosto de 2026</p>
        </div>
      </header>

      <main className="privacy-content">
        <div className="privacy-container">
          <div className="privacy-intro">
            <p>
              Estes termos são um texto mínimo e honesto enquanto a versão jurídica
              completa não existe. O uso da Weper no piloto é combinado diretamente
              com a equipe. Não substituem aconselhamento legal.
            </p>
          </div>

          <section className="privacy-section">
            <h2 className="section-title">1. O serviço hoje</h2>
            <div className="section-content">
              <p>
                A Weper oferece painel web, app do garçom e fluxo de cozinha (KDS)
                para estabelecimentos. A assinatura é ativada manualmente. Não há
                checkout automático, trial de 14 dias nem processamento de cartão
                na plataforma neste momento.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">2. Conta e responsabilidades</h2>
            <div className="section-content">
              <p>
                Você é responsável por manter o acesso da equipe em segurança e por
                usar o sistema de acordo com a operação combinada. Podemos suspender
                o acesso em caso de uso indevido ou inadimplência, conforme combinado
                no WhatsApp.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">3. Privacidade</h2>
            <div className="section-content">
              <p>
                O tratamento de dados pessoais está descrito na{' '}
                <button type="button" className="footer-link-btn" onClick={() => navigate(PATHS.PRIVACY)}>
                  Política de Privacidade
                </button>
                .
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">4. Contato</h2>
            <div className="section-content">
              <p>Dúvidas sobre estes termos: fale com a Weper no WhatsApp {WHATSAPP_DISPLAY}.</p>
              <button
                type="button"
                className="back-button"
                onClick={() => openWhatsApp('Olá! Gostaria de falar sobre os termos de uso da Weper.')}
              >
                Falar no WhatsApp
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="privacy-footer">
        <div className="privacy-container">
          <p>© 2026 Weper Solutions - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfUse;
