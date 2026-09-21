import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, FileText, AlertTriangle } from 'lucide-react';
import '../home/styles/Footer.css';
import './PrivacyPolicy.css';
import { ThemeToggleButton } from '../../commons/components/ThemeToggleButton';
import { openWhatsApp, WHATSAPP_DISPLAY } from '../home/landingAssets';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="privacy-policy">
      <header className="privacy-header">
        <div className="privacy-container">
          <button className="back-button" onClick={handleBackToHome}>
            <ArrowLeft size={20} />
            Voltar ao início
          </button>
          <div className="privacy-theme-toggle">
            <ThemeToggleButton className="header-theme-toggle" />
          </div>
          <h1 className="privacy-title">
            <Shield className="privacy-icon" />
            Política de Privacidade
          </h1>
          <p className="privacy-subtitle">
            Última atualização: Janeiro de 2025
          </p>
        </div>
      </header>

      <main className="privacy-content">
        <div className="privacy-container">
          <div className="privacy-intro">
            <p>
              A Weper Solutions valoriza a privacidade e segurança dos dados de nossos usuários. 
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
              suas informações pessoais quando você utiliza nossos serviços.
            </p>
          </div>

          <section className="privacy-section">
            <h2 className="section-title">
              <Eye className="section-icon" />
              1. Informações que Coletamos
            </h2>
            <div className="section-content">
              <h3>Informações fornecidas por você:</h3>
              <ul>
                <li>Dados de cadastro (nome, email, telefone)</li>
                <li>Informações do estabelecimento (nome, endereço, CNPJ)</li>
                <li>Comunicações com nosso suporte</li>
              </ul>

              <h3>Informações coletadas automaticamente:</h3>
              <ul>
                <li>Dados de uso da plataforma</li>
                <li>Informações de dispositivo e navegador</li>
                <li>Endereço IP e localização aproximada</li>
                <li>Cookies e tecnologias similares</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">
              <Database className="section-icon" />
              2. Como Utilizamos suas Informações
            </h2>
            <div className="section-content">
              <ul>
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Registrar formas de pagamento informadas no fechamento do pedido</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Oferecer suporte técnico e atendimento</li>
                <li>Desenvolver novos recursos e funcionalidades</li>
                <li>Garantir a segurança e prevenir fraudes</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">
              <Lock className="section-icon" />
              3. Segurança dos Dados
            </h2>
            <div className="section-content">
              <p>
                Implementamos medidas de segurança técnicas, administrativas e físicas para 
                proteger suas informações contra acesso não autorizado, alteração, divulgação 
                ou destruição.
              </p>
              <ul>
                <li>Criptografia SSL/TLS para transmissão de dados</li>
                <li>Armazenamento seguro em servidores certificados</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backup regular e recuperação de desastres</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">
              <UserCheck className="section-icon" />
              4. Compartilhamento de Informações
            </h2>
            <div className="section-content">
              <p>
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                exceto nas seguintes situações:
              </p>
              <ul>
                <li>Com seu consentimento explícito</li>
                <li>Para provedores de serviços essenciais (com acordos de confidencialidade)</li>
                <li>Para cumprir obrigações legais ou responder a processos judiciais</li>
                <li>Para proteger direitos, propriedade ou segurança da Weper e usuários</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">
              <FileText className="section-icon" />
              5. Seus Direitos
            </h2>
            <div className="section-content">
              <p>
                Você tem os seguintes direitos sobre suas informações pessoais:
              </p>
              <ul>
                <li><strong>Acesso:</strong> Solicitar uma cópia dos dados que temos sobre você</li>
                <li><strong>Retificação:</strong> Corrigir informações incorretas ou incompletas</li>
                <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados pessoais</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
                <li><strong>Limitação:</strong> Restringir como processamos suas informações</li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">
              <AlertTriangle className="section-icon" />
              6. Cookies e Tecnologias Similares
            </h2>
            <div className="section-content">
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
                analisar o uso da plataforma e personalizar conteúdo.
              </p>
              <ul>
                <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico</li>
                <li><strong>Cookies de Performance:</strong> Coletam informações sobre uso</li>
                <li><strong>Cookies de Funcionalidade:</strong> Lembram suas preferências</li>
                <li><strong>Cookies de Marketing:</strong> Personalizam anúncios e conteúdo</li>
              </ul>
              <p>
                Você pode gerenciar suas preferências de cookies através das configurações 
                do seu navegador.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">7. Retenção de Dados</h2>
            <div className="section-content">
              <p>
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir 
                as finalidades descritas nesta política, a menos que um período de retenção 
                mais longo seja exigido ou permitido por lei.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">8. Alterações nesta Política</h2>
            <div className="section-content">
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
                sobre mudanças significativas através do email cadastrado ou por meio de 
                aviso na plataforma.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="section-title">9. Contato</h2>
            <div className="section-content">
              <p>
                Para questões relacionadas a esta Política de Privacidade ou para exercer 
                seus direitos, entre em contato conosco:
              </p>
              <div className="contact-info">
                <p>WhatsApp: {WHATSAPP_DISPLAY}</p>
                <button
                  type="button"
                  className="back-button"
                  onClick={() => openWhatsApp('Olá! Gostaria de falar sobre a política de privacidade da Weper.')}
                >
                  Falar no WhatsApp
                </button>
              </div>
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

export default PrivacyPolicy;
