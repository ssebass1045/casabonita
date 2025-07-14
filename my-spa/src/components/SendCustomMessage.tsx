// File: my-spa/src/components/SendCustomMessage.tsx
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


enum Gender {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  OTRO = 'Otro',
  PREFIERO_NO_DECIR = 'Prefiero no decir',
}

const SendCustomMessage = () => {
  const [message, setMessage] = useState<string>('');
  const [ageMin, setAgeMin] = useState<string>('');
  const [ageMax, setAgeMax] = useState<string>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [image, setImage] = useState<File | null>(null); // <-- NUEVO ESTADO para el archivo
  const [isSending, setIsSending] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResponseMessage(null);
    setError(null);

    try {
      if (!message.trim()) {
        throw new Error('El mensaje no puede estar vacío.');
      }

      // --- MODIFICADO: Usar FormData para enviar archivos ---
      const submitData = new FormData();
      submitData.append('message', message);

      if (ageMin.trim()) submitData.append('ageMin', ageMin);
      if (ageMax.trim()) submitData.append('ageMax', ageMax);
      if (gender) submitData.append('gender', gender);

      // Añadir la imagen si se seleccionó
      if (image) {
        submitData.append('image', image);
      }

      // Enviar como multipart/form-data
      const response = await axios.post(`${API_BASE_URL}/whatsapp/send-custom-message`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResponseMessage(`Mensajes enviados: ${response.data.sent}. Mensajes fallidos: ${response.data.failed}.`);
      setMessage('');
      setAgeMin('');
      setAgeMax('');
      setGender('');
      setImage(null);
      // Limpiar el input de archivo visualmente
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      console.error("Error sending custom message:", err);
      if (err.response?.status === 401) {
        setError("No tienes autorización para enviar mensajes.");
      } else if (err.response?.status === 400) {
        const backendMessage = err.response?.data?.message;
        if (Array.isArray(backendMessage)) {
          setError(`Errores de validación: ${backendMessage.join(', ')}`);
        } else {
          setError(backendMessage || 'Error de validación en los datos enviados.');
        }
      } else {
        setError(err.message || "Error al enviar el mensaje personalizado.");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h2>Enviar Mensaje Personalizado por WhatsApp</h2>
      <p>Envía mensajes a clientes filtrados por edad y género.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        {responseMessage && (
          <div style={{ color: 'green', marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
            {responseMessage}
          </div>
        )}

        {/* Campo Mensaje */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Mensaje *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>

        {/* --- NUEVO CAMPO: Subida de Imagen --- */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="image-upload" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Imagen (Opcional)
          </label>
          <input
            type="file"
            id="image-upload"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {image && (
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Archivo seleccionado: {image.name}
            </p>
          )}
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: '20px', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0 }}>Filtros de Clientes (Opcional)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {/* Edad Mínima */}
            <div>
              <label htmlFor="ageMin" style={{ display: 'block', marginBottom: '5px' }}>Edad Mínima:</label>
              <input
                type="number"
                id="ageMin"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                min="0"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            {/* Edad Máxima */}
            <div>
              <label htmlFor="ageMax" style={{ display: 'block', marginBottom: '5px' }}>Edad Máxima:</label>
              <input
                type="number"
                id="ageMax"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                min="0"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            {/* Género */}
            <div>
              <label htmlFor="gender" style={{ display: 'block', marginBottom: '5px' }}>Género:</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="">Todos</option>
                {Object.values(Gender).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botón Enviar */}
        <button
          type="submit"
          disabled={isSending}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: isSending ? '#ccc' : '#28a745',
            color: 'white',
            borderRadius: '4px',
            cursor: isSending ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {isSending ? 'Enviando Mensajes...' : 'Enviar Mensaje a Clientes'}
        </button>
      </form>
    </div>
  );
};

export default SendCustomMessage;
