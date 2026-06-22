// File: my-spa/src/components/Card.tsx
import React from "react";

interface CardProps {
  imageUrl?: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  eyebrow?: string;
  badge?: string;
}

const Card: React.FC<CardProps> = ({
  imageUrl,
  title,
  description,
  buttonText,
  onButtonClick,
  className,
  eyebrow,
  badge,
}) => {
  return (
    <div className={["card", className].filter(Boolean).join(" ")}>
      <div className="card-media">
        <img
          src={
            imageUrl ||
            "https://via.placeholder.com/300x220.png?text=Casa+Bonita"
          }
          alt={title}
          className="card-image"
          loading="lazy"
          decoding="async"
        />
        {badge && <div className="card-badge">{badge}</div>}
      </div>
      <div className="card-content">
        {eyebrow && <div className="card-eyebrow">{eyebrow}</div>}
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
