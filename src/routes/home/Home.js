import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import ProductsSection from './components/ProductsSection';
import FlowSection from './components/FlowSection';
import { ProductSpotlightSections } from './components/EcosystemSection';
import SegmentsStrip from './components/SegmentsStrip';
import DemoSection from './components/DemoSection';
import NewPlansSection from './components/NewPlansSection';
import FaqSection from './components/FaqSection';
import ConversionSection from './components/ConversionSection';
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

  const handleContactClick = () => {
    openWhatsApp();
  };

  return (
    <div className="home">
      <Header onLoginClick={handleLoginClick} onStartClick={handleContactClick} />
      <main>
        <HeroSection onStartClick={handleContactClick} />
        <ProblemSection />
        <ProductsSection />
        <FlowSection />
        <ProductSpotlightSections />
        <SegmentsStrip />
        <DemoSection />
        <NewPlansSection />
        <FaqSection />
        <ConversionSection onContactClick={handleContactClick} />
      </main>
      <Footer />
      <FloatWhatsAppButton />
    </div>
  );
};

export default Home;
