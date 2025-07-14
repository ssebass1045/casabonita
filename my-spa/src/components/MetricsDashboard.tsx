// File: my-spa/src/components/MetricsDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Sector, ResponsiveContainerProps } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


// --- INTERFACES PARA LAS MÉTRICAS ---
interface TopServiceMetric {
  serviceName: string;
  count: number;
}

interface TopProductMetric {
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

interface AppointmentStatusCount {
  status: string;
  count: number;
}

interface EmployeePerformance {
  employeeName: string;
  appointmentsCount: number;
  totalIncome: number;
}

// --- NUEVA INTERFAZ ---
interface MonthlyIncomeTrend {
  month: string;
  totalIncome: number;
}

interface UpcomingBirthday {
  id: number;
  name: string;
  dateOfBirth: string; // ej. "15 de julio"
  daysUntilBirthday: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']; // Colores para gráficos

const MetricsDashboard = () => {
  // --- ESTADOS PARA LAS MÉTRICAS ---
  const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
  const [dailyIncome, setDailyIncome] = useState<number | null>(null);
  const [productSalesIncome, setProductSalesIncome] = useState<number | null>(null);
  const [topServices, setTopServices] = useState<TopServiceMetric[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductMetric[]>([]);
  const [appointmentStatusCounts, setAppointmentStatusCounts] = useState<AppointmentStatusCount[]>([]);
  const [newClientsCount, setNewClientsCount] = useState<number | null>(null);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [monthlyIncomeTrend, setMonthlyIncomeTrend] = useState<MonthlyIncomeTrend[]>([]); // <-- NUEVO ESTADO

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyProductSalesIncome, setDailyProductSalesIncome] = useState<number | null>(null); // <-- NUEVO ESTADO
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<UpcomingBirthday[]>([]); 


  // --- RANGO DE FECHAS PARA LAS MÉTRICAS ---
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.toISOString().split('T')[0];

  // Para métricas de "últimos 30 días"
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Usamos Promise.all para cargar todas las métricas en paralelo
        const [
          monthlyIncomeRes,
          dailyIncomeRes,
          topServicesRes,
          statusCountsRes,
          newClientsRes,
          employeePerformanceRes,
          productSalesIncomeRes, // <-- NUEVA PETICIÓN
          topProductsRes, // <-- NUEVA PETICIÓN
          dailyProductSalesIncomeRes, // <-- NUEVA 
          monthlyTrendRes,
          upcomingBirthdaysRes,
        ] = await Promise.all([
          axios.get<number>(`${API_BASE_URL}/metrics/income/monthly`, { params: { year: currentYear, month: currentMonth } }),
          axios.get<number>(`${API_BASE_URL}/metrics/income/daily`, { params: { date: currentDay } }),
          axios.get<TopServiceMetric[]>(`${API_BASE_URL}/metrics/services/top`),
          axios.get<any[]>(`${API_BASE_URL}/metrics/appointments/status-counts`, { params: { startDate: startDateStr, endDate: endDateStr } }),
          axios.get<number>(`${API_BASE_URL}/metrics/clients/new-count`, { params: { startDate: startDateStr, endDate: endDateStr } }),
          axios.get<any[]>(`${API_BASE_URL}/metrics/employees/performance`, { params: { startDate: startDateStr, endDate: endDateStr } }),
          axios.get<number>(`${API_BASE_URL}/metrics/products/sales-income`, { params: { startDate: startDateStr, endDate: endDateStr } }),
          axios.get<TopProductMetric[]>(`${API_BASE_URL}/metrics/products/top-selling`),
          axios.get<number>(`${API_BASE_URL}/metrics/products/sales-income/daily`, { params: { date: currentDay } }), // <-- NUEVA PETICIÓN
          axios.get<MonthlyIncomeTrend[]>(`${API_BASE_URL}/metrics/income/monthly-trend`),
          axios.get<UpcomingBirthday[]>(`${API_BASE_URL}/metrics/clients/upcoming-birthdays`),
        ]);

        // Actualizar estados
        setMonthlyIncome(monthlyIncomeRes.data);
        setDailyIncome(dailyIncomeRes.data);
        setTopServices(topServicesRes.data);
        setDailyProductSalesIncome(dailyProductSalesIncomeRes.data); 
        setMonthlyIncomeTrend(monthlyTrendRes.data);
        setUpcomingBirthdays(upcomingBirthdaysRes.data);
        
        // Parsear los datos que vienen como string desde el backend
        setAppointmentStatusCounts(statusCountsRes.data.map(item => ({ ...item, count: parseInt(item.count, 10) })));
        setNewClientsCount(newClientsRes.data);
        setEmployeePerformance(employeePerformanceRes.data.map(item => ({
          ...item,
          appointmentsCount: parseInt(item.appointmentsCount, 10),
          totalIncome: parseFloat(item.totalIncome),
        })));
        setProductSalesIncome(productSalesIncomeRes.data); // <-- NUEVO ESTADO
        setTopProducts(topProductsRes.data); // <-- NUEVO ESTADO


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
  }, [currentYear, currentMonth, currentDay, startDateStr, endDateStr]); // Dependencias para recargar si la fecha cambia

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
          <h3>💰 Ingreso del Mes (Citas)({currentMonth}/{currentYear})</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>${monthlyIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>☀️ Ingreso del Día (Citas)({currentDay})</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>${dailyIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>🛍️ Ingreso por Productos (últimos 30 días)</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#6f42c1' }}>${productSalesIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {/* ... (widgets existentes) ... */}
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>☀️ Ingreso por Productos (Hoy)</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#6f42c1' }}>${dailyProductSalesIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>🎂 Próximos Cumpleaños</h3>
          {upcomingBirthdays.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {upcomingBirthdays.map(client => (
                <li key={client.id} style={{ marginBottom: '5px' }}>
                  <strong>{client.name}</strong> - {client.dateOfBirth}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay cumpleaños próximos.</p>
          )}
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>👥 Nuevos Clientes (últimos 30 días)</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>{newClientsCount ?? '0'}</p>
        </div>
      </div>
      </div>
      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Gráfico de Servicios Más Solicitados */}
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Crecimiento de Ingresos Mensuales (Citas + Productos)</h3>
          {monthlyIncomeTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyIncomeTrend} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                <Legend />
                <Area type="monotone" dataKey="totalIncome" stroke="#8884d8" fill="#8884d8" name="Ingresos Totales" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos suficientes para mostrar la tendencia de crecimiento.</p>
          )}
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Servicios Más Solicitados</h3>
          {topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceName" angle={-45} textAnchor="end" interval={0} />
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

        {/* Gráfico de Productos Más Vendidos */}
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Productos Más Vendidos</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" angle={-45} textAnchor="end" interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                <YAxis yAxisId="right" orientation="right" stroke="#ffc658" />
                <Tooltip formatter={(value, name) => name === 'Ingresos' ? `$${Number(value).toFixed(2)}` : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="totalQuantitySold" fill="#82ca9d" name="Cantidad Vendida" />
                <Bar yAxisId="right" dataKey="totalRevenue" fill="#ffc658" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos de productos para mostrar.</p>
          )}
        </div>

        {/* Gráfico de Distribución de Estados de Citas */}
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Distribución de Estados de Citas (últimos 30 días)</h3>
          {appointmentStatusCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  >
                  {appointmentStatusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos de estados de citas para mostrar.</p>
          )}
        </div>

        {/* Gráfico de Rendimiento por Empleado */}
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Rendimiento por Empleado (últimos 30 días)</h3>
          {employeePerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeePerformance} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employeeName" angle={-45} textAnchor="end" interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => name === 'Ingresos' ? `$${Number(value).toFixed(2)}` : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="appointmentsCount" fill="#8884d8" name="Citas Realizadas" />
                <Bar yAxisId="right" dataKey="totalIncome" fill="#82ca9d" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos de rendimiento de empleados para mostrar.</p>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
