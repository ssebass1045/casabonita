// File: my-spa/src/components/Card.tsx
import React from 'react';

interface CardProps {
  imageUrl?: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const Card: React.FC<CardProps> = ({ imageUrl, title, description, buttonText, onButtonClick }) => {
  return (
    <div className="card">
      <img 
        src={imageUrl || 'https://via.placeholder.com/300x220.png?text=Casa+Bonita'} // Placeholder con altura ajustada
        alt={title} 
        className="card-image" 
      />
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        {buttonText && onButtonClick && (
          <button className="card-button" onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
