import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SegmentsStrip from './components/SegmentsStrip';
import EcosystemSection, { ProductSpotlightSections } from './components/EcosystemSection';
import BenefitsSection from './components/BenefitsSection';
import ProductsSection from './components/ProductsSection';
import ResourcesSection from './components/ResourcesSection';
import OperationFlowSection from './components/OperationFlowSection';
import HowItWorksSection from './components/HowItWorksSection';
import PlansSection from './components/PlansSection';
import FaqSection from './components/FaqSection';
import AboutSection from './components/AboutSection';
import FinalCtaSection from './components/FinalCtaSection';
import Footer from './components/Footer';
import FloatWhatsAppButton from './components/FloatWhatsAppButton';
import { PATHS } from '../../services/accessControl';
import { openWhatsApp } from './landingAssets';
import './styles/Home.css';
import './styles/Landing.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate(PATHS.LOGIN);
  };

  const handleStartClick = () => {
    openWhatsApp('Olá! Quero começar a usar a Weper no meu estabelecimento.');
  };

  const handleDemoClick = () => {
    openWhatsApp('Olá! Gostaria de falar com a Weper sobre o sistema.');
  };

  return (
    <div className="home">
      <Header onLoginClick={handleLoginClick} onStartClick={handleStartClick} />
      <main>
        <HeroSection onStartClick={handleStartClick} onDemoClick={handleDemoClick} />
        <SegmentsStrip />
        <EcosystemSection />
        <ProductSpotlightSections />
        <BenefitsSection />
        <ProductsSection />
        <ResourcesSection />
        <OperationFlowSection />
        <HowItWorksSection />
        <PlansSection />
        <FaqSection />
        <AboutSection />
        <FinalCtaSection onStartClick={handleStartClick} />
      </main>
      <Footer />
      <FloatWhatsAppButton />
    </div>
  );
};

export default Home;
