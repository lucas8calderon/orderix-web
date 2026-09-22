import React from 'react';
import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../landingAssets';
import '../styles/WhatsAppButton.css';

const FloatWhatsAppButton = () => {
  const handleClick = () => {
    openWhatsApp();
  };

  return (
    <div className="wa-float">
      <button
        type="button"
        className="wa-float__btn"
        onClick={handleClick}
        aria-label="Falar com a Weper no WhatsApp"
        title="Falar com a Weper"
      >
        <MessageCircle size={20} aria-hidden="true" />
      </button>
      <span className="wa-float__label" aria-hidden="true">
        Falar com a Weper
      </span>
    </div>
  );
};

export default FloatWhatsAppButton;
