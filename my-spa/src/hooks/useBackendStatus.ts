// File: my-spa/src/hooks/useBackendStatus.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const useBackendStatus = () => {
  const [isBackendReady, setIsBackendReady] = useState<boolean | null>(null);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const checkBackendStatus = async (): Promise<boolean> => {
    try {
      // Endpoint simple que debería responder rápido si el backend está activo
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000 // 5 segundos de timeout
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const wakeBackend = async (): Promise<boolean> => {
    setIsWakingUp(true);
    try {
      // Intentar una llamada que active el backend
      await axios.get(`${API_BASE_URL}/`, {
        timeout: 30000 // 30 segundos para despertar
      });
      return true;
    } catch (error) {
      // Even if it fails, the backend might be waking up
      return false;
    } finally {
      setIsWakingUp(false);
    }
  };

  useEffect(() => {
    const initializeBackend = async () => {
      const isReady = await checkBackendStatus();
      
      if (!isReady) {
        setIsBackendReady(false);
        // Intentar despertar el backend
        await wakeBackend();
        // Verificar nuevamente después de un tiempo
        setTimeout(async () => {
          const ready = await checkBackendStatus();
          setIsBackendReady(ready);
        }, 10000);
      } else {
        setIsBackendReady(true);
      }
    };

    initializeBackend();
  }, []);

  return { isBackendReady, isWakingUp };
};