// File: my-spa/src/components/EmployeePayroll.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:3000';

interface Employee {
  id: number;
  name: string;
}

interface PayrollResult {
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  appointmentsCount: number;
  commissionRate: number;
  payment: number;
}

const EmployeePayroll = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [commissionRate, setCommissionRate] = useState<string>('60'); // <-- NUEVO ESTADO para el porcentaje
  const [payrollResult, setPayrollResult] = useState<PayrollResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get<Employee[]>(`${API_BASE_URL}/employees`);
        setEmployees(response.data);
      } catch (err: any) {
        console.error("Error fetching employees:", err);
        toast.error("Error al cargar la lista de empleados.");
      }
    };
    fetchEmployees();
  }, []);

  const handleCalculatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.error(null);
    setPayrollResult(null);

    if (!selectedEmployeeId || !startDate || !endDate || !commissionRate) {
      toast.warn("Por favor, selecciona un empleado, un rango de fechas y una tasa de comisión.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get<PayrollResult>(`${API_BASE_URL}/metrics/employees/${selectedEmployeeId}/payroll`, {
        params: { 
          startDate, 
          endDate,
          commissionRate: commissionRate // <-- Envía la tasa de comisión
        }
      });
      setPayrollResult(response.data);
      toast.success("Liquidación calculada exitosamente.");
    } catch (err: any) {
      console.error("Error calculating payroll:", err);
      if (err.response?.status === 401) {
        toast.error("No tienes autorización para calcular la liquidación.");
      } else if (err.response?.status === 404) {
        toast.error("Empleado no encontrado o no hay datos para el rango de fechas.");
      } else {
        toast.error(err.response?.data?.message || "Error al calcular la liquidación.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Liquidación de Empleados</h2>

      <form onSubmit={handleCalculatePayroll} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', alignItems: 'flex-end' }}>
          {/* Selector de Empleado */}
          <div>
            <label htmlFor="employeeSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Empleado:
            </label>
            <select
              id="employeeSelect"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            >
              <option value="">Selecciona...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Fecha de Inicio */}
          <div>
            <label htmlFor="startDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Fecha Inicio:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
          </div>

          {/* Fecha de Fin */}
          <div>
            <label htmlFor="endDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Fecha Fin:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
          </div>

          {/* Tasa de Comisión */}
          <div>
            <label htmlFor="commissionRate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Comisión (%):
            </label>
            <input
              type="number"
              id="commissionRate"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              min="0"
              max="100"
              step="1"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
          </div>

          {/* Botón Calcular */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-end'
            }}
          >
            {isLoading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>
      </form>

      {/* Resultados de la Liquidación */}
      {payrollResult && (
        <div style={{ padding: '20px', border: '1px solid #28a745', borderRadius: '8px', backgroundColor: '#e6ffe6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Resultados para {payrollResult.employeeName}</h3>
          <p><strong>Período:</strong> {payrollResult.startDate} al {payrollResult.endDate}</p>
          <p><strong>Citas Realizadas y Pagadas:</strong> {payrollResult.appointmentsCount}</p>
          <p><strong>Ingresos Totales Generados:</strong> ${payrollResult.totalIncome.toFixed(2)}</p>
          <p><strong>Tasa de Comisión Aplicada:</strong> {payrollResult.commissionRate}%</p>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#28a745' }}>
            Total a Pagar: ${payrollResult.payment.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeePayroll;
