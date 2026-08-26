import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import { ThemeToggleButton } from '../../../commons/components/ThemeToggleButton';

const Header = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <span className="logo-text">Orderix</span>
        </div>

        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button onClick={() => scrollToSection('home')}>Home</button>
          <button onClick={() => scrollToSection('products')}>Produtos</button>
          <button onClick={() => scrollToSection('plans')}>Planos</button>
          <button onClick={() => scrollToSection('support')}>Suporte</button>
          <button
            className="nav-login-mobile"
            onClick={() => {
              setMobileMenuOpen(false);
              onLoginClick();
            }}
          >
            Entrar no painel
          </button>
        </nav>

        <div className="header-actions">
          <ThemeToggleButton className="home-theme-toggle" />
          <button className="btn-login" onClick={onLoginClick}>
            Entrar no painel
          </button>
          <button className="btn-primary" onClick={() => scrollToSection('plans')}>
            Testar agora
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
