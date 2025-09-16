import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface AdditionalPaymentFormProps {
  clientPackId: number;
  clientName: string;
  packName: string;
  currentAmountPaid: number;
  totalPrice: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const AdditionalPaymentForm: React.FC<AdditionalPaymentFormProps> = ({
  clientPackId,
  clientName,
  packName,
  currentAmountPaid,
  totalPrice,
  onSuccess,
  onCancel
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Por favor ingrese un monto válido');
      return;
    }

    if (currentAmountPaid + paymentAmount > totalPrice) {
      setError(`El monto excede el precio total del paquete. Máximo permitido: $${(totalPrice - currentAmountPaid).toFixed(2)}`);
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/services-pack-payments`, {
        clientServicesPackId: clientPackId,
        amount: paymentAmount,
        paymentMethod,
        notes: notes.trim() || undefined
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error al procesar el pago:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingAmount = totalPrice - currentAmountPaid;

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h3>Abonar a Paquete</h3>
      
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <p><strong>Cliente:</strong> {clientName}</p>
        <p><strong>Paquete:</strong> {packName}</p>
        <p><strong>Pagado:</strong> ${currentAmountPaid.toFixed(2)}</p>
        <p><strong>Precio Total:</strong> ${totalPrice.toFixed(2)}</p>
        <p><strong>Por Pagar:</strong> ${remainingAmount.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Monto del Abono:
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            max={remainingAmount}
            step="0.01"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Método de Pago:
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="notes" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Notas (Opcional):
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Procesando...' : 'Abonar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalPaymentForm;