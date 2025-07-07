// File: my-spa/src/components/MetricsDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Importaciones para gráficos (si usas Recharts)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE_URL = 'http://localhost:3000';

interface TopServiceMetric {
  serviceName: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']; // Colores para gráficos

const MetricsDashboard = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [dailyIncome, setDailyIncome] = useState<number | null>(null);
  const [topServices, setTopServices] = useState<TopServiceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener el año y mes actual para las métricas por defecto
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth() es 0-indexado
  const currentDay = today.toISOString().split('T')[0]; // YYYY-MM-DD

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Monthly Income
        const monthlyIncomeRes = await axios.get<number>(`${API_BASE_URL}/metrics/income/monthly`, {
          params: { year: currentYear, month: currentMonth }
        });
        setMonthlyIncome(monthlyIncomeRes.data);

        // Fetch Daily Income
        const dailyIncomeRes = await axios.get<number>(`${API_BASE_URL}/metrics/income/daily`, {
          params: { date: currentDay }
        });
        setDailyIncome(dailyIncomeRes.data);

        // Fetch Top Services
        const topServicesRes = await axios.get<TopServiceMetric[]>(`${API_BASE_URL}/metrics/services/top`);
        setTopServices(topServicesRes.data);

      } catch (err: any) {
        console.error("Error fetching metrics:", err);
        if (err.response?.status === 401) {
          setError("No tienes autorización para ver las métricas. Por favor, inicia sesión nuevamente.");
        } else {
          setError(err.message || "Error al cargar las métricas.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [currentYear, currentMonth, currentDay]); // Dependencias para recargar si la fecha cambia

  if (isLoading) {
    return <div>Cargando métricas...</div>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Panel de Métricas</h2>

      {/* Widgets Rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>💰 Ingreso del Mes ({currentMonth}/{currentYear})</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>${monthlyIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>☀️ Ingreso del Día ({currentDay})</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>${dailyIncome?.toFixed(2) || '0.00'}</p>
        </div>
        {/* Puedes añadir más widgets aquí */}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Gráfico de Servicios Más Solicitados */}
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Servicios Más Solicitados</h3>
          {topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceName" angle={-45} textAnchor="end" height={80} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Cantidad de Citas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos de servicios para mostrar.</p>
          )}
        </div>

        {/* Placeholder para otros gráficos (ej. Ingresos Mensuales en el tiempo) */}
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Otros Gráficos (Próximamente)</h3>
          <p>Aquí se podrían añadir gráficos de ingresos mensuales, clientes frecuentes, etc.</p>
          {/* Ejemplo de PieChart si tuvieras datos de distribución */}
          {/*
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[{ name: 'Grupo A', value: 400 }, { name: 'Grupo B', value: 300 }, { name: 'Grupo C', value: 300 }]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          */}
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
