import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SegmentsStrip from './components/SegmentsStrip';
import { ProductSpotlightSections } from './components/EcosystemSection';
import ProductsSection from './components/ProductsSection';
import BenefitsSection from './components/BenefitsSection';
import DemoSection from './components/DemoSection';
import NewPlansSection from './components/NewPlansSection';
import FaqSection from './components/FaqSection';
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
    openWhatsApp('Olá! Quero conhecer o Weper para o meu negócio.');
  };

  return (
    <div className="home">
      <Header onLoginClick={handleLoginClick} onStartClick={handleStartClick} />
      <main>
        <HeroSection onStartClick={handleStartClick} />
        <SegmentsStrip />
        <ProductSpotlightSections />
        <ProductsSection />
        <BenefitsSection />
        <DemoSection />
        <NewPlansSection />
        <FaqSection />
      </main>
      <Footer />
      <FloatWhatsAppButton />
    </div>
  );
};

export default Home;
