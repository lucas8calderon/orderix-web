import React, { useEffect, useState } from 'react';
import { ThemeToggleButton } from '../../../commons/components/ThemeToggleButton';
import { scrollToId } from '../landingAssets';
import { WeperMark } from './WeperMark';
import '../styles/Header.css';

const NAV_LINKS = [
  { id: 'atendimento', label: 'Produto' },
  { id: 'funcionalidades', label: 'Funcionalidades' },
  { id: 'plans', label: 'Planos' },
  { id: 'faq', label: 'FAQ' },
];

const Header = ({ onLoginClick, onStartClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const goTo = (sectionId) => {
    scrollToId(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <a
          href="#home"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            goTo('home');
          }}
        >
          <WeperMark size={42} />
        </a>

        <button
          type="button"
          className={`mobile-menu-button ${mobileMenuOpen ? 'is-open' : ''}`}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="landing-nav"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="landing-nav" className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <button key={link.id} type="button" onClick={() => goTo(link.id)}>
              {link.label}
            </button>
          ))}
          <button
            type="button"
            className="nav-login-mobile"
            onClick={() => {
              setMobileMenuOpen(false);
              onLoginClick();
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className="nav-cta-mobile"
            onClick={() => {
              setMobileMenuOpen(false);
              onStartClick();
            }}
          >
            Conhecer o Weper
          </button>
        </nav>

        <div className="header-actions">
          <ThemeToggleButton className="home-theme-toggle" />
          <button type="button" className="btn-login" onClick={onLoginClick}>
            Entrar
          </button>
          <button type="button" className="btn-primary" onClick={onStartClick}>
            Conhecer o Weper
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
