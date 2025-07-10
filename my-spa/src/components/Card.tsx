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
  const cardStyle: React.CSSProperties = {
    border: '1px solid #eee',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    maxWidth: '300px',
    textAlign: 'center',
    fontFamily: 'sans-serif',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  };

  const contentStyle: React.CSSProperties = {
    padding: '15px',
  };

  const buttonStyle: React.CSSProperties = {
    border: 'none',
    outline: 0,
    display: 'inline-block',
    padding: '10px 25px',
    color: 'white',
    backgroundColor: '#007bff',
    textAlign: 'center',
    cursor: 'pointer',
    width: '100%',
    fontSize: '18px',
    marginTop: '10px',
    borderRadius: '5px',
  };

  return (
    <div style={cardStyle}>
      <img 
        src={imageUrl || 'https://via.placeholder.com/300x200.png?text=Casa+Bonita'} 
        alt={title} 
        style={imageStyle} 
      />
      <div style={contentStyle}>
        <h3>{title}</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>{description}</p>
        {buttonText && onButtonClick && (
          <button style={buttonStyle} onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
