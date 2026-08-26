import React, { useState } from 'react';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import TargetAudienceSection from './components/TargetAudienceSection';
import FeaturesListSection from './components/FeaturesListSection';
import PlansSection from './components/PlansSection';
import Footer from './components/Footer';
import FloatWhatsAppButton from './components/FloatWhatsAppButton';
import './styles/Home.css';

const Home = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleTestClick = () => {
    const plansSection = document.getElementById('plans');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home">
      <Header onLoginClick={handleLoginClick} />
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <HeroSection onTestClick={handleTestClick} />
      <AboutSection />
      <FeaturesSection />
      <TargetAudienceSection />
      <FeaturesListSection />
      <PlansSection />
      <Footer />
      <FloatWhatsAppButton />
    </div>
  );
};

export default Home;
