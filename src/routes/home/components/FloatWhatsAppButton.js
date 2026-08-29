import React from 'react';
import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../landingAssets';
import '../styles/WhatsAppButton.css';

const FloatWhatsAppButton = () => {
  const handleClick = () => {
    openWhatsApp('Olá! Gostaria de tirar algumas dúvidas sobre o sistema Weper.');
  };

  return (
    <div className="wa-float">
      <button
        type="button"
        className="wa-float__btn"
        onClick={handleClick}
        aria-label="Fale conosco no WhatsApp"
      >
        <span className="wa-float__pulse" aria-hidden="true" />
        <MessageCircle size={26} aria-hidden="true" />
      </button>
      <span className="wa-float__label">Fale conosco</span>
    </div>
  );
};

export default FloatWhatsAppButton;
