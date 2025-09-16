// File: my-spa/src/components/BackendWakeupLoader.tsx
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface BackendWakeupLoaderProps {
  isBackendLoading: boolean;
  estimatedTime?: number;
}

const BackendWakeupLoader: React.FC<BackendWakeupLoaderProps> = ({
  isBackendLoading,
  estimatedTime = 45 // segundos estimados
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isBackendLoading) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + (100 / estimatedTime), 100));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isBackendLoading, estimatedTime]);

  if (!isBackendLoading) return null;

  return (
    <div className="backend-wakeup-overlay">
      <div className="backend-wakeup-content">
        <div className="spa-theme-animation">
          <div className="floating-bubbles">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bubble" style={{
                animationDelay: `${i * 0.5}s`,
                left: `${20 + i * 15}%`
              }}></div>
            ))}
          </div>
          <div className="spa-icon">💆‍♀️</div>
        </div>
        
        <LoadingSpinner size="large" />
        
        <div className="wakeup-message">
          <h3>Preparando tu experiencia de spa...</h3>
          <p>Estamos calentando los servicios para darte la mejor atención</p>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>

        <div className="wakeup-tip">
          <small>💡 Tip: Esto solo pasa la primera vez que alguien usa la app hoy</small>
        </div>
      </div>
    </div>
  );
};

export default BackendWakeupLoader;